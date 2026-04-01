"""
Feature engineering for ML-Odds.

Transforms raw game results and odds snapshots into a model-ready DataFrame.

Features produced per game row:
  - home_win_rate_l10       Last-10 home-team win rate
  - away_win_rate_l10       Last-10 away-team win rate
  - home_streak             Current streak (+N wins, -N losses) for home team
  - away_streak             Current streak for away team
  - home_rest_days          Days since home team's last game
  - away_rest_days          Days since away team's last game
  - home_away_win_rate      Home team's win rate in home games only
  - away_away_win_rate      Away team's win rate in away games only
  - opening_home_price      Earliest recorded home moneyline (american)
  - latest_home_price       Most recent home moneyline
  - line_movement           latest_home_price - opening_home_price (home line drift)
  - implied_home_prob        Vig-adjusted implied probability for home team
  - implied_away_prob        Vig-adjusted implied probability for away team
  - home_win (target)        1 if home team won
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def american_to_decimal(price: float) -> float:
    """Convert American odds to decimal odds."""
    if price >= 100:
        return price / 100 + 1
    return 100 / abs(price) + 1


def implied_prob_from_american(price: float) -> float:
    """Raw (no-vig) implied probability from American odds."""
    dec = american_to_decimal(price)
    return 1 / dec


def remove_vig(home_price: float, away_price: float) -> tuple[float, float]:
    """Return vig-adjusted (true) probabilities for a two-outcome market.

    Uses the standard proportional method: divide each raw implied prob by
    the total implied prob (the overround).
    """
    p_home = implied_prob_from_american(home_price)
    p_away = implied_prob_from_american(away_price)
    total = p_home + p_away
    if total <= 0:
        return 0.5, 0.5
    return p_home / total, p_away / total


# ---------------------------------------------------------------------------
# Team-level rolling stats
# ---------------------------------------------------------------------------


def _compute_team_stats(results: pd.DataFrame) -> dict[str, dict]:
    """Pre-compute per-team rolling stats from a results DataFrame.

    Args:
        results: DataFrame with columns [event_id, home_team, away_team,
                  commence_time, home_score, away_score, home_win].

    Returns:
        Nested dict: {team_name: {event_id: {stat_name: value, ...}}}
    """
    results = results.sort_values("commence_time")
    team_history: dict[str, list[dict]] = {}

    for _, row in results.iterrows():
        for side, team in [("home", row["home_team"]), ("away", row["away_team"])]:
            win = int(row["home_win"]) if side == "home" else int(not row["home_win"])
            entry = {
                "event_id": row["event_id"],
                "date": row["commence_time"],
                "win": win,
                "is_home": side == "home",
            }
            team_history.setdefault(team, []).append(entry)

    stats: dict[str, dict] = {}
    for team, games in team_history.items():
        for idx in range(len(games)):
            event_id = games[idx]["event_id"]
            prior = games[:idx]
            recent = prior[-10:]
            win_rate_l10 = np.mean([g["win"] for g in recent]) if recent else 0.5
            home_games = [g for g in prior if g["is_home"]]
            away_games = [g for g in prior if not g["is_home"]]
            home_win_rate = np.mean([g["win"] for g in home_games]) if home_games else 0.5
            away_win_rate = np.mean([g["win"] for g in away_games]) if away_games else 0.5

            streak = 0
            if prior:
                last_result = prior[-1]["win"]
                streak = 1 if last_result else -1
                for g in reversed(prior[:-1]):
                    if g["win"] == last_result:
                        streak += (1 if last_result else -1)
                    else:
                        break

            rest_days: float = 7.0
            if prior:
                last_date = prior[-1]["date"]
                current_date = games[idx]["date"]
                if isinstance(last_date, str):
                    last_date = pd.Timestamp(last_date)
                if isinstance(current_date, str):
                    current_date = pd.Timestamp(current_date)
                rest_days = max(0.0, (current_date - last_date).total_seconds() / 86400)

            stats.setdefault(team, {})[event_id] = {
                "win_rate_l10": win_rate_l10,
                "streak": streak,
                "home_win_rate": home_win_rate,
                "away_win_rate": away_win_rate,
                "rest_days": rest_days,
            }

    return stats


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def build_features(
    results: pd.DataFrame,
    odds: pd.DataFrame,
    bookmaker: str | None = None,
) -> pd.DataFrame:
    """Build a feature DataFrame ready for model training or inference.

    Args:
        results: DataFrame with columns matching ``GameResult`` fields.
                 Must include: event_id, home_team, away_team, commence_time,
                 home_win.
        odds: DataFrame with columns matching ``OddsSnapshot`` fields.
              Must include: event_id, bookmaker, market, home_price,
              away_price, fetched_at.
        bookmaker: If given, filter odds to this bookmaker only.
                   Otherwise the consensus (median) across all bookmakers
                   is used.

    Returns:
        DataFrame with one row per completed game, including all features
        and the ``home_win`` target column.
    """
    results = results.copy()
    results["commence_time"] = pd.to_datetime(results["commence_time"], utc=True)

    h2h_odds = odds[odds["market"] == "h2h"].copy()
    if bookmaker:
        h2h_odds = h2h_odds[h2h_odds["bookmaker"] == bookmaker]

    h2h_odds["fetched_at"] = pd.to_datetime(h2h_odds["fetched_at"], utc=True)

    team_stats = _compute_team_stats(results)

    rows = []
    for _, game in results.iterrows():
        eid = game["event_id"]
        home = game["home_team"]
        away = game["away_team"]

        home_stats = team_stats.get(home, {}).get(eid, {})
        away_stats = team_stats.get(away, {}).get(eid, {})

        game_odds = h2h_odds[h2h_odds["event_id"] == eid].dropna(
            subset=["home_price", "away_price"]
        )

        opening_home_price = np.nan
        latest_home_price = np.nan
        implied_home_prob = 0.5
        implied_away_prob = 0.5
        line_movement = 0.0

        if not game_odds.empty:
            game_odds_sorted = game_odds.sort_values("fetched_at")
            opening_home_price = float(game_odds_sorted.iloc[0]["home_price"])
            latest_home_price = float(game_odds_sorted.iloc[-1]["home_price"])
            line_movement = latest_home_price - opening_home_price

            median_home = float(game_odds["home_price"].median())
            median_away = float(game_odds["away_price"].median())
            implied_home_prob, implied_away_prob = remove_vig(median_home, median_away)

        row = {
            "event_id": eid,
            "home_team": home,
            "away_team": away,
            "commence_time": game["commence_time"],
            "home_win_rate_l10": home_stats.get("win_rate_l10", 0.5),
            "away_win_rate_l10": away_stats.get("win_rate_l10", 0.5),
            "home_streak": home_stats.get("streak", 0),
            "away_streak": away_stats.get("streak", 0),
            "home_rest_days": home_stats.get("rest_days", 7.0),
            "away_rest_days": away_stats.get("rest_days", 7.0),
            "home_away_win_rate": home_stats.get("home_win_rate", 0.5),
            "away_away_win_rate": away_stats.get("away_win_rate", 0.5),
            "opening_home_price": opening_home_price,
            "latest_home_price": latest_home_price,
            "line_movement": line_movement,
            "implied_home_prob": implied_home_prob,
            "implied_away_prob": implied_away_prob,
            "home_win": int(game["home_win"]),
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    logger.info("Built feature DataFrame with %d rows and %d columns", len(df), len(df.columns))
    return df


FEATURE_COLS = [
    "home_win_rate_l10",
    "away_win_rate_l10",
    "home_streak",
    "away_streak",
    "home_rest_days",
    "away_rest_days",
    "home_away_win_rate",
    "away_away_win_rate",
    "line_movement",
    "implied_home_prob",
    "implied_away_prob",
]
