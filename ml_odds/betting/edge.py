"""
Edge detection: compare model probabilities to bookmaker implied probabilities.

An edge exists when the model assigns a meaningfully higher probability to an
outcome than the bookmaker's line implies (after removing vig).

Usage:
    from ml_odds.betting.edge import EdgeDetector

    detector = EdgeDetector(min_edge=0.03)
    signals = detector.find_edges(games_df, model)
    for s in signals:
        print(s)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

import numpy as np
import pandas as pd

from ml_odds.features.engineering import FEATURE_COLS, remove_vig

logger = logging.getLogger(__name__)


@dataclass
class BettingSignal:
    """A single betting opportunity identified by the edge detector."""

    event_id: str
    home_team: str
    away_team: str
    side: str                    # "home" or "away"
    model_prob: float            # calibrated model probability
    implied_prob: float          # vig-adjusted bookmaker probability
    edge: float                  # model_prob - implied_prob
    home_price: float            # American odds for home team
    away_price: float            # American odds for away team
    extra: dict[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        price = self.home_price if self.side == "home" else self.away_price
        team = self.home_team if self.side == "home" else self.away_team
        return (
            f"[EDGE {self.edge:+.1%}] {team} ({price:+.0f}) | "
            f"model={self.model_prob:.1%}  implied={self.implied_prob:.1%} | "
            f"{self.home_team} vs {self.away_team}"
        )


class EdgeDetector:
    """Identifies games where the model has a meaningful edge over the market.

    Args:
        min_edge: Minimum probability edge required to flag a signal.
                  Default 0.03 (3 percentage points).
    """

    def __init__(self, min_edge: float = 0.03) -> None:
        self.min_edge = min_edge

    def find_edges(
        self,
        features: pd.DataFrame,
        model: Any,
    ) -> list[BettingSignal]:
        """Scan *features* for games where the model outperforms the market.

        Args:
            features: Feature DataFrame as returned by
                      :func:`ml_odds.features.engineering.build_features`.
                      Must contain the columns in ``FEATURE_COLS`` plus
                      ``implied_home_prob``, ``implied_away_prob``,
                      ``home_price``, ``away_price``.
            model: A fitted :class:`ml_odds.models.trainer.WinProbabilityModel`
                   or any object with a ``predict_home_win_prob(X)`` method.

        Returns:
            List of :class:`BettingSignal` objects sorted by edge (descending).
        """
        missing = [c for c in FEATURE_COLS if c not in features.columns]
        if missing:
            raise ValueError(f"Feature DataFrame is missing columns: {missing}")

        X = features[FEATURE_COLS].fillna(0.5)
        home_probs: np.ndarray = model.predict_home_win_prob(X)
        away_probs = 1.0 - home_probs

        signals: list[BettingSignal] = []
        for i, (_, row) in enumerate(features.iterrows()):
            implied_home = float(row.get("implied_home_prob", 0.5))
            implied_away = float(row.get("implied_away_prob", 0.5))
            home_price = float(row.get("latest_home_price", row.get("opening_home_price", 0)) or 0)
            away_price = float(row.get("latest_away_price", 0) or row.get("away_price", 0) or 0)

            home_edge = float(home_probs[i]) - implied_home
            away_edge = float(away_probs[i]) - implied_away

            if home_edge >= self.min_edge:
                signals.append(
                    BettingSignal(
                        event_id=str(row.get("event_id", "")),
                        home_team=str(row.get("home_team", "")),
                        away_team=str(row.get("away_team", "")),
                        side="home",
                        model_prob=float(home_probs[i]),
                        implied_prob=implied_home,
                        edge=home_edge,
                        home_price=home_price,
                        away_price=away_price,
                    )
                )

            if away_edge >= self.min_edge:
                signals.append(
                    BettingSignal(
                        event_id=str(row.get("event_id", "")),
                        home_team=str(row.get("home_team", "")),
                        away_team=str(row.get("away_team", "")),
                        side="away",
                        model_prob=float(away_probs[i]),
                        implied_prob=implied_away,
                        edge=away_edge,
                        home_price=home_price,
                        away_price=away_price,
                    )
                )

        signals.sort(key=lambda s: s.edge, reverse=True)
        logger.info(
            "Edge detection: %d signals found (min_edge=%.1f%%)", len(signals), self.min_edge * 100
        )
        return signals
