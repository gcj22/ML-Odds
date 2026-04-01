'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NHLSkaterStat, NHLGoalieStatEntry } from '@/lib/types';

type SkaterSortKey = keyof Pick<
  NHLSkaterStat,
  | 'goals'
  | 'assists'
  | 'points'
  | 'plusMinus'
  | 'shots'
  | 'shootingPctg'
  | 'powerPlayPoints'
  | 'gamesPlayed'
>;

type GoalieSortKey = keyof Pick<
  NHLGoalieStatEntry,
  'wins' | 'losses' | 'goalsAgainstAvg' | 'savePctg' | 'shutouts' | 'gamesPlayed'
>;

const SKATER_COLS: { key: SkaterSortKey; label: string; title: string }[] = [
  { key: 'gamesPlayed', label: 'GP', title: 'Games Played' },
  { key: 'goals', label: 'G', title: 'Goals' },
  { key: 'assists', label: 'A', title: 'Assists' },
  { key: 'points', label: 'PTS', title: 'Points' },
  { key: 'plusMinus', label: '+/-', title: 'Plus/Minus' },
  { key: 'shots', label: 'SOG', title: 'Shots on Goal' },
  { key: 'shootingPctg', label: 'S%', title: 'Shooting Percentage' },
  { key: 'powerPlayPoints', label: 'PPP', title: 'Power Play Points' },
];

const GOALIE_COLS: { key: GoalieSortKey; label: string; title: string }[] = [
  { key: 'gamesPlayed', label: 'GP', title: 'Games Played' },
  { key: 'wins', label: 'W', title: 'Wins' },
  { key: 'losses', label: 'L', title: 'Losses' },
  { key: 'goalsAgainstAvg', label: 'GAA', title: 'Goals Against Average' },
  { key: 'savePctg', label: 'SV%', title: 'Save Percentage' },
  { key: 'shutouts', label: 'SO', title: 'Shutouts' },
];

interface PlayerStatsClientProps {
  skaters: NHLSkaterStat[];
  goalies: NHLGoalieStatEntry[];
}

