import { getNHLSkaterStats, getNHLGoalieStats } from '@/lib/nhl-api';
import PlayerStatsClient from '@/components/PlayerStatsClient';

export const revalidate = 300;

export default async function PlayerStatsPage() {
  let skaters: Awaited<ReturnType<typeof getNHLSkaterStats>> = [];
  let goalies: Awaited<ReturnType<typeof getNHLGoalieStats>> = [];
  let error: string | null = null;

  try {
    [skaters, goalies] = await Promise.all([
      getNHLSkaterStats(undefined, 100),
      getNHLGoalieStats(undefined, 50),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load player stats';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          NHL <span className="text-yellow-400">Player Stats</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Current season leaders. Click column headers to sort.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <PlayerStatsClient skaters={skaters} goalies={goalies} />
    </div>
  );
}
