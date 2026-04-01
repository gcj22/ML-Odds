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
  searchParams: { date?: string };
}

export default async function ScoresPage({ searchParams }: ScoresPageProps) {
  const date = searchParams.date ?? getTodayDateString();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            NHL <span className="text-yellow-400">Scores</span>
          </h1>
          <p className="text-gray-400 mt-1">{formatDate(date)}</p>
        </div>
        <DatePicker currentDate={date} basePath="/scores" />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {games.length === 0 && !error ? (
        <div className="text-gray-500 py-12 text-center">No games on {formatDate(date)}.</div>
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
