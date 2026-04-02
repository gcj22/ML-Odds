import { GamePrediction, NHLGame } from '@/lib/types';
import Link from 'next/link';

interface TopEdgesProps {
  predictions: GamePrediction[];
  games: NHLGame[];
}

export default function TopEdges({ predictions, games }: TopEdgesProps) {
  type Edge = {
    gameId: string;
    homeAbbrev: string;
    awayAbbrev: string;
    type: string;
    side: string;
    edge: number;
    description: string;
  };
  const edges: Edge[] = [];

  for (const pred of predictions) {
    const game = games.find(
      (g) => g.homeTeam.abbrev === pred.homeTeam || g.awayTeam.abbrev === pred.homeTeam
    );
    const gameId = pred.gameId || game?.id?.toString() || '';

    if (pred.puck_line_lean) {
      edges.push({
        gameId,
        homeAbbrev: pred.homeTeam,
        awayAbbrev: pred.awayTeam,
        type: 'Puck Line',
        side: pred.puck_line_lean.side === 'home' ? pred.homeTeam : pred.awayTeam,
        edge: pred.puck_line_lean.edge,
        description: `${pred.puck_line_lean.side === 'home' ? pred.homeTeam : pred.awayTeam} -1.5`,
      });
    }

    if (pred.total_lean) {
      edges.push({
        gameId,
        homeAbbrev: pred.homeTeam,
        awayAbbrev: pred.awayTeam,
        type: 'Total',
        side: pred.total_lean.side,
        edge: pred.total_lean.edge,
        description: `${pred.total_lean.side.toUpperCase()} ${pred.projected_total_goals.toFixed(1)}`,
      });
    }
  }

  edges.sort((a, b) => b.edge - a.edge);
  const topEdges = edges.slice(0, 5);

  return (
    <div
      className="rounded"
      style={{
        background: '#121212',
        border: '1px solid #242424',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        <span
          className="luxury-dot"
          style={{ flexShrink: 0 }}
        />
        <h2
          style={{
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#C6973F',
          }}
        >
          Top Edges Today
        </h2>
      </div>

      {topEdges.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p style={{ fontSize: '0.8125rem', color: '#524D47' }}>No significant edges found today.</p>
        </div>
      ) : (
        <div>
          {topEdges.map((edge, i) => (
            <Link key={i} href={edge.gameId ? `/game/${edge.gameId}` : '/odds'}>
              <div
                className="luxury-edge-item"
                style={{
                  borderBottom: i < topEdges.length - 1 ? '1px solid #1C1C1C' : 'none',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDE8E0',
                    letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis' }}>
                    {edge.awayAbbrev} <span style={{ color: '#524D47' }}>@</span> {edge.homeAbbrev}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: '#8A8278', marginTop: '0.125rem' }}>
                    <span style={{ color: '#8A6B2C' }}>{edge.type}:</span> {edge.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      color: edge.edge > 0.5 ? '#4A9B6F' : '#C6973F',
                    }}
                  >
                    +{edge.edge.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.06em',
                    textTransform: 'uppercase' }}>
                    edge
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
