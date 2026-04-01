import { NextResponse } from 'next/server';
import { getNHLBoxscore } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';

export async function GET(
  _request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    const [boxscore, oddsGames] = await Promise.all([
      getNHLBoxscore(gameId),
      getOdds(['h2h', 'spreads', 'totals']),
    ]);

    const allBestLines = computeBestLines(oddsGames);
    const bestLines = allBestLines.find(
      (bl) =>
        bl.homeTeam
          .toLowerCase()
          .includes(boxscore.homeTeam.placeName?.default?.toLowerCase() ?? '') ||
        bl.awayTeam
          .toLowerCase()
          .includes(boxscore.awayTeam.placeName?.default?.toLowerCase() ?? '')
    );

    const prediction = predictGame(
      boxscore.homeTeam.abbrev,
      boxscore.awayTeam.abbrev,
      bestLines
    );
    prediction.gameId = gameId;

    return NextResponse.json({ boxscore, bestLines, prediction });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game data' }, { status: 500 });
  }
}
