import { BestLines } from '@/lib/types';
import { formatAmericanOdds } from '@/lib/utils';

export default function OddsTable({ bestLinesList }: { bestLinesList: BestLines[] }) {
  if (bestLinesList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No odds available. Set ODDS_API_KEY to see live odds from The Odds API.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-gray-400">
            <th className="text-left py-3 px-4">Sport</th>
            <th className="text-left py-3 px-4">Game</th>
            <th className="text-left py-3 px-4">Time</th>
            <th className="text-center py-3 px-4">Away ML</th>
            <th className="text-center py-3 px-4">Home ML</th>
          </tr>
        </thead>
        <tbody>
          {bestLinesList.map((game) => (
            <tr
              key={game.gameId}
              className="border-b border-border/50 hover:bg-card transition-colors"
            >
              <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                {game.sportTitle || game.sportKey}
              </td>
              <td className="py-3 px-4">
                <div className="font-semibold">{game.awayTeam}</div>
                <div className="font-semibold">@ {game.homeTeam}</div>
              </td>
              <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                {formatGameTime(game.commenceTime)}
              </td>
              <OddsCell line={game.h2h?.away} />
              <OddsCell line={game.h2h?.home} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatGameTime(utcTime: string): string {
  try {
    const date = new Date(utcTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
    });
  } catch {
    return utcTime;
  }
}

function OddsCell({
  line,
}: {
  line?: { price: number; bookTitle: string } | null;
}) {
  if (!line) {
    return <td className="py-3 px-4 text-center text-gray-600">—</td>;
  }

  return (
    <td className="py-3 px-4 text-center">
      <div className="font-mono font-semibold text-yellow-400">
        {formatAmericanOdds(line.price)}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{line.bookTitle}</div>
    </td>
  );
}
