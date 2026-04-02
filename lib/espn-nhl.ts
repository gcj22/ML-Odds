/** ESPN NHL API helpers, types, and normalization utilities. */

export const ESPN_NHL_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';
export const ESPN_SEARCH_BASE =
  'https://site.api.espn.com/apis/common/v3/search';

/**
 * Returns the four-digit start year of the current NHL season.
 * e.g. returns 2025 for the 2025-2026 season (Oct 2025 – Jun 2026).
 * Before July we're still in the season that started the previous year.
 */
export function getESPNCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  return month >= 7 ? year : year - 1;
}

// ─── ESPN raw response shapes ────────────────────────────────────────────────

export interface ESPNStatsCategory {
  name: string;
  displayName: string;
  abbreviation: string;
}

export interface ESPNStatsAthleteEntry {
  athlete: {
    id: string;
    displayName: string;
    shortName?: string;
    position?: { abbreviation: string; name?: string };
    team?: { id: string; abbreviation: string; displayName?: string };
    headshot?: { href: string };
  };
  stats: string[];
}

export interface ESPNStatsPagination {
  count: number;
  limit: number;
  page: number;
  pages: number;
}

export interface ESPNStatsResponse {
  athletes?: ESPNStatsAthleteEntry[];
  categories?: ESPNStatsCategory[];
  pagination?: ESPNStatsPagination;
}

export interface ESPNTeamsResponse {
  sports?: Array<{
    leagues?: Array<{
      teams?: Array<{
        team: {
          id: string;
          displayName: string;
          abbreviation: string;
          logos?: Array<{ href: string }>;
        };
      }>;
    }>;
  }>;
}

export interface ESPNRosterResponse {
  coach?: unknown[];
  athletes?: Array<{
    items?: Array<{
      id: string;
      displayName?: string;
      fullName?: string;
      shortName?: string;
      jersey?: string;
      position?: { abbreviation: string; name?: string };
    }>;
  }>;
}

export interface ESPNSearchResponse {
  results?: Array<{
    count?: number;
    type?: string;
    contents?: Array<{
      id: string;
      displayName?: string;
      shortName?: string;
      position?: { abbreviation: string };
      team?: { abbreviation?: string; displayName?: string };
      headshot?: { href: string };
    }>;
  }>;
}

// ─── Normalised output types ─────────────────────────────────────────────────

export interface ESPNSkaterStat {
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

export interface ESPNGoalieStat {
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

export interface ESPNNHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
}

export interface ESPNRosterPlayer {
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

export interface ESPNPlayerSearchResult {
  id: string;
  name: string;
  position: string;
  teamAbbr: string;
  teamName: string;
  headshot?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Look up a numeric stat value by category name. Returns 0 if not found. */
export function getStatByName(
  stats: string[],
  categories: ESPNStatsCategory[],
  name: string,
): number {
  const idx = categories.findIndex((c) => c.name === name);
  if (idx === -1 || idx >= stats.length) return 0;
  return parseFloat(stats[idx]) || 0;
}

/**
 * Format a TOI value that ESPN may return either as seconds (a float) or
 * already as a "MM:SS" string.
 */
export function normalizeToi(raw: string): string {
  if (!raw) return '0:00';
  // If it contains ":" it's already formatted
  if (raw.includes(':')) return raw;
  const secs = parseFloat(raw);
  if (isNaN(secs)) return raw;
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Normalise one ESPN stats athlete entry into ESPNSkaterStat. */
export function normalizeSkater(
  entry: ESPNStatsAthleteEntry,
  categories: ESPNStatsCategory[],
): ESPNSkaterStat {
  const { athlete, stats } = entry;
  const g = (name: string) => getStatByName(stats, categories, name);
  return {
    id: athlete.id,
    name: athlete.displayName,
    position: athlete.position?.abbreviation ?? '—',
    teamAbbr: athlete.team?.abbreviation ?? '—',
    gamesPlayed: g('gamesPlayed'),
    goals: g('goals'),
    assists: g('assists'),
    points: g('points'),
    plusMinus: g('plusMinus'),
    shots: g('shots') || g('shotsOnGoal'),
    shootingPct: g('shootingPct') || g('shootingPercentage'),
    powerPlayGoals: g('powerPlayGoals'),
    powerPlayPoints: g('powerPlayPoints'),
    shortHandedGoals: g('shortHandedGoals') || g('shorthandedGoals'),
    avgToi: normalizeToi(
      stats[categories.findIndex((c) => c.name === 'avgTimeOnIce')] ?? '',
    ),
  };
}

/** Normalise one ESPN stats athlete entry into ESPNGoalieStat. */
export function normalizeGoalie(
  entry: ESPNStatsAthleteEntry,
  categories: ESPNStatsCategory[],
): ESPNGoalieStat {
  const { athlete, stats } = entry;
  const g = (name: string) => getStatByName(stats, categories, name);
  return {
    id: athlete.id,
    name: athlete.displayName,
    teamAbbr: athlete.team?.abbreviation ?? '—',
    gamesPlayed: g('gamesPlayed'),
    gamesStarted: g('gamesStarted'),
    wins: g('wins'),
    losses: g('losses'),
    otLosses: g('otLosses') || g('overtimeLosses'),
    goalsAgainstAvg:
      g('goalsAgainstAverage') || g('goalsAgainstAvg'),
    savePct: g('savePct') || g('savePercentage'),
    shotsAgainst: g('shotsAgainst'),
    saves: g('saves'),
    shutouts: g('shutouts'),
    avgToi: normalizeToi(
      stats[categories.findIndex((c) => c.name === 'avgTimeOnIce')] ?? '',
    ),
  };
}
