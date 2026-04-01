import { NHLScheduleResponse, NHLBoxscore, NHLGame } from './types';
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
