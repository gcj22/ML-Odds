import { NextRequest, NextResponse } from 'next/server';
import {
  ESPN_SEARCH_BASE,
  ESPNSearchResponse,
  ESPNPlayerSearchResult,
} from '@/lib/espn-nhl';

export const dynamic = 'force-dynamic';

/**
 * GET /api/espn/nhl/search
 * Query params:
 *   q = search string (required)
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `${ESPN_SEARCH_BASE}?query=${encodeURIComponent(q)}&sport=hockey&league=nhl&limit=20`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
    const data: ESPNSearchResponse = await res.json();

    const results: ESPNPlayerSearchResult[] = [];
    for (const group of data.results ?? []) {
      if (!group.contents) continue;
      for (const item of group.contents) {
        results.push({
          id: item.id,
          name: item.displayName ?? item.shortName ?? item.id,
          position: item.position?.abbreviation ?? '—',
          teamAbbr: item.team?.abbreviation ?? '—',
          teamName: item.team?.displayName ?? '—',
          headshot: item.headshot?.href,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[api/espn/nhl/search]', err);
    return NextResponse.json(
      { error: String(err), results: [] },
      { status: 502 },
    );
  }
}
