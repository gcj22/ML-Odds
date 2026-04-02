'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

// ─── Local type mirrors (kept in sync with lib/espn-nhl.ts) ──────────────────

interface ESPNSkaterStat {
  id: string;
  name: string;
  position: string;
  teamAbbr: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  shootingPct: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shortHandedGoals: number;
  avgToi: string;
}

interface ESPNGoalieStat {
  id: string;
  name: string;
  teamAbbr: string;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  goalsAgainstAvg: number;
  savePct: number;
  shotsAgainst: number;
  saves: number;
  shutouts: number;
  avgToi: string;
}

interface ESPNNHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
}

interface ESPNRosterPlayer {
  id: string;
  name: string;
  jersey: string;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  savePct: number;
  goalsAgainstAvg: number;
}

interface ESPNPlayerSearchResult {
  id: string;
  name: string;
  position: string;
  teamAbbr: string;
  teamName: string;
  headshot?: string;
}

type Tab = 'leaders' | 'allPlayers' | 'roster' | 'search';
type SortDir = 'asc' | 'desc';

// ─── Generic sort hook ────────────────────────────────────────────────────────

function useSorted<T extends object>(rows: T[], defaultKey: keyof T & string) {
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

  function toggle(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key as keyof T & string);
      setSortDir('desc');
    }
  }

  return { sorted, sortKey, sortDir, toggle };
}

// ─── Shared header cell ───────────────────────────────────────────────────────

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
  return (
    <th
      className="px-3 py-3 text-center cursor-pointer select-none whitespace-nowrap hover:text-white transition-colors"
      onClick={() => onClick(colKey)}
    >
      {label}
      {colKey === sortKey && (
        <span className="ml-1 text-yellow-400">
          {sortDir === 'desc' ? '▼' : '▲'}
        </span>
      )}
    </th>
  );
}

// ─── Skater table ─────────────────────────────────────────────────────────────

