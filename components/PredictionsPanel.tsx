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
  return (
    <div
      className="rounded"
      style={{ background: '#121212', border: '1px solid #242424', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#C6973F' }}>
          Model Predictions
        </h3>
      </div>

      {!prediction ? (
        <div className="px-4 py-6 text-center">
          <p style={{ fontSize: '0.8125rem', color: '#524D47' }}>No prediction data available.</p>
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {/* Win probability bar */}
          <div>
            <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#524D47', marginBottom: '0.625rem' }}>
              Win Probability
            </p>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#8A8278',
                minWidth: '2.5rem', textAlign: 'right' }}>
                {(prediction.away_win_prob * 100).toFixed(0)}%
              </span>
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: '6px', background: '#1C1C1C' }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${prediction.home_win_prob * 100}%`,
                    marginLeft: `${prediction.away_win_prob * 100}%`,
                    background: 'linear-gradient(90deg, #8A6B2C, #C6973F)',
                    borderRadius: '3px',
                    transition: 'width 600ms cubic-bezier(0.25, 0, 0, 1)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#8A8278',
                minWidth: '2.5rem' }}>
                {(prediction.home_win_prob * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between mt-1.5">
              <span style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.06em',
                textTransform: 'uppercase' }}>{awayAbbrev}</span>
              <span style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.06em',
                textTransform: 'uppercase' }}>{homeAbbrev}</span>
            </div>
          </div>

          {/* Projection numbers */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox
              value={prediction.projected_total_goals.toFixed(1)}
              label="Proj. Total"
            />
            <StatBox
              value={`${prediction.projected_goal_diff > 0 ? '+' : ''}${prediction.projected_goal_diff.toFixed(2)}`}
              label={`Goal Diff (${homeAbbrev})`}
            />
          </div>

          {/* Leans */}
          {(prediction.puck_line_lean || prediction.total_lean) && (
            <div>
              <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#524D47', marginBottom: '0.5rem' }}>
                Model Leans
              </p>
              <div className="space-y-2">
                {prediction.puck_line_lean && (
                  <div
                    className="flex items-center justify-between rounded px-3 py-2"
                    style={{
                      background: 'rgba(198,151,63,0.06)',
                      border: '1px solid rgba(198,151,63,0.15)',
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', color: '#EDE8E0' }}>
                      Puck Line:{' '}
                      <span style={{ fontWeight: 600, color: '#C6973F' }}>
                        {prediction.puck_line_lean.side === 'home' ? homeAbbrev : awayAbbrev} -1.5
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem',
                      color: '#8A6B2C', fontWeight: 600 }}>
                      +{prediction.puck_line_lean.edge.toFixed(2)}
                    </span>
                  </div>
                )}
                {prediction.total_lean && (
                  <div
                    className="flex items-center justify-between rounded px-3 py-2"
                    style={{
                      background: 'rgba(74,155,111,0.06)',
                      border: '1px solid rgba(74,155,111,0.15)',
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', color: '#EDE8E0' }}>
                      Total:{' '}
                      <span style={{ fontWeight: 600, color: '#4A9B6F' }}>
                        {prediction.total_lean.side.toUpperCase()}
                      </span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem',
                      color: '#357A56', fontWeight: 600 }}>
                      +{prediction.total_lean.edge.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.5625rem', color: '#2E2E2E', letterSpacing: '0.04em' }}>
            Predictions based on Elo ratings. For entertainment purposes only.
          </p>
        </div>
      )}
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded text-center"
      style={{ background: '#0C0C0C', border: '1px solid #242424', padding: '0.75rem' }}
    >
      <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.375rem', fontWeight: 700,
        color: '#C6973F', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.5625rem', color: '#524D47', marginTop: '0.25rem',
        letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </p>
    </div>
  );
}
