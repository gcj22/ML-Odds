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
      </div>

      {!process.env.ODDS_API_KEY && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ ODDS_API_KEY is not configured. Add it to .env.local to see live odds from The Odds API.
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <OddsTable bestLinesList={bestLinesList} />
      </div>

      <p className="text-xs text-gray-600">
        Lines sourced from The Odds API. Best moneyline price shown for each side across all available bookmakers.
        Refresh rate: every 5 minutes.
      </p>
    </div>
  );
}
