import { NextRequest, NextResponse } from 'next/server';
import {
  ESPN_NHL_BASE,
  ESPNTeamsResponse,
  ESPNRosterResponse,
  ESPNStatsResponse,
  ESPNRosterPlayer,
  normalizeSkater,
  normalizeGoalie,
  getESPNCurrentSeason,
} from '@/lib/espn-nhl';

export const dynamic = 'force-dynamic';

/**
 * GET /api/espn/nhl/teams/[teamId]/roster
 * Returns skater + goalie season stats filtered to the requested team.
 * We first resolve the team abbreviation from ESPN teams, then fetch
 * all-player stats and keep only matching athletes.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const season =
    req.nextUrl.searchParams.get('season') ?? String(getESPNCurrentSeason());

  try {
    // Step 1 – get team abbreviation so we can filter stats by team
    const teamsRes = await fetch(`${ESPN_NHL_BASE}/teams?limit=50`, {
      next: { revalidate: 3600 },
    });
    if (!teamsRes.ok) throw new Error(`ESPN teams responded ${teamsRes.status}`);
    const teamsData: ESPNTeamsResponse = await teamsRes.json();

    const allTeams =
      teamsData.sports?.[0]?.leagues?.[0]?.teams?.map((t) => t.team) ?? [];
    const team = allTeams.find((t) => t.id === teamId);
    if (!team) {
      return NextResponse.json(
        { error: `Team ${teamId} not found`, skaters: [], goalies: [] },
        { status: 404 },
      );
    }
    const abbr = team.abbreviation.toUpperCase();

    // Step 2 – get team roster for player IDs (used to cross-reference)
    const rosterRes = await fetch(
      `${ESPN_NHL_BASE}/teams/${teamId}/roster`,
      { next: { revalidate: 300 } },
    );
    const rosterPlayerIds = new Set<string>();
    if (rosterRes.ok) {
      const rosterData: ESPNRosterResponse = await rosterRes.json();
      for (const group of rosterData.athletes ?? []) {
        for (const p of group.items ?? []) {
          rosterPlayerIds.add(p.id);
        }
      }
    }

    // Step 3 – fetch skater + goalie stats and filter to this team
    const [skatersRes, goaliesRes] = await Promise.all([
      fetch(
        `${ESPN_NHL_BASE}/statistics?limit=50&page=1&season=${season}&category=points`,
        { next: { revalidate: 300 } },
      ),
      fetch(
        `${ESPN_NHL_BASE}/statistics?limit=50&page=1&season=${season}&category=savePct`,
        { next: { revalidate: 300 } },
      ),
    ]);

    const skatersData: ESPNStatsResponse = skatersRes.ok
      ? await skatersRes.json()
      : {};
    const goaliesData: ESPNStatsResponse = goaliesRes.ok
      ? await goaliesRes.json()
      : {};

    const skaterCats = skatersData.categories ?? [];
    const goalieCats = goaliesData.categories ?? [];

    const skaters: ESPNRosterPlayer[] = (skatersData.athletes ?? [])
      .filter(
        (e) =>
          (e.athlete.team?.abbreviation?.toUpperCase() === abbr ||
            rosterPlayerIds.has(e.athlete.id)) &&
          e.athlete.position?.abbreviation?.toUpperCase() !== 'G',
      )
      .map((e) => {
        const s = normalizeSkater(e, skaterCats);
        return {
          id: s.id,
          name: s.name,
          jersey: '',
          position: s.position,
          gamesPlayed: s.gamesPlayed,
          goals: s.goals,
          assists: s.assists,
          points: s.points,
          plusMinus: s.plusMinus,
          savePct: 0,
          goalsAgainstAvg: 0,
        };
      });

    const goalies: ESPNRosterPlayer[] = (goaliesData.athletes ?? [])
      .filter(
        (e) =>
          e.athlete.team?.abbreviation?.toUpperCase() === abbr ||
          rosterPlayerIds.has(e.athlete.id),
      )
      .map((e) => {
        const g = normalizeGoalie(e, goalieCats);
        return {
          id: g.id,
          name: g.name,
          jersey: '',
          position: 'G',
          gamesPlayed: g.gamesPlayed,
          goals: 0,
          assists: 0,
          points: 0,
          plusMinus: 0,
          savePct: g.savePct,
          goalsAgainstAvg: g.goalsAgainstAvg,
        };
      });

    return NextResponse.json({ skaters, goalies, teamName: team.displayName });
  } catch (err) {
    console.error(`[api/espn/nhl/teams/${teamId}/roster]`, err);
    return NextResponse.json(
      { error: String(err), skaters: [], goalies: [], teamName: '' },
      { status: 502 },
    );
  }
}
