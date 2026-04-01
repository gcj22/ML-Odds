"""
Tests for feature engineering utilities.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml_odds.features.engineering import (
    FEATURE_COLS,
    american_to_decimal,
    build_features,
    implied_prob_from_american,
    remove_vig,
)


class TestOddsConversions:
    def test_american_to_decimal_positive(self):
        assert american_to_decimal(100) == pytest.approx(2.0)
        assert american_to_decimal(200) == pytest.approx(3.0)

    def test_american_to_decimal_negative(self):
        assert american_to_decimal(-110) == pytest.approx(100 / 110 + 1, rel=1e-6)

    def test_implied_prob_even_money(self):
        assert implied_prob_from_american(100) == pytest.approx(0.5)

    def test_remove_vig_symmetric(self):
        p_home, p_away = remove_vig(-110, -110)
        assert p_home == pytest.approx(0.5, abs=1e-6)
        assert p_away == pytest.approx(0.5, abs=1e-6)
        assert p_home + p_away == pytest.approx(1.0, abs=1e-6)

    def test_remove_vig_favourite(self):
        p_home, p_away = remove_vig(-200, 160)
        assert p_home > p_away
        assert p_home + p_away == pytest.approx(1.0, abs=1e-6)


def _make_results(n: int = 50, seed: int = 0) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    teams = ["TeamA", "TeamB", "TeamC", "TeamD"]
    rows = []
    for i in range(n):
        home = teams[i % len(teams)]
        away = teams[(i + 1) % len(teams)]
        home_score = int(rng.integers(80, 130))
        away_score = int(rng.integers(80, 130))
        rows.append(
            {
                "event_id": f"evt_{i:04d}",
                "sport": "basketball_nba",
                "home_team": home,
                "away_team": away,
                "commence_time": pd.Timestamp("2024-01-01") + pd.Timedelta(days=i),
                "home_score": home_score,
                "away_score": away_score,
                "home_win": int(home_score > away_score),
            }
        )
    return pd.DataFrame(rows)


def _make_odds(results: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, r in results.iterrows():
        rows.append(
            {
                "event_id": r["event_id"],
                "bookmaker": "draftkings",
                "market": "h2h",
                "home_price": -110.0,
                "away_price": -110.0,
                "fetched_at": r["commence_time"] - pd.Timedelta(hours=2),
            }
        )
    return pd.DataFrame(rows)


class TestBuildFeatures:
    def setup_method(self):
        self.results = _make_results(50)
        self.odds = _make_odds(self.results)

    def test_returns_dataframe(self):
        df = build_features(self.results, self.odds)
        assert isinstance(df, pd.DataFrame)

    def test_correct_row_count(self):
        df = build_features(self.results, self.odds)
        assert len(df) == len(self.results)

    def test_all_feature_cols_present(self):
        df = build_features(self.results, self.odds)
        for col in FEATURE_COLS:
            assert col in df.columns, f"Missing feature column: {col}"

    def test_home_win_present(self):
        df = build_features(self.results, self.odds)
        assert "home_win" in df.columns

    def test_implied_probs_sum_to_one(self):
        df = build_features(self.results, self.odds)
        totals = df["implied_home_prob"] + df["implied_away_prob"]
        assert (totals - 1.0).abs().max() < 1e-6

    def test_win_rates_in_range(self):
        df = build_features(self.results, self.odds)
        for col in ["home_win_rate_l10", "away_win_rate_l10"]:
            assert df[col].between(0, 1).all(), f"{col} out of range"
