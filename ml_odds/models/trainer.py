"""
XGBoost model training for win-probability prediction.

The trainer wraps an XGBoost classifier with sklearn's CalibratedClassifierCV
(sigmoid / Platt scaling) so that model.predict_proba() returns
well-calibrated probabilities straight out of the box.

Usage:
    from ml_odds.models.trainer import WinProbabilityModel

    model = WinProbabilityModel()
    model.fit(X_train, y_train)
    probs = model.predict_proba(X_test)   # shape (n, 2): [P(away_win), P(home_win)]
    model.save("model.pkl")
    model2 = WinProbabilityModel.load("model.pkl")
"""

from __future__ import annotations

import logging
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold
from xgboost import XGBClassifier

logger = logging.getLogger(__name__)

DEFAULT_XGB_PARAMS: dict = {
    "n_estimators": 400,
    "max_depth": 4,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 5,
    "eval_metric": "logloss",
    "random_state": 42,
    "n_jobs": -1,
}


class WinProbabilityModel:
    """XGBoost classifier wrapped with Platt-scaling calibration."""

    def __init__(self, xgb_params: dict | None = None) -> None:
        params = {**DEFAULT_XGB_PARAMS, **(xgb_params or {})}
        base = XGBClassifier(**params)
        self.model = CalibratedClassifierCV(
            estimator=base,
            method="sigmoid",
            cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        )
        self._is_fitted = False

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def fit(
        self,
        X: pd.DataFrame | np.ndarray,
        y: pd.Series | np.ndarray,
    ) -> "WinProbabilityModel":
        """Fit the model.

        Args:
            X: Feature matrix. Rows = games, cols = features.
            y: Binary target (1 = home win, 0 = away win).

        Returns:
            self (for chaining).
        """
        logger.info("Training on %d samples with %d features", len(X), X.shape[1] if hasattr(X, "shape") else 0)
        self.model.fit(X, y)
        self._is_fitted = True
        logger.info("Training complete")
        return self

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict_proba(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        """Return calibrated win probabilities.

        Returns:
            Array of shape (n_samples, 2): column 0 = P(away win),
            column 1 = P(home win).
        """
        if not self._is_fitted:
            raise RuntimeError("Model is not fitted yet. Call fit() first.")
        return self.model.predict_proba(X)

    def predict_home_win_prob(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        """Convenience method: return only P(home win) for each row."""
        return self.predict_proba(X)[:, 1]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str | Path) -> None:
        """Serialize the fitted model to *path* (pickle)."""
        with open(path, "wb") as f:
            pickle.dump(self, f)
        logger.info("Model saved to %s", path)

    @classmethod
    def load(cls, path: str | Path) -> "WinProbabilityModel":
        """Load a previously saved model from *path*."""
        with open(path, "rb") as f:
            model = pickle.load(f)
        if not isinstance(model, cls):
            raise TypeError(f"Loaded object is not a {cls.__name__}")
        logger.info("Model loaded from %s", path)
        return model

    def __repr__(self) -> str:
        status = "fitted" if self._is_fitted else "not fitted"
        return f"WinProbabilityModel({status})"
