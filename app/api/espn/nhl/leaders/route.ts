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
 * GET /api/espn/nhl/leaders
 * Query params:
 *   category = "skaters" | "goalies"  (default: "skaters")
 *   season   = four-digit start year  (default: current season)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') ?? 'skaters';
  const season = searchParams.get('season') ?? String(getESPNCurrentSeason());

  try {
    if (category === 'goalies') {
      const url = `${ESPN_NHL_BASE}/statistics?limit=25&page=1&season=${season}&category=savePct`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
      const data: ESPNStatsResponse = await res.json();

      const categories = data.categories ?? [];
      const goalies: ESPNGoalieStat[] = (data.athletes ?? []).map((entry) =>
        normalizeGoalie(entry, categories),
      );

      return NextResponse.json({ goalies });
    }

    // skaters
    const url = `${ESPN_NHL_BASE}/statistics?limit=25&page=1&season=${season}&category=points`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
    const data: ESPNStatsResponse = await res.json();

    const categories = data.categories ?? [];
    const skaters: ESPNSkaterStat[] = (data.athletes ?? [])
      .filter((e) => {
        const pos = e.athlete.position?.abbreviation?.toUpperCase() ?? '';
        return pos !== 'G';
      })
      .map((entry) => normalizeSkater(entry, categories));

    return NextResponse.json({ skaters });
  } catch (err) {
    console.error('[api/espn/nhl/leaders]', err);
    const empty =
      category === 'goalies'
        ? { error: String(err), goalies: [] }
        : { error: String(err), skaters: [] };
    return NextResponse.json(empty, { status: 502 });
  }
}
