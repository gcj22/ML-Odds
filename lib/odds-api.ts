import { OddsGame } from './types';
import { getCached, setCached } from './cache';

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

export async function getOdds(markets: string[] = ['h2h', 'spreads', 'totals']): Promise<OddsGame[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn('ODDS_API_KEY not set, returning empty odds');
    return [];
  }

  const sport = process.env.ODDS_API_SPORT ?? 'icehockey_nhl';
  const region = process.env.ODDS_API_REGION ?? 'us';
  const marketsStr = markets.join(',');
  const cacheKey = `odds:${sport}:${marketsStr}`;

  const cached = await getCached<OddsGame[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    apiKey,
    regions: region,
    markets: marketsStr,
    oddsFormat: 'american',
  });

  const url = `${ODDS_API_BASE}/sports/${sport}/odds?${params}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error(`Odds API fetch failed: ${res.status} ${await res.text()}`);
    return [];
  }

  const data: OddsGame[] = await res.json();
  await setCached(cacheKey, data, 300);
  return data;
}
