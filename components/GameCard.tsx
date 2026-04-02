import Link from 'next/link';
import Image from 'next/image';
import { NHLGame, BestLines, GamePrediction } from '@/lib/types';
import { formatGameTime, getGameStatus, formatAmericanOdds } from '@/lib/utils';

interface GameCardProps {
  game: NHLGame;
  bestLines?: BestLines;
  prediction?: GamePrediction;
}

export default function GameCard({ game, bestLines, prediction }: GameCardProps) {
  const status = getGameStatus(game);
  const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
  const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);

  return (
    <Link href={`/game/${game.id}`}>
      <article className="card-interactive group rounded" style={{ padding: '1rem' }}>
        {/* ── Status row ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <span className="badge-live flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-slow"
                style={{ background: '#C04040' }}
              />
              Live
            </span>
          ) : isFinal ? (
            <span className="badge-final">Final</span>
          ) : (
            <span className="badge-scheduled">{status}</span>
          )}
          {!isFinal && !isLive && (
            <span style={{ fontSize: '0.75rem', color: '#524D47' }}>
              {formatGameTime(game.startTimeUTC)}
            </span>
          )}
        </div>

        {/* ── Teams ───────────────────────────────────── */}
        <div className="space-y-2.5 mb-4">
          {[
            { team: game.awayTeam, label: 'Away' },
            { team: game.homeTeam, label: 'Home' },
          ].map(({ team, label }, idx) => (
            <div key={team.abbrev}>
              {idx === 1 && (
                <div
                  className="mb-2.5 h-px"
                  style={{ background: '#1C1C1C' }}
                />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {team.logo ? (
                    <Image
                      src={team.logo}
                      alt={team.abbrev}
                      width={28}
                      height={28}
                      className="object-contain opacity-90"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold"
                      style={{ background: '#1C1C1C', color: '#8A8278' }}
                    >
                      {team.abbrev.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ color: '#EDE8E0', letterSpacing: '-0.01em' }}
                    >
                      {team.placeName?.default ?? team.abbrev}
                    </p>
                    <p style={{ fontSize: '0.625rem', color: '#524D47', letterSpacing: '0.06em' }}>
                      {label.toUpperCase()}
                    </p>
                  </div>
                </div>
                {(isLive || isFinal) && team.score !== undefined && (
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: '#EDE8E0', letterSpacing: '-0.04em' }}
                  >
                    {team.score}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Odds strip ──────────────────────────────── */}
        {bestLines && (
          <div
            className="pt-3 mt-1"
            style={{ borderTop: '1px solid #1C1C1C' }}
          >
            <div className="grid grid-cols-3 gap-2">
              {bestLines.h2h && (
                <>
                  <OddsCell
                    label="Away ML"
                    price={bestLines.h2h.away.price}
                    book={bestLines.h2h.away.bookTitle}
                  />
                  <OddsCell
                    label={bestLines.totals ? `O/U ${bestLines.totals.over.point}` : '—'}
                    price={bestLines.totals?.over.price}
                    book={bestLines.totals?.over.bookTitle}
                    center
                  />
                  <OddsCell
                    label="Home ML"
                    price={bestLines.h2h.home.price}
                    book={bestLines.h2h.home.bookTitle}
                    right
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Model leans ─────────────────────────────── */}
        {prediction && (prediction.puck_line_lean || prediction.total_lean) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {prediction.puck_line_lean && (
              <span
                className="inline-flex items-center gap-1 text-xs rounded px-2 py-0.5"
                style={{
                  background: 'rgba(198,151,63,0.07)',
                  border: '1px solid rgba(198,151,63,0.18)',
                  color: '#C6973F',
                  fontSize: '0.6875rem',
                }}
              >
                <span style={{ color: '#8A6B2C' }}>PL</span>
                {prediction.puck_line_lean.side === 'home'
                  ? game.homeTeam.abbrev
                  : game.awayTeam.abbrev}{' '}
                <span style={{ color: '#8A6B2C' }}>
                  +{prediction.puck_line_lean.edge.toFixed(2)}
                </span>
              </span>
            )}
            {prediction.total_lean && (
              <span
                className="inline-flex items-center gap-1 text-xs rounded px-2 py-0.5"
                style={{
                  background: 'rgba(74,155,111,0.07)',
                  border: '1px solid rgba(74,155,111,0.18)',
                  color: '#4A9B6F',
                  fontSize: '0.6875rem',
                }}
              >
                {prediction.total_lean.side.toUpperCase()}{' '}
                <span style={{ color: '#357A56' }}>
                  +{prediction.total_lean.edge.toFixed(2)}
                </span>
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}

function OddsCell({
  label,
  price,
  book,
  center = false,
  right = false,
}: {
  label: string;
  price?: number;
  book?: string;
  center?: boolean;
  right?: boolean;
}) {
  const align = right ? 'text-right' : center ? 'text-center' : 'text-left';
  return (
    <div className={align}>
      <p style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {label}
      </p>
      {price != null ? (
        <>
          <p
            className="font-mono font-semibold"
            style={{ fontSize: '0.875rem', color: '#C6973F', letterSpacing: '0.02em' }}
          >
            {formatAmericanOdds(price)}
          </p>
          {book && (
            <p style={{ fontSize: '0.5625rem', color: '#524D47', marginTop: '0.125rem' }}>
              {book}
            </p>
          )}
        </>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#2E2E2E' }}>—</p>
      )}
    </div>
  );
}
