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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#8A6B2C', marginBottom: '0.5rem' }}>
          NHL · 2024–25
        </p>
        <h1 className="text-4xl font-semibold" style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}>
          NHL{' '}
          <span style={{
            background: 'linear-gradient(135deg, #C6973F 0%, #DEB96A 50%, #C6973F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Standings
          </span>
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#8A8278' }}>
          Click any column header to sort.
        </p>
      </div>

      {error && (
        <div className="rounded px-4 py-3 text-sm"
          style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.2)', color: '#C04040' }}>
          {error}
        </div>
      )}

      {standings.length > 0 && <StandingsClient standings={standings} />}
    </div>
  );
}
