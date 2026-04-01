import { getNHLBoxscore } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';
import GameCenter from '@/components/GameCenter';
import Link from 'next/link';

export const revalidate = 30;

interface GamePageProps {
  params: { gameId: string };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = params;
  let boxscore = null;
  let bestLines = undefined;
  let prediction = undefined;
  let error: string | null = null;

  try {
    const [bs, oddsGames] = await Promise.all([
      getNHLBoxscore(gameId),
      getOdds(['h2h', 'spreads', 'totals']),
    ]);

    boxscore = bs;
    const allBestLines = computeBestLines(oddsGames);
    bestLines = allBestLines.find(
      (bl) =>
        bl.homeTeam.toLowerCase().includes(bs.homeTeam.placeName?.default?.toLowerCase() ?? '') ||
        bl.awayTeam.toLowerCase().includes(bs.awayTeam.placeName?.default?.toLowerCase() ?? '')
    );

    prediction = predictGame(bs.homeTeam.abbrev, bs.awayTeam.abbrev, bestLines);
    prediction.gameId = gameId;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load game data';
  }

  return (
    <div className="space-y-4">
      <Link href="/" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
        ← Back to Today
      </Link>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {boxscore && (
        <GameCenter boxscore={boxscore} bestLines={bestLines} prediction={prediction} />
      )}

      {!boxscore && !error && (
        <div className="text-gray-500 py-12 text-center">Game not found.</div>
      )}
    </div>
  );
}
