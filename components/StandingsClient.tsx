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
  { key: 'gamesPlayed',         label: 'GP',   title: 'Games Played' },
  { key: 'wins',                label: 'W',    title: 'Wins' },
  { key: 'losses',              label: 'L',    title: 'Losses' },
  { key: 'otLosses',            label: 'OTL',  title: 'Overtime Losses' },
  { key: 'points',              label: 'PTS',  title: 'Points' },
  { key: 'pointPctg',           label: 'P%',   title: 'Points Percentage' },
  { key: 'regulationWins',      label: 'RW',   title: 'Regulation Wins' },
  { key: 'regulationPlusOtWins',label: 'ROW',  title: 'Regulation + OT Wins' },
  { key: 'goalFor',             label: 'GF',   title: 'Goals For' },
  { key: 'goalAgainst',         label: 'GA',   title: 'Goals Against' },
  { key: 'goalDiff',            label: 'DIFF', title: 'Goal Differential' },
];

function getVal(team: NHLStandingsTeam, key: SortKey): number {
  if (key === 'goalDiff') return team.goalDifferential;
  const v = team[key as keyof NHLStandingsTeam];
  return typeof v === 'number' ? v : 0;
}

function StandingsTable({ teams }: StandingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(
    () =>
      [...teams].sort((a, b) => {
        const diff = getVal(a, sortKey) - getVal(b, sortKey);
        return sortAsc ? diff : -diff;
      }),
    [teams, sortKey, sortAsc]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const thStyle: React.CSSProperties = {
    padding: '0.625rem 0.75rem',
    fontSize: '0.5625rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#524D47',
    cursor: 'pointer',
    userSelect: 'none',
    textAlign: 'center',
    transition: 'color 200ms',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      className="overflow-x-auto rounded"
      style={{ border: '1px solid #242424' }}
    >
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1C1C1C', background: '#121212' }}>
            <th style={{ ...thStyle, textAlign: 'center', width: '2.5rem' }}>#</th>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: '180px' }}>Team</th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                title={col.title}
                onClick={() => handleSort(col.key)}
                style={{
                  ...thStyle,
                  color: sortKey === col.key ? '#C6973F' : '#524D47',
                }}
                onMouseEnter={(e) => {
                  if (sortKey !== col.key)
                    (e.currentTarget as HTMLElement).style.color = '#8A8278';
                }}
                onMouseLeave={(e) => {
                  if (sortKey !== col.key)
                    (e.currentTarget as HTMLElement).style.color = '#524D47';
                }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ marginLeft: '0.25rem' }}>{sortAsc ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            <th style={{ ...thStyle }}>STK</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => {
            const diff = team.goalDifferential;
            const isWinStreak = team.streakCode === 'W';
            return (
              <tr
                key={team.teamAbbrev.default}
                style={{
                  borderBottom: i < sorted.length - 1 ? '1px solid #1C1C1C' : 'none',
                  transition: 'background 200ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#181818';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center',
                  fontSize: '0.75rem', color: '#524D47' }}>
                  {i + 1}
                </td>
                <td style={{ padding: '0.625rem 0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {team.teamLogo && (
                      <Image
                        src={team.teamLogo}
                        alt={team.teamAbbrev.default}
                        width={26}
                        height={26}
                        className="object-contain shrink-0 opacity-90"
                        unoptimized
                      />
                    )}
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDE8E0',
                        letterSpacing: '-0.01em' }}>
                        {team.teamName.default}
                      </p>
                      <p style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.04em' }}>
                        {team.divisionName}
                      </p>
                    </div>
                  </div>
                </td>
                {COLUMNS.map((col) => {
                  const val = getVal(team, col.key);
                  let display: string =
                    col.key === 'pointPctg' ? val.toFixed(3) : String(val);
                  if (col.key === 'goalDiff') display = diff >= 0 ? `+${diff}` : String(diff);
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: '0.625rem 0.75rem',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.8125rem',
                        fontWeight: col.key === 'points' ? 700 : 500,
                        color:
                          col.key === 'points'
                            ? '#C6973F'
                            : col.key === 'goalDiff'
                            ? diff > 0
                              ? '#4A9B6F'
                              : diff < 0
                              ? '#C04040'
                              : '#524D47'
                            : '#8A8278',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {display}
                    </td>
                  );
                })}
                <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                  {team.streakCode && team.streakCount ? (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.1875rem',
                        letterSpacing: '0.04em',
                        background: isWinStreak ? 'rgba(74,155,111,0.12)' : 'rgba(192,64,64,0.12)',
                        border: isWinStreak ? '1px solid rgba(74,155,111,0.2)' : '1px solid rgba(192,64,64,0.2)',
                        color: isWinStreak ? '#4A9B6F' : '#C04040',
                      }}
                    >
                      {team.streakCode}{team.streakCount}
                    </span>
                  ) : (
                    <span style={{ color: '#242424' }}>—</span>
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
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #1C1C1C' }}>
        {([
          { id: 'league',   label: 'League' },
          { id: 'eastern',  label: 'Eastern' },
          { id: 'western',  label: 'Western' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: tab === id ? '#C6973F' : '#524D47',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === id ? '1.5px solid #C6973F' : '1.5px solid transparent',
              cursor: 'pointer',
              transition: 'color 200ms, border-color 200ms',
              marginBottom: '-1px',
            }}
            onMouseEnter={(e) => {
              if (tab !== id) (e.currentTarget as HTMLButtonElement).style.color = '#8A8278';
            }}
            onMouseLeave={(e) => {
              if (tab !== id) (e.currentTarget as HTMLButtonElement).style.color = '#524D47';
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'league' && <StandingsTable teams={filtered} />}

      {divisions &&
        Array.from(divisions.entries()).map(([divName, teams]) => (
          <section key={divName}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#C6973F', marginBottom: '0.75rem' }}>
              {divName} Division
            </p>
            <StandingsTable teams={teams} />
          </section>
        ))}
    </div>
  );
}
