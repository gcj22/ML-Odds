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
        <Link href="/stats/players" className="text-gray-400 hover:text-yellow-400 text-sm">
          ← Back to Player Stats
        </Link>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
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
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link href="/stats/players" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
        ← Back to Player Stats
      </Link>

      {/* Player header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-wrap gap-6 items-start">
          {/* Headshot */}
          {player.headshot && (
            <Image
              src={player.headshot}
              alt={fullName}
              width={120}
              height={120}
              className="rounded-xl object-cover"
              unoptimized
            />
          )}

          <div className="flex-1 min-w-[200px]">
            {/* Team logo + name */}
            <div className="flex items-center gap-3 mb-2">
              {player.teamLogo && (
                <Image
                  src={player.teamLogo}
                  alt={player.teamAbbrev ?? ''}
                  width={36}
                  height={36}
                  className="object-contain"
                  unoptimized
                />
              )}
              <span className="text-sm text-gray-400">{player.teamAbbrev}</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">{fullName}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-3">
              <span>
                <span className="text-gray-600">#</span>
                <span className="text-white font-semibold ml-1">{player.sweaterNumber}</span>
              </span>
              <span>
                <span className="text-gray-600">Pos: </span>
                <span className="text-yellow-400 font-semibold">{player.position}</span>
              </span>
              <span>
                <span className="text-gray-600">Age: </span>
                <span className="text-white">{age}</span>
              </span>
              <span>
                <span className="text-gray-600">Height: </span>
                <span className="text-white">{heightFt}&apos;{heightIn}&quot;</span>
              </span>
              <span>
                <span className="text-gray-600">Weight: </span>
                <span className="text-white">{player.weightInPounds} lbs</span>
              </span>
              <span>
                <span className="text-gray-600">Born: </span>
                <span className="text-white">
                  {player.birthCity?.default}, {player.birthCountry}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current season stats */}
      {stats && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">
            Current Season Stats
            {player.featuredStats?.season && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {String(player.featuredStats.season).slice(0, 4)}–
                {String(player.featuredStats.season).slice(4)}
              </span>
            )}
          </h2>

          {isGoalie ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'GP', value: stats.gamesPlayed },
                { label: 'W', value: stats.wins },
                { label: 'L', value: stats.losses },
                { label: 'SO', value: stats.shutouts },
                {
                  label: 'GAA',
                  value: stats.goalsAgainstAvg?.toFixed(2),
                  color: 'text-red-400',
                },
                {
                  label: 'SV%',
                  value: stats.savePctg?.toFixed(3),
                  color: 'text-green-400',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-black/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
                  <div className={`text-2xl font-bold font-mono ${color ?? 'text-white'}`}>
                    {value ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'GP', value: stats.gamesPlayed },
                { label: 'G', value: stats.goals },
                { label: 'A', value: stats.assists },
                { label: 'PTS', value: stats.points, color: 'text-yellow-400' },
                {
                  label: '+/-',
                  value:
                    stats.plusMinus !== undefined
                      ? stats.plusMinus > 0
                        ? `+${stats.plusMinus}`
                        : stats.plusMinus
                      : undefined,
                  color:
                    stats.plusMinus !== undefined
                      ? stats.plusMinus > 0
                        ? 'text-green-400'
                        : stats.plusMinus < 0
                        ? 'text-red-400'
                        : ''
                      : '',
                },
                { label: 'TOI/G', value: stats.avgToi },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-black/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
                  <div className={`text-2xl font-bold font-mono ${color ?? 'text-white'}`}>
                    {value ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Last 5 games */}
      {player.last5Games && player.last5Games.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Last 5 Games</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-gray-400">
                  <th className="pb-2 text-left font-semibold">Game</th>
                  {isGoalie ? (
                    <>
                      <th className="pb-2 text-center font-semibold">Dec</th>
                      <th className="pb-2 text-center font-semibold">SV%</th>
                      <th className="pb-2 text-center font-semibold">TOI</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-2 text-center font-semibold">G</th>
                      <th className="pb-2 text-center font-semibold">A</th>
                      <th className="pb-2 text-center font-semibold">PTS</th>
                      <th className="pb-2 text-center font-semibold">+/-</th>
                      <th className="pb-2 text-center font-semibold">TOI</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {player.last5Games.map((g, i) => (
                  <tr
                    key={g.gameId ?? i}
                    className="border-b border-border/50 hover:bg-white/[0.02]"
                  >
                    <td className="py-2 text-gray-500 text-xs font-mono">{g.gameId}</td>
                    {isGoalie ? (
                      <>
                        <td className="py-2 text-center text-xs">
                          <span
                            className={
                              g.decision === 'W'
                                ? 'text-green-400'
                                : g.decision === 'L'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }
                          >
                            {g.decision ?? '—'}
                          </span>
                        </td>
                        <td className="py-2 text-center font-mono text-green-400">
                          {g.savePctg?.toFixed(3) ?? '—'}
                        </td>
                        <td className="py-2 text-center font-mono text-gray-400">{g.toi ?? '—'}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 text-center font-mono">{g.goals ?? 0}</td>
                        <td className="py-2 text-center font-mono">{g.assists ?? 0}</td>
                        <td className="py-2 text-center font-mono text-yellow-400">
                          {(g.goals ?? 0) + (g.assists ?? 0)}
                        </td>
                        <td
                          className={`py-2 text-center font-mono ${
                            (g.plusMinus ?? 0) > 0
                              ? 'text-green-400'
                              : (g.plusMinus ?? 0) < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {g.plusMinus !== undefined
                            ? g.plusMinus > 0
                              ? `+${g.plusMinus}`
                              : g.plusMinus
                            : '—'}
                        </td>
                        <td className="py-2 text-center font-mono text-gray-400">{g.toi ?? '—'}</td>
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