export default function PlayerStatsClient({ skaters, goalies }: PlayerStatsClientProps) {
  const [playerType, setPlayerType] = useState<'skaters' | 'goalies'>('skaters');
  const [search, setSearch] = useState('');
  const [skaterSort, setSkaterSort] = useState<SkaterSortKey>('points');
  const [skaterAsc, setSkaterAsc] = useState(false);
  const [goalieSort, setGoalieSort] = useState<GoalieSortKey>('wins');
  const [goalieAsc, setGoalieAsc] = useState(false);

  const filteredSkaters = useMemo(() => {
    const q = search.toLowerCase();
    return [...skaters]
      .filter((s) => {
        if (!q) return true;
        const name = `${s.firstName.default} ${s.lastName.default}`.toLowerCase();
        return name.includes(q) || s.teamAbbrev.toLowerCase().includes(q) || s.position.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const diff = (a[skaterSort] as number) - (b[skaterSort] as number);
        return skaterAsc ? diff : -diff;
      });
  }, [skaters, search, skaterSort, skaterAsc]);

  const filteredGoalies = useMemo(() => {
    const q = search.toLowerCase();
    return [...goalies]
      .filter((g) => {
        if (!q) return true;
        const name = `${g.firstName.default} ${g.lastName.default}`.toLowerCase();
        return name.includes(q) || g.teamAbbrev.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const diff = (a[goalieSort] as number) - (b[goalieSort] as number);
        return goalieAsc ? diff : -diff;
      });
  }, [goalies, search, goalieSort, goalieAsc]);

  const handleSkaterSort = (key: SkaterSortKey) => {
    if (skaterSort === key) {
      setSkaterAsc((a) => !a);
    } else {
      setSkaterSort(key);
      setSkaterAsc(false);
    }
  };

  const handleGoalieSort = (key: GoalieSortKey) => {
    if (goalieSort === key) {
      setGoalieAsc((a) => !a);
    } else {
      setGoalieSort(key);
      setGoalieAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Player type tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setPlayerType('skaters')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              playerType === 'skaters'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Skaters
          </button>
          <button
            onClick={() => setPlayerType('goalies')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              playerType === 'goalies'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Goalies
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search player or team…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 flex-1 max-w-xs"
        />

        <span className="text-xs text-gray-500">
          {playerType === 'skaters' ? filteredSkaters.length : filteredGoalies.length} players
        </span>
      </div>

      {/* Skaters Table */}
      {playerType === 'skaters' && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold w-8">#</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold min-w-[180px]">Player</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">POS</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Team</th>
                {SKATER_COLS.map((col) => (
                  <th
                    key={col.key}
                    title={col.title}
                    onClick={() => handleSkaterSort(col.key)}
                    className={`px-3 py-3 text-center font-semibold cursor-pointer select-none hover:text-yellow-400 transition-colors ${
                      skaterSort === col.key ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  >
                    {col.label}
                    {skaterSort === col.key && (
                      <span className="ml-1">{skaterAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">TOI</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkaters.map((player, i) => (
                <tr
                  key={player.playerId}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 text-center">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/player/${player.playerId}`}
                      className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                    >
                      {player.headshot && (
                        <Image
                          src={player.headshot}
                          alt={`${player.firstName.default} ${player.lastName.default}`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover shrink-0"
                          unoptimized
                        />
                      )}
                      <span className="font-semibold">
                        {player.firstName.default} {player.lastName.default}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs font-mono">
                    {player.position}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 font-mono text-xs">
                    {player.teamAbbrev}
                  </td>
                  {SKATER_COLS.map((col) => {
                    const val = player[col.key];
                    let display = col.key === 'shootingPctg'
                      ? `${(val as number).toFixed(1)}%`
                      : String(val);
                    if (col.key === 'plusMinus' && (val as number) > 0) display = `+${val}`;
                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-3 text-center font-mono ${
                          col.key === 'points'
                            ? 'text-yellow-400 font-bold'
                            : col.key === 'plusMinus'
                            ? (val as number) > 0
                              ? 'text-green-400'
                              : (val as number) < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                            : 'text-gray-200'
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">
                    {player.avgToi ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Goalies Table */}
      {playerType === 'goalies' && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold w-8">#</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold min-w-[180px]">Goalie</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Team</th>
                {GOALIE_COLS.map((col) => (
                  <th
                    key={col.key}
                    title={col.title}
                    onClick={() => handleGoalieSort(col.key)}
                    className={`px-3 py-3 text-center font-semibold cursor-pointer select-none hover:text-yellow-400 transition-colors ${
                      goalieSort === col.key ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  >
                    {col.label}
                    {goalieSort === col.key && (
                      <span className="ml-1">{goalieAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">TOI/G</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoalies.map((goalie, i) => (
                <tr
                  key={goalie.playerId}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 text-center">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/player/${goalie.playerId}`}
                      className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                    >
                      {goalie.headshot && (
                        <Image
                          src={goalie.headshot}
                          alt={`${goalie.firstName.default} ${goalie.lastName.default}`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover shrink-0"
                          unoptimized
                        />
                      )}
                      <span className="font-semibold">
                        {goalie.firstName.default} {goalie.lastName.default}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 font-mono text-xs">
                    {goalie.teamAbbrev}
                  </td>
                  {GOALIE_COLS.map((col) => {
                    const val = goalie[col.key] as number;
                    let display = String(val);
                    if (col.key === 'goalsAgainstAvg') display = val.toFixed(2);
                    if (col.key === 'savePctg') display = val.toFixed(3);
                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-3 text-center font-mono ${
                          col.key === 'wins'
                            ? 'text-yellow-400 font-bold'
                            : col.key === 'savePctg' || col.key === 'shutouts'
                            ? 'text-green-400'
                            : col.key === 'goalsAgainstAvg'
                            ? 'text-red-400'
                            : 'text-gray-200'
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">
                    {goalie.avgToi ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
