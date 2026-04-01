import { getTodayGames } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';
import ScoreboardStrip from '@/components/ScoreboardStrip';
import GameCard from '@/components/GameCard';
import TopEdges from '@/components/TopEdges';
import { formatDate, getTodayDateString } from '@/lib/utils';
import { GamePrediction } from '@/lib/types';

export const revalidate = 60;

export default async function TodayPage() {
  let games: Awaited<ReturnType<typeof getTodayGames>> = [];
  let bestLinesList: ReturnType<typeof computeBestLines> = [];
  let predictions: GamePrediction[] = [];
  let error: string | null = null;

  try {
    const [nhlGames, oddsGames] = await Promise.all([
      getTodayGames(),
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
    error = e instanceof Error ? e.message : 'Failed to load data';
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          NHL <span className="text-yellow-400">Today</span>
        </h1>
        <p className="text-gray-400 mt-1">{formatDate(getTodayDateString())}</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Live Scoreboard Strip */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Today&apos;s Games
        </h2>
        <ScoreboardStrip games={games} />
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Edges */}
        <div className="lg:col-span-1">
          <TopEdges predictions={predictions} games={games} />
        </div>

        {/* Game Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            All Games
          </h2>
          {games.length === 0 && !error ? (
            <div className="text-gray-500 py-8 text-center">No games scheduled today.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}
