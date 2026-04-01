import { BestLines } from '@/lib/types';
import { formatAmericanOdds } from '@/lib/utils';

export default function OddsPanel({ bestLines }: { bestLines?: BestLines }) {
  if (!bestLines) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3">Best Available Odds</h3>
        <p className="text-gray-500 text-sm">No odds data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold mb-3">Best Available Odds</h3>
      <div className="space-y-4">
        {bestLines.h2h && (
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Moneyline</div>
            <div className="grid grid-cols-2 gap-3">
              <OddsCard label={`${bestLines.awayTeam} (Away)`} line={bestLines.h2h.away} />
              <OddsCard label={`${bestLines.homeTeam} (Home)`} line={bestLines.h2h.home} />
            </div>
          </div>
        )}

        {bestLines.puckLine && (
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Puck Line (-1.5)</div>
            <div className="grid grid-cols-2 gap-3">
              <OddsCard label={`${bestLines.awayTeam}`} line={bestLines.puckLine.away} showPoint />
              <OddsCard label={`${bestLines.homeTeam}`} line={bestLines.puckLine.home} showPoint />
            </div>
          </div>
        )}

        {bestLines.totals && (
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Total</div>
            <div className="grid grid-cols-2 gap-3">
              <OddsCard label={`Over ${bestLines.totals.over.point}`} line={bestLines.totals.over} />
              <OddsCard label={`Under ${bestLines.totals.under.point}`} line={bestLines.totals.under} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OddsCard({
  label,
  line,
  showPoint = false,
}: {
  label: string;
  line: { price: number; point?: number; bookTitle: string };
  showPoint?: boolean;
}) {
  return (
    <div className="bg-background border border-border rounded p-3">
      <div className="text-xs text-gray-400 mb-1 truncate">{label}</div>
      <div className="font-mono font-bold text-yellow-400 text-lg">
        {showPoint && line.point !== undefined && (
          <span className="text-gray-400 text-sm mr-1">{line.point > 0 ? `+${line.point}` : line.point}</span>
        )}
        {formatAmericanOdds(line.price)}
      </div>
      <div className="text-xs text-gray-500 mt-1">{line.bookTitle}</div>
    </div>
  );
}
