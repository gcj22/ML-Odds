import { NextResponse } from 'next/server';
import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';

export async function GET() {
  try {
    const oddsGames = await getOdds(['h2h', 'spreads', 'totals']);
    const bestLines = computeBestLines(oddsGames);
    return NextResponse.json({ bestLines, raw: oddsGames });
  } catch (error) {
    console.error('Error fetching odds:', error);
    return NextResponse.json({ error: 'Failed to fetch odds' }, { status: 500 });
  }
}
