import { NextResponse } from 'next/server';
import type { ESPNTeamsResponse, ESPNNHLTeam } from '@/lib/espn-nhl';
import { ESPN_NHL_BASE } from '@/lib/espn-nhl';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // teams rarely change

export async function GET() {
  try {
    const url = `${ESPN_NHL_BASE}/teams?limit=50`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`ESPN responded ${res.status}`);
    }
    const data: ESPNTeamsResponse = await res.json();

    const teams: ESPNNHLTeam[] =
      data.sports?.[0]?.leagues?.[0]?.teams?.map((t) => ({
        id: t.team.id,
        name: t.team.displayName,
        abbreviation: t.team.abbreviation,
        logo: t.team.logos?.[0]?.href,
      })) ?? [];

    teams.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ teams });
  } catch (err) {
    console.error('[api/espn/nhl/teams]', err);
    return NextResponse.json(
      { error: 'Failed to fetch NHL teams', teams: [] },
      { status: 502 },
    );
  }
}
