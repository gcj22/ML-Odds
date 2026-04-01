"""
SQLAlchemy models and session management for the ML-Odds database.

A lightweight SQLite database stores:
  - OddsSnapshot  — point-in-time bookmaker odds
  - GameResult    — final scores / outcomes
"""

from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime
from typing import Generator

from sqlalchemy import Boolean, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

DB_URL = os.environ.get("ML_ODDS_DB_URL", "sqlite:///ml_odds.db")
_engine = create_engine(DB_URL, echo=False)


class Base(DeclarativeBase):
    pass


class OddsSnapshot(Base):
    """Point-in-time snapshot of bookmaker odds for one event/market."""

    __tablename__ = "odds_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String, index=True)
    sport: Mapped[str] = mapped_column(String, index=True)
    home_team: Mapped[str] = mapped_column(String)
    away_team: Mapped[str] = mapped_column(String)
    commence_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    bookmaker: Mapped[str] = mapped_column(String)
    market: Mapped[str] = mapped_column(String)
    home_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    away_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class GameResult(Base):
    """Final outcome of a completed game."""

    __tablename__ = "game_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    sport: Mapped[str] = mapped_column(String, index=True)
    home_team: Mapped[str] = mapped_column(String)
    away_team: Mapped[str] = mapped_column(String)
    commence_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    home_score: Mapped[int] = mapped_column(Integer)
    away_score: Mapped[int] = mapped_column(Integer)
    home_win: Mapped[int] = mapped_column(Integer)


def init_db() -> None:
    """Create all tables if they don't exist yet."""
    Base.metadata.create_all(_engine)


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Provide a transactional database session."""
    with Session(_engine) as session:
        yield session


# Auto-initialise tables on import so callers don't need an explicit step.
init_db()
