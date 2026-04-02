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
    <div className="space-y-10 animate-fade-in">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="pb-6" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <p
          className="text-2xs font-semibold tracking-label uppercase mb-2"
          style={{ color: '#8A6B2C', letterSpacing: '0.12em', fontSize: '0.625rem' }}
        >
          NHL · {formatDate(getTodayDateString())}
        </p>
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}
        >
          Today&apos;s&nbsp;
          <span
            style={{
              background: 'linear-gradient(135deg, #C6973F 0%, #DEB96A 50%, #C6973F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Games
          </span>
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#8A8278' }}>
          Live odds, AI predictions &amp; sharp edges — updated every 60 seconds.
        </p>
      </div>

      {/* ── Error banner ──────────────────────────────────── */}
      {error && (
        <div
          className="rounded px-4 py-3 text-sm"
          style={{
            background: 'rgba(192,64,64,0.08)',
            border: '1px solid rgba(192,64,64,0.2)',
            color: '#C04040',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Live scoreboard strip ─────────────────────────── */}
      <section>
        <p
          className="label mb-3"
          style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#8A8278' }}
        >
          Live &amp; Upcoming
        </p>
        <ScoreboardStrip games={games} />
      </section>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar — Top Edges */}
        <div className="lg:col-span-1">
          <TopEdges predictions={predictions} games={games} />
        </div>

        {/* Main — Game Cards */}
        <div className="lg:col-span-2">
          <p
            className="label mb-4"
            style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#8A8278' }}
          >
            All Games
          </p>
          {games.length === 0 && !error ? (
            <div
              className="rounded py-16 text-center text-sm"
              style={{ color: '#524D47', border: '1px dashed #1C1C1C' }}
            >
              No games scheduled today.
            </div>
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
