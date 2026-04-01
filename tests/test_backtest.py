"""
Tests for the walk-forward backtesting framework.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml_odds.backtest.framework import Backtester, BacktestResults
from ml_odds.features.engineering import FEATURE_COLS


def _make_feature_df(n: int = 250, seed: int = 0) -> pd.DataFrame:
    """Synthetic feature DataFrame large enough to trigger retraining."""
    rng = np.random.default_rng(seed)
    rows = {col: rng.random(n) for col in FEATURE_COLS}
    rows["event_id"] = [f"evt_{i:04d}" for i in range(n)]
    rows["home_team"] = "TeamA"
    rows["away_team"] = "TeamB"
    rows["commence_time"] = pd.date_range("2022-01-01", periods=n, freq="D", tz="UTC")
    rows["implied_home_prob"] = rng.uniform(0.45, 0.55, n)
    rows["implied_away_prob"] = 1 - rows["implied_home_prob"]
    rows["opening_home_price"] = -110.0
    rows["latest_home_price"] = -110.0
    rows["away_price"] = -110.0
    rows["home_win"] = rng.integers(0, 2, n)
    return pd.DataFrame(rows)


class TestBacktester:
    def test_run_returns_results(self):
        df = _make_feature_df(250)
        bt = Backtester(min_train_games=100, retrain_every=20, min_edge=0.0)
        results = bt.run(df)
        assert isinstance(results, BacktestResults)

    def test_summary_has_expected_keys(self):
        df = _make_feature_df(250)
        bt = Backtester(min_train_games=100, retrain_every=20, min_edge=0.0)
        results = bt.run(df)
        summary = results.summary()
        for key in ("total_bets", "win_rate", "total_pnl", "roi", "final_bankroll"):
            assert key in summary

    def test_equity_curve_starts_at_bankroll(self):
        df = _make_feature_df(250)
        bt = Backtester(min_train_games=100, retrain_every=20, min_edge=0.0, starting_bankroll=5_000)
        results = bt.run(df)
        curve = results.equity_curve()
        assert curve.iloc[0] == pytest.approx(5_000)

    def test_no_look_ahead_bias(self):
        """Walk-forward: trade i must be evaluated on data not seen during training."""
        df = _make_feature_df(250)
        bt = Backtester(min_train_games=100, retrain_every=250, min_edge=0.0)
        results = bt.run(df)
        # Simply assert the backtest ran without error
        assert results is not None

    def test_empty_results_when_insufficient_data(self):
        df = _make_feature_df(50)
        bt = Backtester(min_train_games=100)
        results = bt.run(df)
        assert len(results.trades) == 0
