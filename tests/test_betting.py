"""
Tests for edge detection and Kelly criterion.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml_odds.betting.edge import BettingSignal, EdgeDetector
from ml_odds.betting.kelly import BetRecommendation, KellyCalculator
from ml_odds.features.engineering import FEATURE_COLS


class _FakeModel:
    """Stub model that always returns a fixed home-win probability."""

    def __init__(self, home_win_prob: float = 0.65) -> None:
        self._p = home_win_prob

    def predict_home_win_prob(self, X):
        return np.full(len(X), self._p)


def _make_features_row(
    implied_home: float = 0.52,
    implied_away: float = 0.48,
    home_price: float = -110.0,
    away_price: float = -110.0,
) -> pd.DataFrame:
    data = {col: [0.5] for col in FEATURE_COLS}
    data.update(
        {
            "event_id": ["evt_001"],
            "home_team": ["TeamA"],
            "away_team": ["TeamB"],
            "commence_time": [pd.Timestamp("2024-03-01")],
            "implied_home_prob": [implied_home],
            "implied_away_prob": [implied_away],
            "opening_home_price": [home_price],
            "latest_home_price": [home_price],
            "away_price": [away_price],
            "home_win": [1],
        }
    )
    return pd.DataFrame(data)


class TestEdgeDetector:
    def test_finds_home_edge(self):
        features = _make_features_row(implied_home=0.52)
        model = _FakeModel(home_win_prob=0.60)  # 8% edge
        detector = EdgeDetector(min_edge=0.05)
        signals = detector.find_edges(features, model)
        home_signals = [s for s in signals if s.side == "home"]
        assert len(home_signals) == 1
        assert home_signals[0].edge == pytest.approx(0.60 - 0.52, abs=1e-6)

    def test_no_signal_below_threshold(self):
        features = _make_features_row(implied_home=0.58)
        model = _FakeModel(home_win_prob=0.60)  # only 2% edge
        detector = EdgeDetector(min_edge=0.05)
        signals = detector.find_edges(features, model)
        assert len(signals) == 0

    def test_signals_sorted_descending(self):
        rows = pd.concat(
            [
                _make_features_row(implied_home=0.40),  # large edge
                _make_features_row(implied_home=0.55),  # small edge
            ],
            ignore_index=True,
        )
        model = _FakeModel(0.65)
        detector = EdgeDetector(min_edge=0.03)
        signals = detector.find_edges(rows, model)
        edges = [s.edge for s in signals if s.side == "home"]
        assert edges == sorted(edges, reverse=True)

    def test_missing_feature_column_raises(self):
        features = _make_features_row()
        features = features.drop(columns=["home_win_rate_l10"])
        model = _FakeModel()
        with pytest.raises(ValueError, match="missing columns"):
            EdgeDetector().find_edges(features, model)


class TestKellyCalculator:
    def test_full_kelly_positive_edge(self):
        calc = KellyCalculator(bankroll=1000)
        fk = calc.full_kelly(model_prob=0.60, decimal_odds=2.0)
        assert fk == pytest.approx(0.20, abs=1e-6)

    def test_full_kelly_no_edge(self):
        calc = KellyCalculator(bankroll=1000)
        fk = calc.full_kelly(model_prob=0.40, decimal_odds=2.0)
        assert fk == 0.0

    def test_recommend_returns_bet(self):
        signal = BettingSignal(
            event_id="evt_001",
            home_team="TeamA",
            away_team="TeamB",
            side="home",
            model_prob=0.65,
            implied_prob=0.52,
            edge=0.13,
            home_price=-110,
            away_price=-110,
        )
        calc = KellyCalculator(bankroll=10_000, kelly_fraction=0.25)
        rec = calc.recommend(signal)
        assert rec is not None
        assert rec.bet_amount > 0
        assert rec.bet_amount <= 10_000 * 0.05  # max bet cap

    def test_max_bet_cap_respected(self):
        signal = BettingSignal(
            event_id="evt_002",
            home_team="A",
            away_team="B",
            side="home",
            model_prob=0.99,  # extreme edge
            implied_prob=0.01,
            edge=0.98,
            home_price=100,
            away_price=100,
        )
        calc = KellyCalculator(bankroll=10_000, kelly_fraction=1.0, max_bet_pct=0.05)
        rec = calc.recommend(signal)
        assert rec is not None
        assert rec.bet_amount <= 10_000 * 0.05 + 1e-6  # within cap

    def test_invalid_bankroll_raises(self):
        with pytest.raises(ValueError):
            KellyCalculator(bankroll=0)

    def test_invalid_kelly_fraction_raises(self):
        with pytest.raises(ValueError):
            KellyCalculator(bankroll=1000, kelly_fraction=0.0)
