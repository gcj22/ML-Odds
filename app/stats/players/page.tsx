import PlayerStatsTabs from '@/components/PlayerStatsTabs';

export const metadata = {
  title: 'Player Stats – MLOdds',
  description: 'NHL player stats: leaders, all players, team roster, and search. Powered by ESPN.',
};

export default function PlayerStatsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-6" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#8A6B2C', marginBottom: '0.5rem' }}>
          NHL · Stats
        </p>
        <h1 className="text-4xl font-semibold" style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}>
          Player{' '}
          <span style={{
            background: 'linear-gradient(135deg, #C6973F 0%, #DEB96A 50%, #C6973F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Stats
          </span>
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#8A8278' }}>
          Leaders · All Players · Team Roster · Search — click column headers to sort.
        </p>
      </div>

      <PlayerStatsTabs />
    </div>
  );
}
