import Link from 'next/link';
import { BestLines, BestLine } from '@/lib/types';
import { formatAmericanOdds } from '@/lib/utils';

export default function OddsTable({ bestLinesList }: { bestLinesList: BestLines[] }) {
  if (bestLinesList.length === 0) {
    return (
      <div
        className="text-center py-12 text-sm"
        style={{ color: '#524D47' }}
      >
        No odds available. Set ODDS_API_KEY to see live odds.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
            {['Game', 'Time', 'ML Away', 'ML Home', 'PL Away', 'PL Home', 'Over', 'Under'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: i === 0 ? 'left' : 'center',
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#524D47',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bestLinesList.map((game, rowIdx) => (
            <tr
              key={game.gameId}
              className="luxury-row"
              style={{
                borderBottom: rowIdx < bestLinesList.length - 1 ? '1px solid #1C1C1C' : 'none',
              }}
            >
              <td style={{ padding: '0.875rem 1rem' }}>
                <Link
                  href={`/game/${game.gameId}`}
                  className="luxury-game-link"
                  style={{ display: 'block' }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDE8E0',
                    letterSpacing: '-0.01em', transition: 'color 200ms' }}>
                    {game.awayTeam}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDE8E0',
                    letterSpacing: '-0.01em', marginTop: '0.125rem', transition: 'color 200ms' }}>
                    @ {game.homeTeam}
                  </p>
                </Link>
              </td>
              <td style={{ padding: '0.875rem 1rem', textAlign: 'center',
                fontSize: '0.75rem', color: '#8A8278', whiteSpace: 'nowrap' }}>
                {formatGameTime(game.commenceTime)}
              </td>
              <OddsCell line={game.h2h?.away} />
              <OddsCell line={game.h2h?.home} />
              <OddsCell line={game.puckLine?.away} showPoint />
              <OddsCell line={game.puckLine?.home} showPoint />
              <OddsCell line={game.totals?.over} showPoint />
              <OddsCell line={game.totals?.under} showPoint />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatGameTime(utcTime: string): string {
  try {
    const date = new Date(utcTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
    });
  } catch {
    return utcTime;
  }
}

function OddsCell({
  line,
  showPoint,
}: {
  line?: BestLine | null;
  showPoint?: boolean;
}) {
  if (!line) {
    return (
      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#2E2E2E',
        fontSize: '0.875rem' }}>
        —
      </td>
    );
  }

  return (
    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#C6973F',
          letterSpacing: '0.02em',
        }}
      >
        {showPoint && line.point !== undefined && (
          <span style={{ color: '#524D47', fontSize: '0.75rem', marginRight: '0.25rem' }}>
            {line.point}
          </span>
        )}
        {formatAmericanOdds(line.price)}
      </div>
      <div style={{ fontSize: '0.5625rem', color: '#524D47', marginTop: '0.1875rem' }}>
        {line.bookTitle}
      </div>
    </td>
  );
}
