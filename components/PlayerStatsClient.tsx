'use client';

import React, { useState } from 'react';
import type { NHLSkaterStat, NHLGoalieStatEntry } from '@/lib/types';

type SortKey = string;
type SortDir = 'asc' | 'desc';

function useSortedRows<T extends object>(rows: T[], defaultKey: keyof T & string) {
  const [sortKey, setSortKey] = useState<keyof T & string>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv;
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv));
  });

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key as keyof T & string);
      setSortDir('desc');
    }
  }

  return { sorted, sortKey, sortDir, toggleSort };
}

function Th({
  label,
  colKey,
  sortKey,
  sortDir,
  onClick,
}: {
  label: string;
  colKey: string;
  sortKey: string;
  sortDir: SortDir;
  onClick: (k: string) => void;
}) {
  const active = colKey === sortKey;
  return (
    <th
      className="px-3 py-3 text-center cursor-pointer select-none whitespace-nowrap hover:text-[#EDE8E0] transition-colors"
      onClick={() => onClick(colKey)}
    >
      {label}
      {active && (
        <span className="ml-1 text-[#C6973F]">
          {sortDir === 'desc' ? '▼' : '▲'}
        </span>
      )}
    </th>
  );
}

function SkatersTable({ skaters }: { skaters: NHLSkaterStat[] }) {
  const { sorted, sortKey, sortDir, toggleSort } = useSortedRows(skaters, 'points');

  return (
    <div className="rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1C1C1C]">
        <span className="text-sm font-semibold">Skaters</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#121212]">
            <tr className="border-b border-[#1C1C1C]">
              <th className="px-4 py-3 text-left whitespace-nowrap">Player</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Team</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Pos</th>
              {(
                [
                  ['GP', 'gamesPlayed'],
                  ['G', 'goals'],
                  ['A', 'assists'],
                  ['PTS', 'points'],
                  ['+/-', 'plusMinus'],
                  ['SOG', 'shots'],
                  ['S%', 'shootingPctg'],
                  ['PPG', 'powerPlayGoals'],
                  ['PPP', 'powerPlayPoints'],
                  ['SHG', 'shortHandedGoals'],
                  ['TOI/G', 'avgToi'],
                ] as [string, string][]
              ).map(([label, key]) => (
                <Th
                  key={key}
                  label={label}
                  colKey={key}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onClick={toggleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
            {sorted.map((s) => (
              <tr key={s.playerId} className="border-b border-[#1C1C1C]/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {s.firstName.default} {s.lastName.default}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.teamAbbrev}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.position}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.gamesPlayed}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.goals}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.assists}</td>
                <td className="px-3 py-3 text-center font-mono text-xs text-[#C6973F] font-bold">
                  {s.points}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.plusMinus > 0 ? `+${s.plusMinus}` : s.plusMinus}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.shots}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof s.shootingPctg === 'number' ? `${(s.shootingPctg * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.powerPlayGoals}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.powerPlayPoints}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.shortHandedGoals}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{s.avgToi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GoaliesTable({ goalies }: { goalies: NHLGoalieStatEntry[] }) {
  const { sorted, sortKey, sortDir, toggleSort } = useSortedRows(goalies, 'wins');

  return (
    <div className="rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1C1C1C]">
        <span className="text-sm font-semibold">Goalies</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#121212]">
            <tr className="border-b border-[#1C1C1C]">
              <th className="px-4 py-3 text-left whitespace-nowrap">Player</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Team</th>
              {(
                [
                  ['GP', 'gamesPlayed'],
                  ['GS', 'gamesStarted'],
                  ['W', 'wins'],
                  ['L', 'losses'],
                  ['OTL', 'otLosses'],
                  ['GAA', 'goalsAgainstAvg'],
                  ['SV%', 'savePctg'],
                  ['SA', 'shotsAgainst'],
                  ['SV', 'saves'],
                  ['SO', 'shutouts'],
                  ['TOI/G', 'avgToi'],
                ] as [string, string][]
              ).map(([label, key]) => (
                <Th
                  key={key}
                  label={label}
                  colKey={key}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onClick={toggleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
            {sorted.map((g) => (
              <tr key={g.playerId} className="border-b border-[#1C1C1C]/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {g.firstName.default} {g.lastName.default}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.teamAbbrev}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.gamesPlayed}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.gamesStarted}</td>
                <td className="px-3 py-3 text-center font-mono text-xs text-[#C6973F] font-bold">
                  {g.wins}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.losses}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.otLosses}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof g.goalsAgainstAvg === 'number' ? g.goalsAgainstAvg.toFixed(2) : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof g.savePctg === 'number' ? g.savePctg.toFixed(3) : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.shotsAgainst}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.saves}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.shutouts}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{g.avgToi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlayerStatsClient({
  skaters,
  goalies,
}: {
  skaters: NHLSkaterStat[];
  goalies: NHLGoalieStatEntry[];
}) {
  return (
    <div className="space-y-6">
      {skaters.length > 0 && <SkatersTable skaters={skaters} />}
      {goalies.length > 0 && <GoaliesTable goalies={goalies} />}
    </div>
  );
}
