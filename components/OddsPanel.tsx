import { BestLines } from '@/lib/types';
import { formatAmericanOdds } from '@/lib/utils';

export default function OddsPanel({ bestLines }: { bestLines?: BestLines }) {
  return (
    <div
      className="rounded"
      style={{ background: '#121212', border: '1px solid #242424', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#C6973F' }}>
          Best Available Odds
        </h3>
      </div>

      {!bestLines ? (
        <div className="px-4 py-6 text-center">
          <p style={{ fontSize: '0.8125rem', color: '#524D47' }}>No odds data available.</p>
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {bestLines.h2h && (
            <OddsSection label="Moneyline">
              <OddsCard label={`${bestLines.awayTeam}`} subLabel="Away" line={bestLines.h2h.away} />
              <OddsCard label={`${bestLines.homeTeam}`} subLabel="Home" line={bestLines.h2h.home} />
            </OddsSection>
          )}
          {bestLines.puckLine && (
            <OddsSection label="Puck Line  ·  -1.5">
              <OddsCard label={bestLines.awayTeam} line={bestLines.puckLine.away} showPoint />
              <OddsCard label={bestLines.homeTeam} line={bestLines.puckLine.home} showPoint />
            </OddsSection>
          )}
          {bestLines.totals && (
            <OddsSection label="Total">
              <OddsCard label={`Over ${bestLines.totals.over.point}`} line={bestLines.totals.over} />
              <OddsCard label={`Under ${bestLines.totals.under.point}`} line={bestLines.totals.under} />
            </OddsSection>
          )}
        </div>
      )}
    </div>
  );
}

function OddsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#524D47', marginBottom: '0.625rem' }}>
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function OddsCard({
  label,
  subLabel,
  line,
  showPoint = false,
}: {
  label: string;
  subLabel?: string;
  line: { price: number; point?: number; bookTitle: string };
  showPoint?: boolean;
}) {
  return (
    <div
      className="rounded"
      style={{
        background: '#0C0C0C',
        border: '1px solid #242424',
        padding: '0.625rem 0.75rem',
      }}
    >
      <div style={{ fontSize: '0.6875rem', color: '#8A8278', marginBottom: '0.375rem',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
        {subLabel && (
          <span style={{ color: '#524D47', marginLeft: '0.25rem', fontSize: '0.5625rem',
            letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {subLabel}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#C6973F',
          letterSpacing: '0.02em',
        }}
      >
        {showPoint && line.point !== undefined && (
          <span style={{ color: '#524D47', fontSize: '0.875rem', marginRight: '0.25rem' }}>
            {line.point > 0 ? `+${line.point}` : line.point}
          </span>
        )}
        {formatAmericanOdds(line.price)}
      </div>
      <div style={{ fontSize: '0.5625rem', color: '#524D47', marginTop: '0.25rem' }}>
        {line.bookTitle}
      </div>
    </div>
  );
}
