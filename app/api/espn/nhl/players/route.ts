import { NextRequest, NextResponse } from 'next/server';
import {
  ESPN_NHL_BASE,
  ESPNStatsResponse,
  ESPNSkaterStat,
  ESPNGoalieStat,
  normalizeSkater,
  normalizeGoalie,
  getESPNCurrentSeason,
} from '@/lib/espn-nhl';

export const dynamic = 'force-dynamic';

/**
 * GET /api/espn/nhl/players
 * Query params:
 *   type   = "skaters" | "goalies"   (default: "skaters")
 *   page   = page number             (default: 1)
 *   season = four-digit start year   (default: current season)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'skaters';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const season = searchParams.get('season') ?? String(getESPNCurrentSeason());

  const espnCategory = type === 'goalies' ? 'savePct' : 'points';

  try {
    const url = `${ESPN_NHL_BASE}/statistics?limit=50&page=${page}&season=${season}&category=${espnCategory}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
    const data: ESPNStatsResponse = await res.json();

    const categories = data.categories ?? [];
    const pagination = {
      page: data.pagination?.page ?? page,
      pages: data.pagination?.pages ?? 1,
      count: data.pagination?.count ?? 0,
      limit: data.pagination?.limit ?? 50,
    };

    if (type === 'goalies') {
      const players: ESPNGoalieStat[] = (data.athletes ?? []).map((entry) =>
        normalizeGoalie(entry, categories),
      );
      return NextResponse.json({ players, pagination });
    }

    // skaters — filter out goalies in case ESPN returns them
    const players: ESPNSkaterStat[] = (data.athletes ?? [])
      .filter((e) => {
        const pos = e.athlete.position?.abbreviation?.toUpperCase() ?? '';
        return pos !== 'G';
      })
      .map((entry) => normalizeSkater(entry, categories));

    return NextResponse.json({ players, pagination });
  } catch (err) {
    console.error('[api/espn/nhl/players]', err);
    return NextResponse.json(
      { error: String(err), players: [], pagination: { page, pages: 1, count: 0, limit: 50 } },
      { status: 502 },
    );
  }
}
