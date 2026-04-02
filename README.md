# MLOdds — Betting Intelligence Platform

A modern multi-sport betting intelligence platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Live Scoreboard** — Real-time NHL scores via the official NHL API
- **Upcoming Odds Board** — Best available moneylines across all sports and bookmakers via The Odds API
- **NHL Player Stats** — Season stats for skaters and goalies powered by ESPN
- **Game Center** — Full NHL boxscore, live odds, and model predictions per game
- **Prediction Engine** — Elo-based model generating projected totals, goal differentials, and market edges
- **Caching** — In-memory cache with optional Upstash Redis for production

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (black & gold theme)
- **Data**: NHL.com public API + The Odds API + ESPN
- **Cache**: In-memory Map + optional Upstash Redis
- **Deploy**: Vercel (with cron jobs)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Today hub — live scoreboard + top edges + game cards |
| `/scores` | Full scoreboard with date navigation |
| `/schedule` | Full NHL schedule browser with date picker |
| `/standings` | Conference and division standings with sortable columns |
| `/stats/players` | **NHL player stats** — skaters and goalies, leaders and search (powered by ESPN) |
| `/player/[playerId]` | Individual NHL player profile and season stats |
| `/odds` | **Upcoming odds** — best available moneylines across all sports from The Odds API |
| `/game/[gameId]` | NHL game center — boxscore + odds + predictions |

## Getting Started

### 1. Install dependencies

```bash
# The --legacy-peer-deps flag is required due to peer dependency conflicts
# between React 18 and some dev packages.
npm install --legacy-peer-deps
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `ODDS_API_KEY` | **Yes** (for odds) | Get from [the-odds-api.com](https://the-odds-api.com) |
| `ODDS_API_SPORT` | No | Sport key (default: `upcoming` — all upcoming sports). Use `icehockey_nhl` for NHL only. |
| `ODDS_API_REGION` | No | Bookmaker region (default: `us`) |
| `ODDS_CACHE_TTL` | No | Seconds to cache odds (default: `300`) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for production caching |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token for production caching |

> **Note**: ESPN NHL player stats use publicly available ESPN JSON endpoints and require no API key.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Run tests

```bash
npm test
```

## API Routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/scores?date=YYYY-MM-DD` | NHL schedule/scores |
| `GET /api/odds` | Best moneylines from The Odds API (all upcoming sports) |
| `GET /api/game/[gameId]` | NHL game boxscore + odds + prediction |
| `GET /api/predictions` | Today's model predictions |
| `GET /api/espn/nhl/leaders?category=skaters\|goalies` | NHL stats leaders |
| `GET /api/espn/nhl/players?type=skaters\|goalies&page=N` | Paginated NHL player stats |
| `GET /api/espn/nhl/teams` | NHL team list |
| `GET /api/espn/nhl/teams/[teamId]/roster` | Team roster stats |
| `GET /api/espn/nhl/search?q=query` | Player search |
| `GET /api/cron/daily` | Daily cache refresh (9 AM UTC) |
| `GET /api/cron/pregame` | Pregame refresh (every 10 min) |

## Data Sources

- **NHL Schedule & Scores**: `https://api-web.nhle.com/v1/schedule/now`
- **NHL Boxscore**: `https://api-web.nhle.com/v1/gamecenter/{gameId}/boxscore`
- **NHL Standings**: `https://api-web.nhle.com/v1/standings/now`
- **NHL Player Stats (ESPN)**: `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/statistics`
- **Odds (all sports)**: `https://api.the-odds-api.com/v4/sports/upcoming/odds`

## Deployment (Vercel)

1. Push to GitHub and connect to Vercel.
2. In **Vercel → Settings → Environment Variables**, add:
   - `ODDS_API_KEY` — your The Odds API key
   - Optionally `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Deploy.

Cron jobs are configured in `vercel.json`:
- Daily refresh: 9:00 AM UTC
- Pregame refresh: every 10 minutes

---

# ML-Odds (Python pipeline)

MLOdds.com also includes a Python machine learning pipeline for detecting edges in sports betting markets.

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
