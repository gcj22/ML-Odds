import { getGamesByDate, getTodayGames } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';
import GameCard from '@/components/GameCard';
import DatePicker from '@/components/DatePicker';
import { formatDate, getTodayDateString } from '@/lib/utils';
import { GamePrediction } from '@/lib/types';

export const revalidate = 60;

interface ScoresPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ScoresPage({ searchParams }: ScoresPageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? getTodayDateString();
  let games: Awaited<ReturnType<typeof getTodayGames>> = [];
  let bestLinesList: ReturnType<typeof computeBestLines> = [];
  let predictions: GamePrediction[] = [];
  let error: string | null = null;

  try {
    const isToday = date === getTodayDateString();
    const [nhlGames, oddsGames] = await Promise.all([
      isToday ? getTodayGames() : getGamesByDate(date),
      getOdds(['h2h', 'spreads', 'totals']),
    ]);

    games = nhlGames;
    bestLinesList = computeBestLines(oddsGames);

    predictions = games.map((game) => {
      const bestLines = bestLinesList.find(
        (bl) =>
          bl.homeTeam.toLowerCase().includes(game.homeTeam.placeName?.default?.toLowerCase() ?? '') ||
          bl.awayTeam.toLowerCase().includes(game.awayTeam.placeName?.default?.toLowerCase() ?? '')
      );
      const pred = predictGame(game.homeTeam.abbrev, game.awayTeam.abbrev, bestLines);
      pred.gameId = game.id.toString();
      return pred;
    });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load scores';
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6"
        style={{ borderBottom: '1px solid #1C1C1C' }}>
        <div>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#8A6B2C', marginBottom: '0.5rem' }}>
            NHL · Scores
          </p>
          <h1 className="text-4xl font-semibold" style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}>
            {formatDate(date)}
          </h1>
        </div>
        <DatePicker currentDate={date} basePath="/scores" />
      </div>

      {error && (
        <div className="rounded px-4 py-3 text-sm"
          style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.2)', color: '#C04040' }}>
          {error}
        </div>
      )}

      {games.length === 0 && !error ? (
        <div className="rounded py-16 text-center text-sm"
          style={{ color: '#524D47', border: '1px dashed #1C1C1C' }}>
          No games on {formatDate(date)}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const bestLines = bestLinesList.find(
              (bl) =>
                bl.homeTeam.toLowerCase().includes(game.homeTeam.placeName?.default?.toLowerCase() ?? '') ||
                bl.awayTeam.toLowerCase().includes(game.awayTeam.placeName?.default?.toLowerCase() ?? '')
            );
            const prediction = predictions.find((p) => p.gameId === game.id.toString());
            return (
              <GameCard
                key={game.id}
                game={game}
                bestLines={bestLines}
                prediction={prediction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
