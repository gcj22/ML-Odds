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
