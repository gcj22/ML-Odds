import { OddsGame, BestLines, BestLine } from './types';

export function computeBestLines(games: OddsGame[]): BestLines[] {
  return games.map((game) => {
    const result: BestLines = {
      gameId: game.id,
      sportKey: game.sport_key,
      sportTitle: game.sport_title,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      commenceTime: game.commence_time,
    };

    const marketTypes = ['h2h', 'spreads', 'totals'] as const;

    for (const marketKey of marketTypes) {
      const allOutcomes: Array<{ outcome: { name: string; price: number; point?: number }; book: string; bookTitle: string }> = [];

      for (const bookmaker of game.bookmakers) {
        const market = bookmaker.markets.find((m) => m.key === marketKey);
        if (!market) continue;
        for (const outcome of market.outcomes) {
          allOutcomes.push({ outcome, book: bookmaker.key, bookTitle: bookmaker.title });
        }
      }

      if (allOutcomes.length === 0) continue;

      if (marketKey === 'h2h') {
        const homeBest = findBestForName(allOutcomes, game.home_team);
        const awayBest = findBestForName(allOutcomes, game.away_team);
        if (homeBest && awayBest) {
          result.h2h = { home: homeBest, away: awayBest };
        }
      } else if (marketKey === 'spreads') {
        const homeBest = findBestForName(allOutcomes, game.home_team);
        const awayBest = findBestForName(allOutcomes, game.away_team);
        if (homeBest && awayBest) {
          result.puckLine = { home: homeBest, away: awayBest };
        }
      } else if (marketKey === 'totals') {
        const overBest = findBestForName(allOutcomes, 'Over');
        const underBest = findBestForName(allOutcomes, 'Under');
        if (overBest && underBest) {
          result.totals = { over: overBest, under: underBest };
        }
      }
    }

    return result;
  });
}

function findBestForName(
  allOutcomes: Array<{ outcome: { name: string; price: number; point?: number }; book: string; bookTitle: string }>,
  name: string
): BestLine | null {
  const matching = allOutcomes.filter(({ outcome }) => outcome.name === name);
  if (matching.length === 0) return null;

  const best = matching.reduce((acc, curr) =>
    curr.outcome.price > acc.outcome.price ? curr : acc
  );

  return {
    price: best.outcome.price,
    point: best.outcome.point,
    book: best.book,
    bookTitle: best.bookTitle,
  };
}