function SkatersTable({ skaters }: { skaters: ESPNSkaterStat[] }) {
  const { sorted, sortKey, sortDir, toggle } = useSorted(skaters, 'points');

  if (skaters.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">No skater data.</p>
    );
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
      <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
        <span className="text-sm font-semibold">Skaters</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[rgb(var(--card))] text-[rgb(var(--muted))]">
            <tr className="border-b border-[rgb(var(--border))]">
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
                  ['S%', 'shootingPct'],
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
                  onClick={toggle}
                />
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
            {sorted.map((s) => (
              <tr key={s.id} className="border-b border-[rgb(var(--border))]/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {s.name}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.teamAbbr}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.position}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.gamesPlayed}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.goals}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.assists}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs text-yellow-400 font-bold">
                  {s.points}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.plusMinus > 0 ? `+${s.plusMinus}` : s.plusMinus}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.shots}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof s.shootingPct === 'number' && s.shootingPct > 0
                    ? s.shootingPct > 1
                      ? `${s.shootingPct.toFixed(1)}%`
                      : `${(s.shootingPct * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.powerPlayGoals}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.powerPlayPoints}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.shortHandedGoals}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {s.avgToi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Goalie table ─────────────────────────────────────────────────────────────

function GoaliesTable({ goalies }: { goalies: ESPNGoalieStat[] }) {
  const { sorted, sortKey, sortDir, toggle } = useSorted(goalies, 'savePct');

  if (goalies.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">No goalie data.</p>
    );
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
      <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
        <span className="text-sm font-semibold">Goalies</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[rgb(var(--card))] text-[rgb(var(--muted))]">
            <tr className="border-b border-[rgb(var(--border))]">
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
                  ['SV%', 'savePct'],
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
                  onClick={toggle}
                />
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
            {sorted.map((g) => (
              <tr key={g.id} className="border-b border-[rgb(var(--border))]/60">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {g.name}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.teamAbbr}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.gamesPlayed}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.gamesStarted}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs text-yellow-400 font-bold">
                  {g.wins}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.losses}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.otLosses}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof g.goalsAgainstAvg === 'number' && g.goalsAgainstAvg > 0
                    ? g.goalsAgainstAvg.toFixed(2)
                    : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {typeof g.savePct === 'number' && g.savePct > 0
                    ? g.savePct > 1
                      ? `${g.savePct.toFixed(1)}%`
                      : g.savePct.toFixed(3)
                    : '—'}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.shotsAgainst}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.saves}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.shutouts}
                </td>
                <td className="px-3 py-3 text-center font-mono text-xs">
                  {g.avgToi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Roster table ─────────────────────────────────────────────────────────────

function RosterTable({ players }: { players: ESPNRosterPlayer[] }) {
  const { sorted, sortKey, sortDir, toggle } = useSorted(players, 'points');

  const skaters = sorted.filter((p) => p.position !== 'G');
  const goalies = sorted.filter((p) => p.position === 'G');

  return (
    <div className="space-y-4">
      {skaters.length > 0 && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
            <span className="text-sm font-semibold">Skaters</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[rgb(var(--card))] text-[rgb(var(--muted))]">
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Player
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">
                    Pos
                  </th>
                  {(
                    [
                      ['GP', 'gamesPlayed'],
                      ['G', 'goals'],
                      ['A', 'assists'],
                      ['PTS', 'points'],
                      ['+/-', 'plusMinus'],
                    ] as [string, string][]
                  ).map(([label, key]) => (
                    <Th
                      key={key}
                      label={label}
                      colKey={key}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onClick={toggle}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
                {skaters.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[rgb(var(--border))]/60"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.position}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.gamesPlayed}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.goals}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.assists}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs text-yellow-400 font-bold">
                      {p.points}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {goalies.length > 0 && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
            <span className="text-sm font-semibold">Goalies</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[rgb(var(--card))] text-[rgb(var(--muted))]">
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Player
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">
                    GP
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">
                    GAA
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">
                    SV%
                  </th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
                {goalies.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[rgb(var(--border))]/60"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.gamesPlayed}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.goalsAgainstAvg > 0
                        ? p.goalsAgainstAvg.toFixed(2)
                        : '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs">
                      {p.savePct > 0
                        ? p.savePct > 1
                          ? `${p.savePct.toFixed(1)}%`
                          : p.savePct.toFixed(3)
                        : '—'}
                    </td>
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

// ─── Shared loading / error components ───────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
      {message}
    </div>
  );
}

// ─── Leaders tab ──────────────────────────────────────────────────────────────

function LeadersTab() {
  const [skaters, setSkaters] = useState<ESPNSkaterStat[]>([]);
  const [goalies, setGoalies] = useState<ESPNGoalieStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/espn/nhl/leaders?category=skaters').then((r) => r.json()),
      fetch('/api/espn/nhl/leaders?category=goalies').then((r) => r.json()),
    ])
      .then(([s, g]) => {
        if (s.error && g.error) {
          setError(s.error || g.error);
        }
        setSkaters(s.skaters ?? []);
        setGoalies(g.goalies ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error && skaters.length === 0 && goalies.length === 0)
    return <ErrorBox message={`Failed to load leaders: ${error}`} />;

  return (
    <div className="space-y-6">
      {error && <ErrorBox message={`Partial error: ${error}`} />}
      <SkatersTable skaters={skaters} />
      <GoaliesTable goalies={goalies} />
    </div>
  );
}

// ─── All Players tab ──────────────────────────────────────────────────────────

function AllPlayersTab() {
  const [type, setType] = useState<'skaters' | 'goalies'>('skaters');
  const [page, setPage] = useState(1);
  const [players, setPlayers] = useState<
    (ESPNSkaterStat | ESPNGoalieStat)[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(
    (t: 'skaters' | 'goalies', p: number) => {
      setLoading(true);
      setError(null);
      fetch(`/api/espn/nhl/players?type=${t}&page=${p}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          setPlayers(data.players ?? []);
          setTotalPages(data.pagination?.pages ?? 1);
        })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    fetchPlayers(type, page);
  }, [type, page, fetchPlayers]);

  function switchType(t: 'skaters' | 'goalies') {
    setType(t);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2">
        {(['skaters', 'goalies'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              type === t
                ? 'bg-yellow-400 text-black'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={`Error: ${error}`} />}

      {loading ? (
        <Spinner />
      ) : type === 'skaters' ? (
        <SkatersTable skaters={players as ESPNSkaterStat[]} />
      ) : (
        <GoaliesTable goalies={players as ESPNGoalieStat[]} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded text-sm bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded text-sm bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Team Roster tab ──────────────────────────────────────────────────────────

function TeamRosterTab() {
  const [teams, setTeams] = useState<ESPNNHLTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [skaters, setSkaters] = useState<ESPNRosterPlayer[]>([]);
  const [goalies, setGoalies] = useState<ESPNRosterPlayer[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/espn/nhl/teams')
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams ?? []);
        if (data.error) setError(data.error);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setTeamsLoading(false));
  }, []);

  function fetchRoster(teamId: string) {
    setSelectedTeamId(teamId);
    if (!teamId) return;
    setRosterLoading(true);
    setError(null);
    fetch(`/api/espn/nhl/teams/${teamId}/roster`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setSkaters(data.skaters ?? []);
        setGoalies(data.goalies ?? []);
        setTeamName(data.teamName ?? '');
      })
      .catch((e) => setError(String(e)))
      .finally(() => setRosterLoading(false));
  }

  return (
    <div className="space-y-4">
      {/* Team dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="team-select" className="text-sm text-gray-400 shrink-0">
          Select team:
        </label>
        {teamsLoading ? (
          <div className="h-9 w-48 bg-white/5 rounded animate-pulse" />
        ) : (
          <select
            id="team-select"
            value={selectedTeamId}
            onChange={(e) => fetchRoster(e.target.value)}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400/50 min-w-[200px]"
          >
            <option value="">— choose a team —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.abbreviation})
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorBox message={`Error: ${error}`} />}

      {!selectedTeamId && !teamsLoading && (
        <p className="text-gray-500 text-sm">
          Select a team to see roster stats.
        </p>
      )}

      {rosterLoading && <Spinner />}

      {!rosterLoading && selectedTeamId && (
        <>
          {teamName && (
            <h3 className="text-lg font-semibold text-yellow-400">{teamName}</h3>
          )}
          {skaters.length === 0 && goalies.length === 0 && !error ? (
            <p className="text-gray-500 text-sm">No roster data available.</p>
          ) : (
            <RosterTable players={[...skaters, ...goalies]} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Search tab ───────────────────────────────────────────────────────────────

function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ESPNPlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function doSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    fetch(`/api/espn/nhl/search?q=${encodeURIComponent(trimmed)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setResults(data.results ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Search player name… (e.g. McDavid)"
          className="flex-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50"
        />
        <button
          onClick={() => doSearch(query)}
          className="px-4 py-2 rounded text-sm font-medium bg-yellow-400 text-black hover:bg-yellow-300 transition-colors"
        >
          Search
        </button>
      </div>

      {error && <ErrorBox message={`Error: ${error}`} />}
      {loading && <Spinner />}

      {!loading && searched && results.length === 0 && !error && (
        <p className="text-gray-500 text-sm">No players found.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-[rgb(var(--muted))]">
              <tr className="border-b border-[rgb(var(--border))]">
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-3 py-3 text-center">Pos</th>
                <th className="px-3 py-3 text-center">Team</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-white/[0.02]">
              {results.map((r) => (
                <tr key={r.id} className="border-b border-[rgb(var(--border))]/60">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {r.headshot && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.headshot}
                        alt={r.name}
                        className="inline-block w-7 h-7 rounded-full mr-2 align-middle object-cover"
                      />
                    )}
                    {r.name}
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-xs">
                    {r.position}
                  </td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span className="font-mono">{r.teamAbbr}</span>
                    {r.teamName !== r.teamAbbr && r.teamName !== '—' && (
                      <span className="ml-1 text-gray-400">({r.teamName})</span>
                    )}
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

// ─── Main component ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'leaders', label: 'Leaders' },
  { id: 'allPlayers', label: 'All Players' },
  { id: 'roster', label: 'Team Roster' },
  { id: 'search', label: 'Search' },
];

export default function PlayerStatsTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('leaders');

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[rgb(var(--border))] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'leaders' && <LeadersTab />}
      {activeTab === 'allPlayers' && <AllPlayersTab />}
      {activeTab === 'roster' && <TeamRosterTab />}
      {activeTab === 'search' && <SearchTab />}
    </div>
  );
}
