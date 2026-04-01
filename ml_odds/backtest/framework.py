"""
Walk-forward backtesting framework.

Simulates the full pipeline — feature engineering → model training →
edge detection → Kelly sizing — on historical data using an expanding
training window so that the model never looks into the future.

Usage:
    from ml_odds.backtest.framework import Backtester

    backtester = Backtester(
        min_train_games=100,
        retrain_every=20,
        min_edge=0.03,
        kelly_fraction=0.25,
    )
    results = backtester.run(features_df)
    print(results.summary())
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score

from ml_odds.betting.edge import BettingSignal, EdgeDetector
from ml_odds.betting.kelly import BetRecommendation, KellyCalculator
from ml_odds.features.engineering import FEATURE_COLS
from ml_odds.models.trainer import WinProbabilityModel

logger = logging.getLogger(__name__)


@dataclass
class BacktestTrade:
    """Record of a single backtested bet."""

    event_id: str
    home_team: str
    away_team: str
    side: str
    model_prob: float
    implied_prob: float
    edge: float
    american_price: float
    bet_fraction: float
    bet_amount: float
    bankroll_before: float
    actual_home_win: int
    won: bool
    pnl: float
    bankroll_after: float


@dataclass
class BacktestResults:
    """Aggregated results from a backtest run."""

    trades: list[BacktestTrade] = field(default_factory=list)
    starting_bankroll: float = 10_000.0

    # ------------------------------------------------------------------
    # Summary statistics
    # ------------------------------------------------------------------

    def summary(self) -> dict:
        if not self.trades:
            return {"error": "No trades were placed"}

        df = pd.DataFrame([t.__dict__ for t in self.trades])
        total_bets = len(df)
        wins = df["won"].sum()
        win_rate = wins / total_bets if total_bets else 0
        total_pnl = df["pnl"].sum()
        final_bankroll = self.trades[-1].bankroll_after
        roi = total_pnl / self.starting_bankroll
        avg_edge = df["edge"].mean()

        # Model quality metrics (on all predicted games, not just bet ones)
        model_probs = df["model_prob"].values
        actuals = df["actual_home_win"].values
        # Adjust for "away" bets — model_prob is for the side bet on
        sides = df["side"].values
        adjusted_probs = np.where(sides == "home", model_probs, 1 - model_probs)
        try:
            auc = roc_auc_score(actuals, adjusted_probs)
            brier = brier_score_loss(actuals, adjusted_probs)
            ll = log_loss(actuals, adjusted_probs)
        except Exception:
            auc, brier, ll = float("nan"), float("nan"), float("nan")

        return {
            "total_bets": total_bets,
            "win_rate": round(win_rate, 4),
            "total_pnl": round(total_pnl, 2),
            "roi": round(roi, 4),
            "final_bankroll": round(final_bankroll, 2),
            "avg_edge": round(avg_edge, 4),
            "auc": round(auc, 4),
            "brier_score": round(brier, 4),
            "log_loss": round(ll, 4),
        }

    def equity_curve(self) -> pd.Series:
        """Return a Series of bankroll values indexed by trade number."""
        values = [self.starting_bankroll] + [t.bankroll_after for t in self.trades]
        return pd.Series(values, name="bankroll")


class Backtester:
    """Walk-forward backtester for the ML-Odds pipeline.

    Args:
        min_train_games: Minimum number of historical games before the first
                         model is trained.
        retrain_every: Retrain the model after every N new games.
        min_edge: Passed to :class:`~ml_odds.betting.edge.EdgeDetector`.
        kelly_fraction: Passed to :class:`~ml_odds.betting.kelly.KellyCalculator`.
        starting_bankroll: Starting bankroll for the simulation.
    """

    def __init__(
        self,
        min_train_games: int = 100,
        retrain_every: int = 20,
        min_edge: float = 0.03,
        kelly_fraction: float = 0.25,
        starting_bankroll: float = 10_000.0,
    ) -> None:
        self.min_train_games = min_train_games
        self.retrain_every = retrain_every
        self.edge_detector = EdgeDetector(min_edge=min_edge)
        self.kelly_fraction = kelly_fraction
        self.starting_bankroll = starting_bankroll

    def run(self, features: pd.DataFrame) -> BacktestResults:
        """Execute the walk-forward backtest.

        Args:
            features: Full feature DataFrame sorted by ``commence_time``.
                      Must contain all ``FEATURE_COLS``, ``home_win``,
                      ``implied_home_prob``, ``implied_away_prob``,
                      and price columns.

        Returns:
            :class:`BacktestResults` containing all trades and summary stats.
        """
        features = features.sort_values("commence_time").reset_index(drop=True)
        results = BacktestResults(starting_bankroll=self.starting_bankroll)
        bankroll = self.starting_bankroll
        model: WinProbabilityModel | None = None
        games_since_last_train = 0

        for i in range(len(features)):
            train_df = features.iloc[:i]
            test_row = features.iloc[[i]]

            # Only start trading once we have enough training data
            if len(train_df) < self.min_train_games:
                continue

            # Retrain periodically
            if model is None or games_since_last_train >= self.retrain_every:
                X_train = train_df[FEATURE_COLS].fillna(0.5)
                y_train = train_df["home_win"]
                if y_train.nunique() < 2:
                    continue
                model = WinProbabilityModel()
                model.fit(X_train, y_train)
                games_since_last_train = 0
                logger.debug("Retrained model on %d games (step %d)", len(train_df), i)

            games_since_last_train += 1

            # Edge detection on the upcoming game
            signals = self.edge_detector.find_edges(test_row, model)
            if not signals:
                continue

            calculator = KellyCalculator(
                bankroll=bankroll,
                kelly_fraction=self.kelly_fraction,
            )
            recommendations = calculator.batch_recommend(signals)

            actual_home_win = int(test_row.iloc[0]["home_win"])

            for rec in recommendations:
                won = (rec.side == "home" and actual_home_win == 1) or (
                    rec.side == "away" and actual_home_win == 0
                )
                dec_odds = (rec.american_price / 100 + 1) if rec.american_price >= 100 else (
                    100 / abs(rec.american_price) + 1
                )
                pnl = rec.bet_amount * (dec_odds - 1) if won else -rec.bet_amount
                bankroll_after = bankroll + pnl

                trade = BacktestTrade(
                    event_id=rec.event_id,
                    home_team=str(test_row.iloc[0].get("home_team", "")),
                    away_team=str(test_row.iloc[0].get("away_team", "")),
                    side=rec.side,
                    model_prob=rec.model_prob,
                    implied_prob=rec.implied_prob,
                    edge=rec.edge,
                    american_price=rec.american_price,
                    bet_fraction=rec.bet_fraction,
                    bet_amount=rec.bet_amount,
                    bankroll_before=bankroll,
                    actual_home_win=actual_home_win,
                    won=won,
                    pnl=pnl,
                    bankroll_after=bankroll_after,
                )
                results.trades.append(trade)
                bankroll = bankroll_after

        logger.info(
            "Backtest complete: %d trades, final bankroll=%.2f",
            len(results.trades),
            bankroll,
        )
        return results
