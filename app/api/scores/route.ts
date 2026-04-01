import { NextResponse } from 'next/server';
import { getTodayGames, getGamesByDate } from '@/lib/nhl-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? undefined;

    const games = date ? await getGamesByDate(date) : await getTodayGames();
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
