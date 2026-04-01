"""
Kelly Criterion bankroll management.

Computes optimal bet sizes using the fractional Kelly formula so that
even a profitable edge won't lead to ruin through over-betting.

    full_kelly  = (edge) / (decimal_odds - 1)
    frac_kelly  = full_kelly * kelly_fraction

Usage:
    from ml_odds.betting.kelly import KellyCalculator, BetRecommendation

    calc = KellyCalculator(bankroll=10_000, kelly_fraction=0.25)
    rec  = calc.recommend(signal)
    print(rec)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from ml_odds.features.engineering import american_to_decimal

logger = logging.getLogger(__name__)


@dataclass
class BetRecommendation:
    """A concrete bet recommendation with sizing."""

    event_id: str
    team: str
    side: str
    american_price: float
    model_prob: float
    implied_prob: float
    edge: float
    kelly_fraction_used: float
    full_kelly_pct: float        # optimal fraction of bankroll (0–1)
    bet_fraction: float          # fraction of bankroll to wager (0–1)
    bet_amount: float            # dollar amount to wager
    bankroll: float

    def __str__(self) -> str:
        return (
            f"BET {self.side.upper()} {self.team} ({self.american_price:+.0f}) | "
            f"${self.bet_amount:.2f} ({self.bet_fraction:.2%} of ${self.bankroll:,.0f}) | "
            f"edge={self.edge:+.1%}"
        )


class KellyCalculator:
    """Computes fractional Kelly bet sizes.

    Args:
        bankroll: Total available bankroll in dollars.
        kelly_fraction: Fraction of full Kelly to use. Common values:
                        0.25 (quarter Kelly) for conservative sizing,
                        0.5  (half Kelly) for moderate sizing.
                        Default is 0.25.
        max_bet_pct: Hard cap — never bet more than this fraction of the
                     bankroll on any single game. Default 0.05 (5%).
    """

    def __init__(
        self,
        bankroll: float,
        kelly_fraction: float = 0.25,
        max_bet_pct: float = 0.05,
    ) -> None:
        if bankroll <= 0:
            raise ValueError("bankroll must be positive")
        if not 0 < kelly_fraction <= 1:
            raise ValueError("kelly_fraction must be in (0, 1]")
        if not 0 < max_bet_pct <= 1:
            raise ValueError("max_bet_pct must be in (0, 1]")

        self.bankroll = bankroll
        self.kelly_fraction = kelly_fraction
        self.max_bet_pct = max_bet_pct

    def full_kelly(self, model_prob: float, decimal_odds: float) -> float:
        """Compute the full Kelly fraction for a bet.

        Kelly formula: f* = (p * b - q) / b
        where b = decimal_odds - 1, p = win prob, q = 1 - p.

        Returns a value in [0, 1]. Returns 0 when there is no edge.
        """
        b = decimal_odds - 1.0
        if b <= 0:
            return 0.0
        q = 1.0 - model_prob
        kelly = (model_prob * b - q) / b
        return max(0.0, kelly)

    def recommend(self, signal: "BettingSignal") -> BetRecommendation | None:  # noqa: F821
        """Turn a :class:`~ml_odds.betting.edge.BettingSignal` into a sized bet.

        Returns ``None`` if Kelly sizing comes out to zero (no edge).
        """
        from ml_odds.betting.edge import BettingSignal

        price = signal.home_price if signal.side == "home" else signal.away_price
        if price == 0:
            logger.warning("Price is 0 for %s — skipping", signal.event_id)
            return None

        dec_odds = american_to_decimal(price)
        fk = self.full_kelly(signal.model_prob, dec_odds)
        if fk <= 0:
            return None

        bet_fraction = min(fk * self.kelly_fraction, self.max_bet_pct)
        bet_amount = self.bankroll * bet_fraction
        team = signal.home_team if signal.side == "home" else signal.away_team

        return BetRecommendation(
            event_id=signal.event_id,
            team=team,
            side=signal.side,
            american_price=price,
            model_prob=signal.model_prob,
            implied_prob=signal.implied_prob,
            edge=signal.edge,
            kelly_fraction_used=self.kelly_fraction,
            full_kelly_pct=fk,
            bet_fraction=bet_fraction,
            bet_amount=bet_amount,
            bankroll=self.bankroll,
        )

    def batch_recommend(
        self, signals: list["BettingSignal"]  # noqa: F821
    ) -> list[BetRecommendation]:
        """Produce sized recommendations for a list of signals."""
        recs = [self.recommend(s) for s in signals]
        return [r for r in recs if r is not None]
