import { BestLines } from '@/lib/types';
import { formatAmericanOdds } from '@/lib/utils';
import Link from 'next/link';

export default function OddsTable({ bestLinesList }: { bestLinesList: BestLines[] }) {
  if (bestLinesList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No odds available. Set ODDS_API_KEY to see live odds.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-gray-400">
            <th className="text-left py-3 px-4">Game</th>
            <th className="text-center py-3 px-4">ML Away</th>
            <th className="text-center py-3 px-4">ML Home</th>
            <th className="text-center py-3 px-4">Puck Line Away</th>
            <th className="text-center py-3 px-4">Puck Line Home</th>
            <th className="text-center py-3 px-4">Over</th>
            <th className="text-center py-3 px-4">Under</th>
          </tr>
        </thead>
        <tbody>
          {bestLinesList.map((game) => (
            <tr
              key={game.gameId}
              className="border-b border-border/50 hover:bg-card transition-colors"
            >
              <td className="py-3 px-4">
                <Link
                  href={`/game/${game.gameId}`}
                  className="hover:text-yellow-400 transition-colors"
                >
                  <div className="font-semibold">{game.awayTeam}</div>
                  <div className="font-semibold">@ {game.homeTeam}</div>
                </Link>
              </td>

              <OddsCell line={game.h2h?.away} />
              <OddsCell line={game.h2h?.home} />
              <OddsCell line={game.puckLine?.away} />
              <OddsCell line={game.puckLine?.home} />
              <OddsCell line={game.totals?.over} showPoint />
              <OddsCell line={game.totals?.under} showPoint />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OddsCell({
  line,
  showPoint = false,
}: {
  line?: { price: number; point?: number; bookTitle: string } | null;
  showPoint?: boolean;
}) {
  if (!line) {
    return <td className="py-3 px-4 text-center text-gray-600">—</td>;
  }

  return (
    <td className="py-3 px-4 text-center">
      <div className="font-mono font-semibold text-yellow-400">
        {showPoint && line.point !== undefined && (
          <span className="text-gray-400 mr-1">{line.point}</span>
        )}
        {formatAmericanOdds(line.price)}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{line.bookTitle}</div>
    </td>
  );
}
