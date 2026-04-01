import { NHLScheduleResponse, NHLBoxscore, NHLGame, NHLStandingsResponse, NHLStandingsTeam, NHLSkaterStat, NHLGoalieStatEntry, NHLPlayerProfile } from './types';
import { getCached, setCached } from './cache';

const NHL_API_BASE = 'https://api-web.nhle.com/v1';

export async function getNHLSchedule(date?: string): Promise<NHLScheduleResponse> {
  const cacheKey = `nhl:schedule:${date ?? 'now'}`;
  const cached = await getCached<NHLScheduleResponse>(cacheKey);
  if (cached) return cached;

  const url = date
    ? `${NHL_API_BASE}/schedule/${date}`
    : `${NHL_API_BASE}/schedule/now`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`NHL schedule fetch failed: ${res.status}`);
  const data: NHLScheduleResponse = await res.json();

  await setCached(cacheKey, data, 60);
  return data;
}

export async function getNHLBoxscore(gameId: string | number): Promise<NHLBoxscore> {
  const cacheKey = `nhl:boxscore:${gameId}`;
  const cached = await getCached<NHLBoxscore>(cacheKey);
  if (cached) return cached;

  const url = `${NHL_API_BASE}/gamecenter/${gameId}/boxscore`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`NHL boxscore fetch failed: ${res.status}`);
  const data: NHLBoxscore = await res.json();

  const ttl = ['LIVE', 'CRIT'].includes(data.gameState) ? 30 : 300;
  await setCached(cacheKey, data, ttl);
  return data;
}

export async function getTodayGames(): Promise<NHLGame[]> {
  const schedule = await getNHLSchedule();
  const today = new Date().toISOString().split('T')[0];
  const todayWeek = schedule.gameWeek.find((w) => w.date === today);
  return todayWeek?.games ?? schedule.gameWeek[0]?.games ?? [];
}

export async function getGamesByDate(date: string): Promise<NHLGame[]> {
  const schedule = await getNHLSchedule(date);
  const dateWeek = schedule.gameWeek.find((w) => w.date === date);
  return dateWeek?.games ?? [];
}

export async function getNHLStandings(): Promise<NHLStandingsTeam[]> {
  const cacheKey = 'nhl:standings:now';
  const cached = await getCached<NHLStandingsTeam[]>(cacheKey);
  if (cached) return cached;

  const url = `${NHL_API_BASE}/standings/now`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`NHL standings fetch failed: ${res.status}`);
  const data: NHLStandingsResponse = await res.json();

  await setCached(cacheKey, data.standings, 300);
  return data.standings;
}

export async function getNHLSkaterStats(
  season?: string,
  limit = 50
): Promise<NHLSkaterStat[]> {
  const seasonKey = season ?? 'current';
  const cacheKey = `nhl:skater-stats:${seasonKey}:${limit}`;
  const cached = await getCached<NHLSkaterStat[]>(cacheKey);
  if (cached) return cached;

  const url = season
    ? `${NHL_API_BASE}/skater-stats-leaders/${season}/2?categories=points&limit=${limit}`
    : `${NHL_API_BASE}/skater-stats-leaders/current?categories=points&limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`NHL skater stats fetch failed: ${res.status}`);
  const data = await res.json();

  // The API returns { points: [...], goals: [...], assists: [...], ... }
  // We use points as the primary list
  const skaters: NHLSkaterStat[] = data.points ?? [];
  await setCached(cacheKey, skaters, 300);
  return skaters;
}

export async function getNHLGoalieStats(
  season?: string,
  limit = 30
): Promise<NHLGoalieStatEntry[]> {
  const seasonKey = season ?? 'current';
  const cacheKey = `nhl:goalie-stats:${seasonKey}:${limit}`;
  const cached = await getCached<NHLGoalieStatEntry[]>(cacheKey);
  if (cached) return cached;

  const url = season
    ? `${NHL_API_BASE}/goalie-stats-leaders/${season}/2?categories=wins&limit=${limit}`
    : `${NHL_API_BASE}/goalie-stats-leaders/current?categories=wins&limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`NHL goalie stats fetch failed: ${res.status}`);
  const data = await res.json();

  const goalies: NHLGoalieStatEntry[] = data.wins ?? [];
  await setCached(cacheKey, goalies, 300);
  return goalies;
}

export async function getNHLPlayerProfile(playerId: number): Promise<NHLPlayerProfile> {
  const cacheKey = `nhl:player:${playerId}`;
  const cached = await getCached<NHLPlayerProfile>(cacheKey);
  if (cached) return cached;

  const url = `${NHL_API_BASE}/player/${playerId}/landing`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`NHL player profile fetch failed: ${res.status}`);
  const data: NHLPlayerProfile = await res.json();

  await setCached(cacheKey, data, 300);
  return data;
}
