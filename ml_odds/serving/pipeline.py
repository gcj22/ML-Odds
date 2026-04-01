"""
Real-time serving pipeline: polls The Odds API, runs the model, and
surfaces betting signals as they appear.

Usage:
    from ml_odds.serving.pipeline import ServingPipeline

    pipeline = ServingPipeline(
        model_path="model.pkl",
        sport="basketball_nba",
        poll_interval=300,   # seconds between API polls
        min_edge=0.03,
        bankroll=10_000,
    )
    pipeline.run()           # blocks; Ctrl-C to stop

Or as a one-shot check:
    signals = pipeline.check_once()
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Callable

import pandas as pd

from ml_odds.betting.edge import BettingSignal, EdgeDetector
from ml_odds.betting.kelly import BetRecommendation, KellyCalculator
from ml_odds.data.ingestion import OddsIngester
from ml_odds.data.storage import get_session, OddsSnapshot
from ml_odds.features.engineering import FEATURE_COLS, build_features, remove_vig
from ml_odds.models.trainer import WinProbabilityModel

logger = logging.getLogger(__name__)


class ServingPipeline:
    """Continuously polls for new odds and emits betting signals.

    Args:
        model_path: Path to a saved :class:`~ml_odds.models.trainer.WinProbabilityModel`.
        sport: The Odds API sport key (e.g. ``basketball_nba``).
        api_key: The Odds API key. Falls back to ``ODDS_API_KEY`` env var.
        poll_interval: Seconds between polls. Default 300 (5 minutes).
        min_edge: Minimum edge to flag a signal. Default 0.03.
        bankroll: Simulated bankroll for bet sizing. Default 10,000.
        kelly_fraction: Fractional Kelly multiplier. Default 0.25.
        on_signal: Optional callback invoked for each :class:`BettingSignal`.
        on_recommendation: Optional callback invoked for each
                           :class:`BetRecommendation`.
    """

    def __init__(
        self,
        model_path: str | Path,
        sport: str = "basketball_nba",
        api_key: str | None = None,
        poll_interval: int = 300,
        min_edge: float = 0.03,
        bankroll: float = 10_000.0,
        kelly_fraction: float = 0.25,
        on_signal: Callable[[BettingSignal], None] | None = None,
        on_recommendation: Callable[[BetRecommendation], None] | None = None,
    ) -> None:
        self.model = WinProbabilityModel.load(model_path)
        self.sport = sport
        self.ingester = OddsIngester(api_key=api_key)
        self.poll_interval = poll_interval
        self.edge_detector = EdgeDetector(min_edge=min_edge)
        self.kelly = KellyCalculator(bankroll=bankroll, kelly_fraction=kelly_fraction)
        self.on_signal = on_signal or self._default_signal_handler
        self.on_recommendation = on_recommendation or self._default_rec_handler

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def run(self) -> None:
        """Block and poll indefinitely. Press Ctrl-C to stop."""
        logger.info(
            "Starting serving pipeline for %s (poll every %ds)", self.sport, self.poll_interval
        )
        while True:
            try:
                self.check_once()
            except Exception as exc:
                logger.error("Poll failed: %s", exc, exc_info=True)
            time.sleep(self.poll_interval)

    def check_once(self) -> list[BetRecommendation]:
        """Run a single poll cycle and return sized recommendations."""
        logger.info("Polling odds for %s …", self.sport)
        events = self.ingester.fetch_odds(sport=self.sport, markets=["h2h"])
        self.ingester.save_odds(events)

        features = self._build_live_features(events)
        if features.empty:
            logger.info("No actionable games found in current odds.")
            return []

        signals = self.edge_detector.find_edges(features, self.model)
        for s in signals:
            self.on_signal(s)

        recommendations = self.kelly.batch_recommend(signals)
        for r in recommendations:
            self.on_recommendation(r)

        return recommendations

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_live_features(self, events: list[dict]) -> pd.DataFrame:
        """Convert live API events into a feature DataFrame for inference.

        For upcoming (unplayed) games we have no result, so ``home_win``
        is set to -1 (ignored at inference time).
        """
        rows = []
        for event in events:
            home = event.get("home_team", "")
            away = event.get("away_team", "")
            bookmakers = event.get("bookmakers", [])

            home_prices, away_prices = [], []
            for bm in bookmakers:
                for market in bm.get("markets", []):
                    if market["key"] != "h2h":
                        continue
                    outcome_map = {o["name"]: o["price"] for o in market.get("outcomes", [])}
                    hp = outcome_map.get(home)
                    ap = outcome_map.get(away)
                    if hp is not None:
                        home_prices.append(float(hp))
                    if ap is not None:
                        away_prices.append(float(ap))

            if not home_prices or not away_prices:
                continue

            latest_home = float(pd.Series(home_prices).median())
            latest_away = float(pd.Series(away_prices).median())
            implied_home, implied_away = remove_vig(latest_home, latest_away)

            # Pull historical stats from the DB to populate rolling features
            home_stats, away_stats = self._fetch_team_stats(home, away)

            row = {
                "event_id": event["id"],
                "home_team": home,
                "away_team": away,
                "commence_time": event.get("commence_time"),
                "home_win_rate_l10": home_stats.get("win_rate_l10", 0.5),
                "away_win_rate_l10": away_stats.get("win_rate_l10", 0.5),
                "home_streak": home_stats.get("streak", 0),
                "away_streak": away_stats.get("streak", 0),
                "home_rest_days": home_stats.get("rest_days", 7.0),
                "away_rest_days": away_stats.get("rest_days", 7.0),
                "home_away_win_rate": home_stats.get("home_win_rate", 0.5),
                "away_away_win_rate": away_stats.get("away_win_rate", 0.5),
                "opening_home_price": latest_home,
                "latest_home_price": latest_home,
                "line_movement": 0.0,
                "implied_home_prob": implied_home,
                "implied_away_prob": implied_away,
                "home_win": -1,
            }
            rows.append(row)

        return pd.DataFrame(rows)

    def _fetch_team_stats(self, home: str, away: str) -> tuple[dict, dict]:
        """Look up the most recent rolling stats for each team from the DB."""
        from ml_odds.data.storage import GameResult
        from sqlalchemy import select, or_, desc

        home_stats: dict = {}
        away_stats: dict = {}

        with get_session() as session:
            for team, container in [(home, home_stats), (away, away_stats)]:
                stmt = (
                    select(GameResult)
                    .where(
                        or_(GameResult.home_team == team, GameResult.away_team == team)
                    )
                    .order_by(desc(GameResult.commence_time))
                    .limit(20)
                )
                recent_games = session.execute(stmt).scalars().all()
                if not recent_games:
                    continue

                wins = []
                home_wins = []
                away_wins = []
                for g in recent_games:
                    is_home = g.home_team == team
                    won = int(g.home_win) if is_home else (1 - int(g.home_win))
                    wins.append(won)
                    if is_home:
                        home_wins.append(won)
                    else:
                        away_wins.append(won)

                container["win_rate_l10"] = float(pd.Series(wins[:10]).mean()) if wins else 0.5
                container["home_win_rate"] = float(pd.Series(home_wins).mean()) if home_wins else 0.5
                container["away_win_rate"] = float(pd.Series(away_wins).mean()) if away_wins else 0.5

                streak = 0
                if wins:
                    last = wins[0]
                    for w in wins:
                        if w == last:
                            streak += 1 if last else -1
                        else:
                            break
                container["streak"] = streak

                last_game = recent_games[0]
                last_dt = last_game.commence_time
                if last_dt.tzinfo is None:
                    last_dt = last_dt.replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                container["rest_days"] = max(0.0, (now - last_dt).total_seconds() / 86400)

        return home_stats, away_stats

    # ------------------------------------------------------------------
    # Default handlers (print to stdout)
    # ------------------------------------------------------------------

    @staticmethod
    def _default_signal_handler(signal: BettingSignal) -> None:
        print(f"  SIGNAL  → {signal}")

    @staticmethod
    def _default_rec_handler(rec: BetRecommendation) -> None:
        print(f"  RECOMMEND → {rec}")
