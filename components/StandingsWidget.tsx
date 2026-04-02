import Link from 'next/link';
import Image from 'next/image';
import { getNHLStandings } from '@/lib/nhl-api';
import { NHLStandingsTeam } from '@/lib/types';

const TOP_N = 5;

function TeamRow({ team, rank }: { team: NHLStandingsTeam; rank: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.5rem 0.875rem',
        borderBottom: '1px solid #1C1C1C',
      }}
    >
      <span
        style={{
          width: '1.25rem',
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: '#524D47',
          fontFamily: 'var(--font-mono, monospace)',
          flexShrink: 0,
        }}
      >
        {rank}
      </span>

      {team.teamLogo && (
        <Image
          src={team.teamLogo}
          alt={team.teamAbbrev.default}
          width={22}
          height={22}
          className="object-contain shrink-0 opacity-90"
          unoptimized
        />
      )}

      <span
        style={{
          flex: 1,
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#EDE8E0',
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {team.teamAbbrev.default}
      </span>

      <div style={{ display: 'flex', gap: '0.875rem', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: '#524D47',
          }}
        >
          {team.wins}-{team.losses}-{team.otLosses}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#C6973F',
            minWidth: '2rem',
            textAlign: 'right',
          }}
        >
          {team.points}
        </span>
      </div>
    </div>
  );
}

export default async function StandingsWidget() {
  let teams: NHLStandingsTeam[] = [];

  try {
    const all = await getNHLStandings();
    teams = [...all].sort((a, b) => b.points - a.points).slice(0, TOP_N);
  } catch {
    // silently degrade
  }

  return (
    <div
      className="rounded overflow-hidden"
      style={{ background: '#121212', border: '1px solid #242424' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          borderBottom: '1px solid #1C1C1C',
        }}
      >
        <p
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8A6B2C',
          }}
        >
          Standings · Top {TOP_N}
        </p>
        <Link
          href="/standings"
          style={{
            fontSize: '0.6875rem',
            color: '#524D47',
            letterSpacing: '0.04em',
            transition: 'color 200ms',
          }}
          className="luxury-nav-link"
        >
          Full Standings →
        </Link>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.25rem 0.875rem',
          borderBottom: '1px solid #1C1C1C',
          gap: '0.625rem',
        }}
      >
        <span style={{ width: '1.25rem', flexShrink: 0 }} />
        <span style={{ width: 22, flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: '0.5rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#2E2E2E',
          }}
        >
          Team
        </span>
        <div style={{ display: 'flex', gap: '0.875rem', flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#2E2E2E',
            }}
          >
            W-L-OTL
          </span>
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#2E2E2E',
              minWidth: '2rem',
              textAlign: 'right',
            }}
          >
            PTS
          </span>
        </div>
      </div>

      {teams.length === 0 ? (
        <p style={{ padding: '1rem', fontSize: '0.8125rem', color: '#524D47' }}>
          Standings unavailable.
        </p>
      ) : (
        teams.map((t, i) => (
          <TeamRow key={t.teamAbbrev.default} team={t} rank={i + 1} />
        ))
      )}
    </div>
  );
}
