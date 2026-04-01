# ML-Odds
MLOdds.com

A machine learning pipeline for detecting edges in sports betting markets.

## Architecture

```
ml_odds/
├── data/
│   ├── ingestion.py      # Fetch odds + scores from The Odds API
│   └── storage.py        # SQLite models (OddsSnapshot, GameResult)
├── features/
│   └── engineering.py    # Win rates, streaks, rest days, line movement
├── models/
│   └── trainer.py        # XGBoost + Platt-scaling calibration
├── betting/
│   ├── edge.py           # Edge detection (model prob vs implied prob)
│   └── kelly.py          # Fractional Kelly bet sizing
├── backtest/
│   └── framework.py      # Walk-forward backtesting
└── serving/
    └── pipeline.py       # Real-time polling + alerting
```

## Setup

```bash
# 1. Install dependencies
pip install -e ".[dev]"

# 2. Configure your API key
cp .env.example .env
# Edit .env and set ODDS_API_KEY

# 3. Run tests
pytest
```

## Quick Start

### 1 — Ingest historical data

```python
from ml_odds.data.ingestion import OddsIngester

ingester = OddsIngester()
events = ingester.fetch_odds(sport="basketball_nba", markets=["h2h"])
ingester.save_odds(events)

scores = ingester.fetch_scores(sport="basketball_nba", days_from=7)
ingester.save_scores(scores)
```

### 2 — Build features & train the model

```python
import pandas as pd
from sqlalchemy import select
from ml_odds.data.storage import GameResult, OddsSnapshot, get_session
from ml_odds.features.engineering import build_features, FEATURE_COLS
from ml_odds.models.trainer import WinProbabilityModel

with get_session() as s:
    results = pd.read_sql(select(GameResult), s.bind)
    odds    = pd.read_sql(select(OddsSnapshot), s.bind)

features = build_features(results, odds)
X = features[FEATURE_COLS].fillna(0.5)
y = features["home_win"]

model = WinProbabilityModel()
model.fit(X, y)
model.save("model.pkl")
```

### 3 — Backtest

```python
from ml_odds.backtest.framework import Backtester

bt = Backtester(min_train_games=100, retrain_every=20, min_edge=0.03)
results = bt.run(features)
print(results.summary())
```

### 4 — Real-time serving

```python
from ml_odds.serving.pipeline import ServingPipeline

pipeline = ServingPipeline(model_path="model.pkl", sport="basketball_nba")
pipeline.run()   # polls every 5 minutes, prints signals to stdout
```

## Algorithm Overview

| Layer | What it does |
|-------|-------------|
| **Data ingestion** | Pulls live/historical odds and game results from The Odds API |
| **Feature engineering** | Win rates (last 10), streaks, rest days, home/away splits, line movement |
| **Model (XGBoost)** | Binary classifier predicting home-win probability |
| **Calibration** | Platt scaling via `CalibratedClassifierCV` — outputs true probabilities |
| **Edge detection** | Compares calibrated probability to vig-adjusted implied probability |
| **Kelly sizing** | Fractional Kelly (default ¼ Kelly) with a 5% bankroll hard cap |
| **Backtesting** | Walk-forward: train on past, test on future, never look ahead |
| **Serving** | Polls API every N seconds, fires callbacks for each signal |
