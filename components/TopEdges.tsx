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

  if (topEdges.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-bold text-yellow-400 mb-3">Top Edges</h2>
        <p className="text-gray-500 text-sm">No significant edges found today.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-yellow-400 mb-3">🔥 Top Edges Today</h2>
      <div className="space-y-2">
        {topEdges.map((edge, i) => (
          <Link key={i} href={edge.gameId ? `/game/${edge.gameId}` : '/odds'}>
            <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-border/50 transition-colors cursor-pointer">
              <div>
                <div className="text-sm font-semibold">
                  {edge.awayAbbrev} @ {edge.homeAbbrev}
                </div>
                <div className="text-xs text-gray-400">
                  {edge.type}: {edge.description}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-bold ${edge.edge > 0.5 ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  +{edge.edge.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">edge</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
