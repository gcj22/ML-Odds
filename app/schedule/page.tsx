import { getNHLSchedule } from '@/lib/nhl-api';
import DatePicker from '@/components/DatePicker';
import { formatDate, formatGameTime, getGameStatus, getTodayDateString } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 120;

interface SchedulePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? getTodayDateString();
  let error: string | null = null;

  let scheduleData: Awaited<ReturnType<typeof getNHLSchedule>> | null = null;

  try {
    scheduleData = await getNHLSchedule(date);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load schedule';
  }

  // The schedule endpoint returns a week of games grouped by day
  const gameWeek = scheduleData?.gameWeek ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            NHL <span className="text-yellow-400">Schedule</span>
          </h1>
          <p className="text-gray-400 mt-1">Week of {formatDate(date)}</p>
        </div>
        <DatePicker currentDate={date} basePath="/schedule" />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {gameWeek.length === 0 && !error ? (
        <div className="text-gray-500 py-12 text-center">No schedule data available.</div>
      ) : (
        <div className="space-y-8">
          {gameWeek.map((day) => (
            <section key={day.date}>
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                {formatDate(day.date)}
                <span className="text-gray-500 normal-case font-normal tracking-normal text-xs">
                  ({day.games.length} game{day.games.length !== 1 ? 's' : ''})
                </span>
              </h2>

              {day.games.length === 0 ? (
                <p className="text-gray-500 text-sm pl-4">No games scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {day.games.map((game) => {
                    const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
                    const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);
                    const status = getGameStatus(game);

                    return (
                      <Link key={game.id} href={`/game/${game.id}`}>
                        <div className="bg-card border border-border rounded-lg p-4 hover:border-yellow-500/40 transition-all flex items-center gap-4 flex-wrap">
                          {/* Status badge */}
                          <div className="w-24 shrink-0">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                isLive
                                  ? 'bg-red-500/20 text-red-400'
                                  : isFinal
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-yellow-500/10 text-yellow-400'
                              }`}
                            >
                              {isLive ? '● LIVE' : status}
                            </span>
                          </div>

                          {/* Time */}
                          {!isFinal && !isLive && (
                            <div className="w-20 shrink-0 text-sm text-gray-400">
                              {formatGameTime(game.startTimeUTC)}
                            </div>
                          )}

                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1 min-w-[130px]">
                            {game.awayTeam.logo && (
                              <Image
                                src={game.awayTeam.logo}
                                alt={game.awayTeam.abbrev}
                                width={28}
                                height={28}
                                className="object-contain"
                                unoptimized
                              />
                            )}
                            <span className="font-semibold">
                              {game.awayTeam.placeName?.default ?? game.awayTeam.abbrev}
                            </span>
                            <span className="text-xs text-gray-500">{game.awayTeam.abbrev}</span>
                            {(isLive || isFinal) && game.awayTeam.score !== undefined && (
                              <span className="text-xl font-bold ml-auto">{game.awayTeam.score}</span>
                            )}
                          </div>

                          {/* VS / @ */}
                          <div className="text-gray-500 text-sm font-medium">@</div>

                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1 min-w-[130px]">
                            {game.homeTeam.logo && (
                              <Image
                                src={game.homeTeam.logo}
                                alt={game.homeTeam.abbrev}
                                width={28}
                                height={28}
                                className="object-contain"
                                unoptimized
                              />
                            )}
                            <span className="font-semibold">
                              {game.homeTeam.placeName?.default ?? game.homeTeam.abbrev}
                            </span>
                            <span className="text-xs text-gray-500">{game.homeTeam.abbrev}</span>
                            {(isLive || isFinal) && game.homeTeam.score !== undefined && (
                              <span className="text-xl font-bold ml-auto">{game.homeTeam.score}</span>
                            )}
                          </div>

                          {/* Venue */}
                          <div className="text-xs text-gray-500 shrink-0 hidden md:block">
                            {game.venue?.default}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
