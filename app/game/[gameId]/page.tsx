import { getNHLBoxscore } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';
import GameCenter from '@/components/GameCenter';
import Link from 'next/link';

export const revalidate = 30;

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
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
    <div className="space-y-5">
      <Link
        href="/"
        style={{ fontSize: '0.8125rem', color: '#524D47', transition: 'color 200ms',
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#C6973F'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#524D47'; }}
      >
        ← Back to Today
      </Link>

      {error && (
        <div
          className="rounded px-4 py-3 text-sm"
          style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.2)',
            color: '#C04040' }}
        >
          {error}
        </div>
      )}

      {boxscore && (
        <GameCenter boxscore={boxscore} bestLines={bestLines} prediction={prediction} />
      )}

      {!boxscore && !error && (
        <div className="rounded py-16 text-center text-sm"
          style={{ color: '#524D47', border: '1px dashed #1C1C1C' }}>
          Game not found.
        </div>
      )}
    </div>
  );
}
