"""
Data ingestion from The Odds API and storage into a local SQLite database.

Usage:
    from ml_odds.data.ingestion import OddsIngester

    ingester = OddsIngester(api_key="YOUR_KEY")
    odds = ingester.fetch_odds(sport="basketball_nba", markets=["h2h", "spreads", "totals"])
    ingester.save_odds(odds)

Set ODDS_API_KEY in your .env file or environment.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

import requests
from dotenv import load_dotenv

from ml_odds.data.storage import GameResult, OddsSnapshot, get_session

load_dotenv()

logger = logging.getLogger(__name__)

ODDS_API_BASE = "https://api.the-odds-api.com/v4"


class OddsIngester:
    """Fetches odds from The Odds API and persists them to the database."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("ODDS_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ODDS_API_KEY not set. Pass api_key= or set the environment variable."
            )

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def fetch_odds(
        self,
        sport: str = "basketball_nba",
        markets: list[str] | None = None,
        regions: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Fetch current odds for *sport* from The Odds API.

        Args:
            sport: Sport key as defined by The Odds API (e.g. ``basketball_nba``).
            markets: Bet markets to retrieve. Defaults to ``["h2h"]``.
            regions: Bookmaker regions. Defaults to ``["us"]``.

        Returns:
            Raw list of event dicts returned by the API.
        """
        markets = markets or ["h2h"]
        regions = regions or ["us"]
        url = f"{ODDS_API_BASE}/sports/{sport}/odds"
        params: dict[str, str] = {
            "apiKey": self.api_key,
            "regions": ",".join(regions),
            "markets": ",".join(markets),
            "oddsFormat": "american",
        }
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        events: list[dict[str, Any]] = response.json()
        logger.info("Fetched %d events for sport=%s", len(events), sport)
        return events

    def save_odds(self, events: list[dict[str, Any]]) -> None:
        """Persist a batch of raw API event dicts to the database."""
        with get_session() as session:
            for event in events:
                for bookmaker in event.get("bookmakers", []):
                    for market in bookmaker.get("markets", []):
                        outcomes = {o["name"]: o["price"] for o in market.get("outcomes", [])}
                        snapshot = OddsSnapshot(
                            event_id=event["id"],
                            sport=event.get("sport_key", ""),
                            home_team=event.get("home_team", ""),
                            away_team=event.get("away_team", ""),
                            commence_time=datetime.fromisoformat(
                                event["commence_time"].replace("Z", "+00:00")
                            ),
                            bookmaker=bookmaker["key"],
                            market=market["key"],
                            home_price=outcomes.get(event.get("home_team", ""), None),
                            away_price=outcomes.get(event.get("away_team", ""), None),
                            fetched_at=datetime.now(timezone.utc),
                        )
                        session.merge(snapshot)
            session.commit()
        logger.info("Saved odds for %d events", len(events))

    def fetch_scores(
        self,
        sport: str = "basketball_nba",
        days_from: int = 3,
    ) -> list[dict[str, Any]]:
        """Fetch recent completed scores from The Odds API.

        Args:
            sport: Sport key.
            days_from: How many days back to retrieve results.

        Returns:
            List of completed game dicts.
        """
        url = f"{ODDS_API_BASE}/sports/{sport}/scores"
        params: dict[str, str] = {
            "apiKey": self.api_key,
            "daysFrom": str(days_from),
        }
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        scores: list[dict[str, Any]] = response.json()
        completed = [s for s in scores if s.get("completed")]
        logger.info("Fetched %d completed games for sport=%s", len(completed), sport)
        return completed

    def save_scores(self, scores: list[dict[str, Any]]) -> None:
        """Persist completed game results to the database."""
        with get_session() as session:
            for game in scores:
                scores_list = game.get("scores") or []
                score_map = {s["name"]: int(s["score"]) for s in scores_list if s.get("score")}
                home = game.get("home_team", "")
                away = game.get("away_team", "")
                home_score = score_map.get(home)
                away_score = score_map.get(away)
                if home_score is None or away_score is None:
                    continue
                result = GameResult(
                    event_id=game["id"],
                    sport=game.get("sport_key", ""),
                    home_team=home,
                    away_team=away,
                    commence_time=datetime.fromisoformat(
                        game["commence_time"].replace("Z", "+00:00")
                    ),
                    home_score=home_score,
                    away_score=away_score,
                    home_win=int(home_score > away_score),
                )
                session.merge(result)
            session.commit()
        logger.info("Saved %d game results", len(scores))
