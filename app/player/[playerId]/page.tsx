import { getNHLPlayerProfile } from '@/lib/nhl-api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 300;

interface PlayerPageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const id = parseInt(playerId, 10);
  if (isNaN(id)) notFound();

  let player: Awaited<ReturnType<typeof getNHLPlayerProfile>> | null = null;
  let error: string | null = null;

  try {
    player = await getNHLPlayerProfile(id);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load player profile';
  }

  if (!player && !error) notFound();

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/stats/players"
          style={{ fontSize: '0.8125rem', color: '#524D47' }}
        >
          ← Back to Player Stats
        </Link>
        <div
          className="rounded px-4 py-3 text-sm"
          style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.2)',
            color: '#C04040' }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!player) return null;

  const stats = player.featuredStats?.regularSeason?.subSeason;
  const isGoalie = player.position === 'G';
  const fullName = `${player.firstName.default} ${player.lastName.default}`;

  const birthDate = new Date(player.birthDate + 'T12:00:00');
  const age = Math.floor(
    (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const heightFt = Math.floor(player.heightInInches / 12);
  const heightIn = player.heightInInches % 12;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Back link */}
      <Link
        href="/stats/players"
        style={{ fontSize: '0.8125rem', color: '#524D47', transition: 'color 200ms',
          display: 'inline-block' }}
      >
        ← Back to Player Stats
      </Link>

      {/* Player header */}
      <div
        className="rounded"
        style={{ background: '#121212', border: '1px solid #242424', padding: '1.5rem' }}
      >
        <div className="flex flex-wrap gap-6 items-start">
          {player.headshot && (
            <Image
              src={player.headshot}
              alt={fullName}
              width={100}
              height={100}
              className="rounded object-cover"
              style={{ border: '1px solid #242424' }}
              unoptimized
            />
          )}

          <div className="flex-1" style={{ minWidth: '200px' }}>
            <div className="flex items-center gap-3 mb-2">
              {player.teamLogo && (
                <Image
                  src={player.teamLogo}
                  alt={player.teamAbbrev ?? ''}
                  width={32}
                  height={32}
                  className="object-contain opacity-90"
                  unoptimized
                />
              )}
              <span style={{ fontSize: '0.75rem', color: '#524D47', letterSpacing: '0.06em' }}>
                {player.teamAbbrev}
              </span>
            </div>

            <h1
              className="text-3xl font-semibold mb-3"
              style={{ color: '#EDE8E0', letterSpacing: '-0.03em' }}
            >
              {fullName}
            </h1>

            <div className="flex flex-wrap gap-4" style={{ fontSize: '0.8125rem', color: '#8A8278' }}>
              <span>
                <span style={{ color: '#524D47' }}>#</span>
                <span style={{ color: '#EDE8E0', fontWeight: 600, marginLeft: '0.25rem' }}>
                  {player.sweaterNumber}
                </span>
              </span>
              <span>
                <span style={{ color: '#524D47' }}>Pos </span>
                <span style={{ color: '#C6973F', fontWeight: 600 }}>{player.position}</span>
              </span>
              <span>
                <span style={{ color: '#524D47' }}>Age </span>
                <span style={{ color: '#EDE8E0' }}>{age}</span>
              </span>
              <span>
                <span style={{ color: '#524D47' }}>Ht </span>
                <span style={{ color: '#EDE8E0' }}>{heightFt}&apos;{heightIn}&quot;</span>
              </span>
              <span>
                <span style={{ color: '#524D47' }}>Wt </span>
                <span style={{ color: '#EDE8E0' }}>{player.weightInPounds} lbs</span>
              </span>
              <span>
                <span style={{ color: '#524D47' }}>Born </span>
                <span style={{ color: '#EDE8E0' }}>
                  {player.birthCity?.default}, {player.birthCountry}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current season stats */}
      {stats && (
        <div
          className="rounded overflow-hidden"
          style={{ background: '#121212', border: '1px solid #242424' }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid #1C1C1C' }}
          >
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#C6973F' }}>
              Current Season
            </p>
            {player.featuredStats?.season && (
              <p style={{ fontSize: '0.6875rem', color: '#524D47' }}>
                {String(player.featuredStats.season).slice(0, 4)}–
                {String(player.featuredStats.season).slice(4)}
              </p>
            )}
          </div>

          <div className="p-4">
            {isGoalie ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'GP', value: stats.gamesPlayed, color: undefined },
                  { label: 'W', value: stats.wins, color: '#4A9B6F' },
                  { label: 'L', value: stats.losses, color: '#C04040' },
                  { label: 'SO', value: stats.shutouts, color: '#C6973F' },
                  { label: 'GAA', value: stats.goalsAgainstAvg?.toFixed(2), color: '#C04040' },
                  { label: 'SV%', value: stats.savePctg?.toFixed(3), color: '#4A9B6F' },
                ].map(({ label, value, color }) => (
                  <StatBox key={label} label={label} value={String(value ?? '—')} color={color} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'GP',   value: stats.gamesPlayed, color: undefined },
                  { label: 'G',    value: stats.goals,       color: undefined },
                  { label: 'A',    value: stats.assists,     color: undefined },
                  { label: 'PTS',  value: stats.points,      color: '#C6973F' },
                  {
                    label: '+/-',
                    value: stats.plusMinus !== undefined
                      ? stats.plusMinus > 0 ? `+${stats.plusMinus}` : stats.plusMinus
                      : undefined,
                    color: stats.plusMinus !== undefined
                      ? stats.plusMinus > 0 ? '#4A9B6F'
                        : stats.plusMinus < 0 ? '#C04040' : undefined
                      : undefined,
                  },
                  { label: 'TOI/G', value: stats.avgToi, color: undefined },
                ].map(({ label, value, color }) => (
                  <StatBox key={label} label={label} value={String(value ?? '—')} color={color} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last 5 games */}
      {player.last5Games && player.last5Games.length > 0 && (
        <div
          className="rounded overflow-hidden"
          style={{ background: '#121212', border: '1px solid #242424' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #1C1C1C' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#C6973F' }}>
              Last 5 Games
            </p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                  <th style={thStyle('left')}>Game</th>
                  {isGoalie ? (
                    <>
                      <th style={thStyle()}>Dec</th>
                      <th style={thStyle()}>SV%</th>
                      <th style={thStyle()}>TOI</th>
                    </>
                  ) : (
                    <>
                      <th style={thStyle()}>G</th>
                      <th style={thStyle()}>A</th>
                      <th style={thStyle()}>PTS</th>
                      <th style={thStyle()}>+/-</th>
                      <th style={thStyle()}>TOI</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {player.last5Games.map((g, i) => (
                  <tr
                    key={g.gameId ?? i}
                    style={{ borderBottom: i < (player.last5Games?.length ?? 0) - 1
                      ? '1px solid #1C1C1C' : 'none' }}
                  >
                    <td style={tdStyle()}>{g.gameId}</td>
                    {isGoalie ? (
                      <>
                        <td style={tdStyle(g.decision === 'W' ? '#4A9B6F'
                          : g.decision === 'L' ? '#C04040' : undefined)}>
                          {g.decision ?? '—'}
                        </td>
                        <td style={tdStyle('#4A9B6F')}>{g.savePctg?.toFixed(3) ?? '—'}</td>
                        <td style={tdStyle('#524D47')}>{g.toi ?? '—'}</td>
                      </>
                    ) : (
                      <>
                        <td style={tdStyle()}>{g.goals ?? 0}</td>
                        <td style={tdStyle()}>{g.assists ?? 0}</td>
                        <td style={tdStyle('#C6973F')}>{(g.goals ?? 0) + (g.assists ?? 0)}</td>
                        <td style={tdStyle(
                          (g.plusMinus ?? 0) > 0 ? '#4A9B6F'
                            : (g.plusMinus ?? 0) < 0 ? '#C04040' : undefined
                        )}>
                          {g.plusMinus !== undefined
                            ? g.plusMinus > 0 ? `+${g.plusMinus}` : g.plusMinus
                            : '—'}
                        </td>
                        <td style={tdStyle('#524D47')}>{g.toi ?? '—'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="rounded text-center"
      style={{ background: '#0C0C0C', border: '1px solid #242424', padding: '0.875rem' }}
    >
      <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#524D47', marginBottom: '0.375rem' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.5rem', fontWeight: 700,
        color: color ?? '#EDE8E0', letterSpacing: '-0.03em' }}>
        {value}
      </p>
    </div>
  );
}

function thStyle(align?: string): React.CSSProperties {
  return {
    padding: '0.375rem 0.5rem',
    fontSize: '0.5625rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#524D47',
    textAlign: (align as 'left' | 'center') ?? 'center',
    whiteSpace: 'nowrap',
  };
}

function tdStyle(color?: string): React.CSSProperties {
  return {
    padding: '0.5rem',
    textAlign: 'center',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.8125rem',
    color: color ?? '#8A8278',
  };
}
