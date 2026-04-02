import { getOdds } from '@/lib/odds-api';
import { computeBestLines } from '@/lib/best-lines';
import OddsTable from '@/components/OddsTable';

export const revalidate = 300;

export default async function OddsPage() {
  let bestLinesList: ReturnType<typeof computeBestLines> = [];
  let error: string | null = null;

  try {
    const oddsGames = await getOdds(['h2h']);
    bestLinesList = computeBestLines(oddsGames);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load odds';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Upcoming <span className="text-yellow-400">Odds</span>
        </h1>
        <p className="text-gray-400 mt-1">Best available moneyline across all books</p>
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <p
          style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#8A6B2C', marginBottom: '0.5rem' }}
        >
          NHL · Best Lines
        </p>
        <h1
          className="text-4xl font-semibold"
          style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}
        >
          NHL{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #C6973F 0%, #DEB96A 50%, #C6973F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Odds
          </span>
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#8A8278' }}>
          Best available lines across all books — refreshed every 5 minutes.
        </p>
      </div>

      {!process.env.ODDS_API_KEY && (
        <div
          className="rounded px-4 py-3 text-sm"
          style={{
            background: 'rgba(198,151,63,0.06)',
            border: '1px solid rgba(198,151,63,0.18)',
            color: '#8A6B2C',
          }}
        >
          ODDS_API_KEY is not configured. Add it to .env.local to see live odds.
        </div>
      )}

      {error && (
        <div
          className="rounded px-4 py-3 text-sm"
          style={{
            background: 'rgba(192,64,64,0.08)',
            border: '1px solid rgba(192,64,64,0.2)',
            color: '#C04040',
          }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded overflow-hidden"
        style={{ background: '#121212', border: '1px solid #242424' }}
      >
        <OddsTable bestLinesList={bestLinesList} />
      </div>

      <p className="text-xs text-gray-600">
        Lines sourced from The Odds API. Best moneyline price shown for each side across all available bookmakers.
        Refresh rate: every 5 minutes.
      <p style={{ fontSize: '0.625rem', color: '#2E2E2E', letterSpacing: '0.04em' }}>
        Lines sourced from The Odds API. Best price shown per side across all available bookmakers.
      </p>
    </div>
  );
}
