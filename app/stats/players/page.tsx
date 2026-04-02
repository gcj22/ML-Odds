import PlayerStatsTabs from '@/components/PlayerStatsTabs';

export const metadata = {
  title: 'Player Stats – MLOdds',
  description: 'NHL player stats: leaders, all players, team roster, and search. Powered by ESPN.',
};

export default function PlayerStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          NHL <span className="text-yellow-400">Player Stats</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Leaders · All Players · Team Roster · Search — powered by ESPN.
          Click column headers to sort.
        </p>
      </div>

      <PlayerStatsTabs />
    </div>
  );
}
