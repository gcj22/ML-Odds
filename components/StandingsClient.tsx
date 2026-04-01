'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { NHLStandingsTeam } from '@/lib/types';

type SortKey = keyof NHLStandingsTeam | 'goalDiff';
type Tab = 'league' | 'eastern' | 'western';

interface StandingsTableProps {
  teams: NHLStandingsTeam[];
}

const COLUMNS: { key: SortKey; label: string; title: string }[] = [
  { key: 'gamesPlayed', label: 'GP', title: 'Games Played' },
  { key: 'wins', label: 'W', title: 'Wins' },
  { key: 'losses', label: 'L', title: 'Losses' },
  { key: 'otLosses', label: 'OTL', title: 'Overtime Losses' },
  { key: 'points', label: 'PTS', title: 'Points' },
  { key: 'pointPctg', label: 'P%', title: 'Points Percentage' },
  { key: 'regulationWins', label: 'RW', title: 'Regulation Wins' },
  { key: 'regulationPlusOtWins', label: 'ROW', title: 'Regulation + OT Wins' },
  { key: 'goalFor', label: 'GF', title: 'Goals For' },
  { key: 'goalAgainst', label: 'GA', title: 'Goals Against' },
  { key: 'goalDiff', label: 'DIFF', title: 'Goal Differential' },
];

function getVal(team: NHLStandingsTeam, key: SortKey): number {
  if (key === 'goalDiff') return team.goalDifferential;
  const v = team[key as keyof NHLStandingsTeam];
  return typeof v === 'number' ? v : 0;
}

function StandingsTable({ teams }: StandingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...teams].sort((a, b) => {
      const diff = getVal(a, sortKey) - getVal(b, sortKey);
      return sortAsc ? diff : -diff;
    });
  }, [teams, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((a) => !a);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-card border-b border-border">
            <th className="px-4 py-3 text-left text-gray-400 font-semibold w-8">#</th>
            <th className="px-4 py-3 text-left text-gray-400 font-semibold min-w-[180px]">Team</th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                title={col.title}
                onClick={() => handleSort(col.key)}
                className={`px-3 py-3 text-center font-semibold cursor-pointer select-none hover:text-yellow-400 transition-colors ${
                  sortKey === col.key ? 'text-yellow-400' : 'text-gray-400'
                }`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-gray-400 font-semibold">STK</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => {
            const diff = team.goalDifferential;
            const isWinStreak = team.streakCode === 'W';
            return (
              <tr
                key={team.teamAbbrev.default}
                className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 text-center">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {team.teamLogo && (
                      <Image
                        src={team.teamLogo}
                        alt={team.teamAbbrev.default}
                        width={28}
                        height={28}
                        className="object-contain shrink-0"
                        unoptimized
                      />
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {team.teamName.default}
                      </div>
                      <div className="text-xs text-gray-500">{team.divisionName}</div>
                    </div>
                  </div>
                </td>
                {COLUMNS.map((col) => {
                  const val = getVal(team, col.key);
                  let display: string = col.key === 'pointPctg' ? val.toFixed(3) : String(val);
                  if (col.key === 'goalDiff') display = diff >= 0 ? `+${diff}` : String(diff);
                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-3 text-center font-mono ${
                        col.key === 'points'
                          ? 'text-yellow-400 font-bold'
                          : col.key === 'goalDiff'
                          ? diff > 0
                            ? 'text-green-400'
                            : diff < 0
                            ? 'text-red-400'
                            : 'text-gray-400'
                          : 'text-gray-200'
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  {team.streakCode && team.streakCount ? (
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        isWinStreak
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {team.streakCode}{team.streakCount}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsClient({ standings }: { standings: NHLStandingsTeam[] }) {
  const [tab, setTab] = useState<Tab>('league');

  const filtered = useMemo(() => {
    if (tab === 'eastern') return standings.filter((t) => t.conferenceName === 'Eastern');
    if (tab === 'western') return standings.filter((t) => t.conferenceName === 'Western');
    return standings;
  }, [standings, tab]);

  // Group by division when showing a conference
  const divisions = useMemo(() => {
    if (tab === 'league') return null;
    const map = new Map<string, NHLStandingsTeam[]>();
    for (const t of filtered) {
      const list = map.get(t.divisionName) ?? [];
      list.push(t);
      map.set(t.divisionName, list);
    }
    return map;
  }, [filtered, tab]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {([
          { id: 'league', label: 'League' },
          { id: 'eastern', label: 'Eastern Conference' },
          { id: 'western', label: 'Western Conference' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'league' && <StandingsTable teams={filtered} />}

      {divisions &&
        Array.from(divisions.entries()).map(([divName, teams]) => (
          <section key={divName}>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-3">
              {divName} Division
            </h3>
            <StandingsTable teams={teams} />
          </section>
        ))}
    </div>
  );
}
