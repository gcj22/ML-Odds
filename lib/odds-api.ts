import { OddsGame } from './types';
import { getCached, setCached } from './cache';

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const FETCH_TIMEOUT_MS = 10_000;

export async function getOdds(markets: string[] = ['h2h', 'spreads', 'totals']): Promise<OddsGame[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn('ODDS_API_KEY not set, returning empty odds');
    return [];
  }

  const sport = process.env.ODDS_API_SPORT ?? 'icehockey_nhl';
  const region = process.env.ODDS_API_REGION ?? 'us';
  const ttl = parseInt(process.env.ODDS_CACHE_TTL ?? '300', 10);
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal, next: { revalidate: ttl } });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('Odds API request timed out');
    } else {
      console.error('Odds API network error:', err);
    }
    return [];
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401) {
      console.error('Odds API: invalid or missing API key');
    } else if (res.status === 422) {
      console.error(`Odds API: bad request parameters — ${body}`);
    } else if (res.status === 429) {
      console.error('Odds API: quota exceeded — request limit reached');
    } else {
      console.error(`Odds API fetch failed: ${res.status} ${body}`);
    }
    return [];
  }

  const data: OddsGame[] = await res.json();
  await setCached(cacheKey, data, ttl);
  return data;
}
