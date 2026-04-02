import { NHLBoxscore, BestLines, GamePrediction } from '@/lib/types';
import { getGameStatus, formatGameTime } from '@/lib/utils';
import Image from 'next/image';
import BoxScore from './BoxScore';
import OddsPanel from './OddsPanel';
import PredictionsPanel from './PredictionsPanel';

interface GameCenterProps {
  boxscore: NHLBoxscore;
  bestLines?: BestLines;
  prediction?: GamePrediction;
}

export default function GameCenter({ boxscore, bestLines, prediction }: GameCenterProps) {
  const { awayTeam, homeTeam } = boxscore;
  const status = getGameStatus(boxscore);
  const isLive = ['LIVE', 'CRIT'].includes(boxscore.gameState);
  const isFinal = ['FINAL', 'OFF', 'OVER'].includes(boxscore.gameState);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Game header card ───────────────────────────────── */}
      <div
        className="rounded"
        style={{ background: '#121212', border: '1px solid #242424', padding: '2rem 1.5rem' }}
      >
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          {/* Away */}
          <TeamBlock
            team={awayTeam}
            label="Away"
            score={isLive || isFinal ? awayTeam.score : undefined}
          />

          {/* Status center */}
          <div className="text-center flex flex-col items-center gap-2">
            {isLive ? (
              <span className="badge-live flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                  style={{ background: '#C04040', display: 'inline-block' }}
                />
                Live
              </span>
            ) : isFinal ? (
              <span className="badge-final">Final</span>
            ) : (
              <span className="badge-scheduled">{status}</span>
            )}

            {!isFinal && !isLive && boxscore.gameDate && (
              <p style={{ fontSize: '0.75rem', color: '#524D47' }}>
                {formatGameTime(boxscore.gameDate + 'T00:00:00Z')}
              </p>
            )}
            {isLive && boxscore.clock && (
              <p style={{ fontSize: '0.875rem', color: '#8A8278' }}>
                P{boxscore.period} · {boxscore.clock.timeRemaining}
              </p>
            )}
            <span style={{ fontSize: '0.6875rem', color: '#2E2E2E' }}>vs</span>
          </div>

          {/* Home */}
          <TeamBlock
            team={homeTeam}
            label="Home"
            score={isLive || isFinal ? homeTeam.score : undefined}
          />
        </div>
      </div>

      {/* ── Odds + Predictions ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OddsPanel bestLines={bestLines} />
        <PredictionsPanel
          prediction={prediction}
          homeAbbrev={homeTeam.abbrev}
          awayAbbrev={awayTeam.abbrev}
        />
      </div>

      {/* ── Box Score ──────────────────────────────────────── */}
      <BoxScore boxscore={boxscore} />
    </div>
  );
}

function TeamBlock({
  team,
  label,
  score,
}: {
  team: { logo?: string; abbrev: string; placeName?: { default?: string } };
  label: string;
  score?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {team.logo ? (
        <Image
          src={team.logo}
          alt={team.abbrev}
          width={64}
          height={64}
          className="object-contain opacity-90"
          unoptimized
        />
      ) : (
        <div
          className="w-16 h-16 rounded flex items-center justify-center"
          style={{ background: '#1C1C1C', border: '1px solid #242424' }}
        >
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#524D47' }}>
            {team.abbrev.slice(0, 2)}
          </span>
        </div>
      )}
      <div className="text-center">
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#EDE8E0', letterSpacing: '-0.02em' }}>
          {team.placeName?.default ?? team.abbrev}
        </p>
        <p style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginTop: '0.125rem' }}>
          {label}
        </p>
      </div>
      {score !== undefined && (
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#C6973F',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {score}
        </p>
      )}
    </div>
  );
}
