"""
Tests for model training and calibration.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml_odds.features.engineering import FEATURE_COLS, build_features
from ml_odds.models.trainer import WinProbabilityModel


def _make_dataset(n: int = 200, seed: int = 42) -> tuple[pd.DataFrame, pd.Series]:
    rng = np.random.default_rng(seed)
    X = pd.DataFrame(
        rng.random(size=(n, len(FEATURE_COLS))),
        columns=FEATURE_COLS,
    )
    y = pd.Series(rng.integers(0, 2, size=n))
    return X, y


class TestWinProbabilityModel:
    def test_fit_and_predict(self):
        X, y = _make_dataset(300)
        model = WinProbabilityModel()
        model.fit(X, y)
        probs = model.predict_proba(X[:10])
        assert probs.shape == (10, 2)

    def test_probs_sum_to_one(self):
        X, y = _make_dataset(300)
        model = WinProbabilityModel()
        model.fit(X, y)
        probs = model.predict_proba(X)
        np.testing.assert_allclose(probs.sum(axis=1), 1.0, atol=1e-6)

    def test_probs_in_range(self):
        X, y = _make_dataset(300)
        model = WinProbabilityModel()
        model.fit(X, y)
        probs = model.predict_proba(X)
        assert (probs >= 0).all() and (probs <= 1).all()

    def test_predict_home_win_prob_shape(self):
        X, y = _make_dataset(300)
        model = WinProbabilityModel()
        model.fit(X, y)
        p = model.predict_home_win_prob(X[:5])
        assert p.shape == (5,)

    def test_raises_before_fit(self):
        X, _ = _make_dataset(10)
        model = WinProbabilityModel()
        with pytest.raises(RuntimeError, match="not fitted"):
            model.predict_proba(X)

    def test_save_and_load(self, tmp_path):
        X, y = _make_dataset(300)
        model = WinProbabilityModel()
        model.fit(X, y)
        path = tmp_path / "model.pkl"
        model.save(path)
        loaded = WinProbabilityModel.load(path)
        np.testing.assert_allclose(
            model.predict_proba(X[:5]),
            loaded.predict_proba(X[:5]),
            atol=1e-8,
        )
