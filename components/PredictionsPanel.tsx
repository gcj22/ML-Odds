import { GamePrediction } from '@/lib/types';

export default function PredictionsPanel({
  prediction,
  homeAbbrev,
  awayAbbrev,
}: {
  prediction?: GamePrediction;
  homeAbbrev: string;
  awayAbbrev: string;
}) {
  if (!prediction) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">Predictions</h3>
        <p className="text-gray-500 text-sm">No prediction data available.</p>
      </div>
    );
  }

  const homeProb = (prediction.home_win_prob * 100).toFixed(1);
  const awayProb = (prediction.away_win_prob * 100).toFixed(1);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold mb-3">🤖 Predictions</h3>

      {/* Win Probability */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Win Probability</div>
        <div className="flex items-center gap-2">
          <span className="text-sm w-8 text-right">{awayProb}%</span>
          <div className="flex-1 bg-border rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full"
              style={{ width: `${homeProb}%`, marginLeft: `${awayProb}%` }}
            />
          </div>
          <span className="text-sm w-8">{homeProb}%</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{awayAbbrev}</span>
          <span>{homeAbbrev}</span>
        </div>
      </div>

      {/* Projections */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background border border-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {prediction.projected_total_goals.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Projected Total</div>
        </div>
        <div className="bg-background border border-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {prediction.projected_goal_diff > 0 ? '+' : ''}
            {prediction.projected_goal_diff.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Goal Diff ({homeAbbrev})</div>
        </div>
      </div>

      {/* Leans */}
      {(prediction.puck_line_lean || prediction.total_lean) && (
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Model Leans</div>
          <div className="space-y-2">
            {prediction.puck_line_lean && (
              <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                <span className="text-sm">
                  Puck Line:{' '}
                  <span className="font-semibold text-yellow-400">
                    {prediction.puck_line_lean.side === 'home' ? homeAbbrev : awayAbbrev} -1.5
                  </span>
                </span>
                <span className="text-xs text-yellow-400 font-mono">
                  +{prediction.puck_line_lean.edge.toFixed(2)} edge
                </span>
              </div>
            )}
            {prediction.total_lean && (
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded px-3 py-2">
                <span className="text-sm">
                  Total:{' '}
                  <span className="font-semibold text-blue-400">
                    {prediction.total_lean.side.toUpperCase()}
                  </span>
                </span>
                <span className="text-xs text-blue-400 font-mono">
                  +{prediction.total_lean.edge.toFixed(2)} edge
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4">
        * Predictions based on Elo ratings. For entertainment purposes only.
      </p>
    </div>
  );
}
