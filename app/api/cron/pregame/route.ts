import { NextResponse } from 'next/server';
import { getTodayGames } from '@/lib/nhl-api';
import { invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Invalidate schedule cache so next request fetches fresh data
    await invalidateCache('nhl:schedule:now');

    // Find games starting in the next 6 hours and invalidate their caches
    const games = await getTodayGames();
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    const pregameGames = games.filter((game) => {
      const gameTime = new Date(game.startTimeUTC).getTime();
      return gameTime - now > 0 && gameTime - now < sixHours;
    });

    for (const game of pregameGames) {
      await invalidateCache(`nhl:boxscore:${game.id}`);
      await invalidateCache(`odds:icehockey_nhl:h2h,spreads,totals`);
    }

    console.log(`[cron/pregame] Refreshed ${pregameGames.length} pregame games at`, new Date().toISOString());
    return NextResponse.json({ ok: true, pregameGames: pregameGames.length });
  } catch (error) {
    console.error('[cron/pregame] Error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
