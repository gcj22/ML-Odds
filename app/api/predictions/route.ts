import { NextResponse } from 'next/server';
import { getTodayGames } from '@/lib/nhl-api';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import { predictGame } from '@/lib/predictions';

export async function GET() {
  try {
    const [games, oddsGames] = await Promise.all([getTodayGames(), getOdds()]);
    const allBestLines = computeBestLines(oddsGames);

    const predictions = games.map((game) => {
      const bestLines = allBestLines.find(
        (bl) =>
          bl.homeTeam.toLowerCase().includes(game.homeTeam.placeName?.default?.toLowerCase() ?? '') ||
          bl.awayTeam.toLowerCase().includes(game.awayTeam.placeName?.default?.toLowerCase() ?? '')
      );
      const prediction = predictGame(game.homeTeam.abbrev, game.awayTeam.abbrev, bestLines);
      prediction.gameId = game.id.toString();
      return prediction;
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error generating predictions:', error);
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}
