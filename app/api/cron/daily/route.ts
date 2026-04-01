import { NextResponse } from 'next/server';
import { clearMemCache } from '@/lib/cache';

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    clearMemCache();
    console.log('[cron/daily] Cache cleared at', new Date().toISOString());
    return NextResponse.json({ ok: true, message: 'Daily refresh complete' });
  } catch (error) {
    console.error('[cron/daily] Error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
