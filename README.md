# MLOdds — NHL Betting Intelligence

A modern NHL-focused betting intelligence platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Live Scoreboard** — Real-time NHL scores via the official NHL API
- **Odds Board** — Best available lines aggregated across all bookmakers via The Odds API
- **Game Center** — Full boxscore, live odds, and model predictions per game
- **Prediction Engine** — Elo-based model generating projected totals, goal differentials, and market edges
- **Caching** — In-memory cache with optional Upstash Redis for production

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (black & gold theme)
- **Data**: NHL.com public API + The Odds API
- **Cache**: In-memory Map + optional Upstash Redis
- **Deploy**: Vercel (with cron jobs)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

- `ODDS_API_KEY` — Get from [the-odds-api.com](https://the-odds-api.com)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Optional, for Redis caching

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Today hub — live scoreboard + top edges + game cards |
| `/scores` | Full scoreboard with date navigation |
| `/odds` | Best available odds across all books |
| `/game/[gameId]` | Game center — boxscore + odds + predictions |

## API Routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/scores?date=YYYY-MM-DD` | NHL schedule/scores |
| `GET /api/odds` | Best lines from The Odds API |
| `GET /api/game/[gameId]` | Game boxscore + odds + prediction |
| `GET /api/predictions` | Today's model predictions |
| `GET /api/cron/daily` | Daily cache refresh (9 AM ET) |
| `GET /api/cron/pregame` | Pregame refresh (every 10 min) |

## Data Sources

- **NHL Schedule & Scores**: `https://api-web.nhle.com/v1/schedule/now`
- **NHL Boxscore**: `https://api-web.nhle.com/v1/gamecenter/{gameId}/boxscore`
- **Odds**: `https://api.the-odds-api.com/v4/sports/icehockey_nhl/odds`

## Prediction Model

The prediction engine uses Elo ratings stored in `data/team_ratings.json`:

- Each team has a rating (default 1500)
- Home ice advantage is configurable (`homeIceAdvantage: 0.1` → +10 Elo points)
- Win probability derived via standard Elo formula
- Projected total goals ≈ 6.0 goals, adjusted by rating difference

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Cron jobs are configured in `vercel.json`:
- Daily refresh: 9:00 AM UTC
- Pregame refresh: every 10 minutes
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
