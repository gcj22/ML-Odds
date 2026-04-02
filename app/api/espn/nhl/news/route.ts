import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface ESPNNewsItem {
  headline: string;
  description?: string;
  published: string;
  links?: { web?: { href?: string } };
}

export async function GET() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news?limit=10',
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'ESPN fetch failed' }, { status: 502 });
    }
    const data = await res.json();
    const articles: ESPNNewsItem[] = (data.articles ?? []).map(
      (a: Record<string, unknown>) => ({
        headline: (a.headline as string) ?? '',
        description: (a.description as string) ?? undefined,
        published: (a.published as string) ?? '',
        links: a.links as ESPNNewsItem['links'],
      }),
    );
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('ESPN NHL news error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
