import { getNHLStandings } from '@/lib/nhl-api';
import StandingsClient from '@/components/StandingsClient';

export const revalidate = 300;

export default async function StandingsPage() {
  let standings: Awaited<ReturnType<typeof getNHLStandings>> = [];
  let error: string | null = null;

  try {
    standings = await getNHLStandings();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load standings';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          NHL <span className="text-yellow-400">Standings</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Click any column header to sort. Click again to reverse.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {standings.length > 0 && <StandingsClient standings={standings} />}
    </div>
  );
}
