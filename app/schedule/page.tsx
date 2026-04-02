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

  const gameWeek = scheduleData?.gameWeek ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6"
        style={{ borderBottom: '1px solid #1C1C1C' }}>
        <div>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#8A6B2C', marginBottom: '0.5rem' }}>
            NHL · Schedule
          </p>
          <h1 className="text-4xl font-semibold" style={{ color: '#EDE8E0', letterSpacing: '-0.035em' }}>
            Week of {formatDate(date)}
          </h1>
        </div>
        <DatePicker currentDate={date} basePath="/schedule" />
      </div>

      {error && (
        <div className="rounded px-4 py-3 text-sm"
          style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.2)', color: '#C04040' }}>
          {error}
        </div>
      )}

      {gameWeek.length === 0 && !error ? (
        <div className="rounded py-16 text-center text-sm"
          style={{ color: '#524D47', border: '1px dashed #1C1C1C' }}>
          No schedule data available.
        </div>
      ) : (
        <div className="space-y-10">
          {gameWeek.map((day) => (
            <section key={day.date}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#C6973F' }} />
                <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#C6973F' }}>
                  {formatDate(day.date)}
                </p>
                <span style={{ fontSize: '0.625rem', color: '#524D47' }}>
                  {day.games.length} game{day.games.length !== 1 ? 's' : ''}
                </span>
              </div>

              {day.games.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#524D47', paddingLeft: '1rem' }}>
                  No games scheduled.
                </p>
              ) : (
                <div className="space-y-2">
                  {day.games.map((game) => {
                    const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
                    const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);
                    const status = getGameStatus(game);

                    return (
                      <Link key={game.id} href={`/game/${game.id}`}>
                        <div
                          className="card-interactive rounded flex items-center gap-4 flex-wrap"
                          style={{ padding: '0.875rem 1rem' }}
                        >
                          {/* Status */}
                          <div style={{ width: '5rem', flexShrink: 0 }}>
                            {isLive ? (
                              <span className="badge-live flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                                  style={{ background: '#C04040', display: 'inline-block' }} />
                                Live
                              </span>
                            ) : isFinal ? (
                              <span className="badge-final">Final</span>
                            ) : (
                              <span className="badge-scheduled">{status}</span>
                            )}
                          </div>

                          {/* Time */}
                          {!isFinal && !isLive && (
                            <div style={{ width: '4.5rem', flexShrink: 0, fontSize: '0.8125rem',
                              color: '#8A8278' }}>
                              {formatGameTime(game.startTimeUTC)}
                            </div>
                          )}

                          {/* Away */}
                          <div className="flex items-center gap-2 flex-1" style={{ minWidth: '130px' }}>
                            {game.awayTeam.logo && (
                              <Image src={game.awayTeam.logo} alt={game.awayTeam.abbrev}
                                width={26} height={26} className="object-contain opacity-90" unoptimized />
                            )}
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDE8E0',
                              letterSpacing: '-0.01em' }}>
                              {game.awayTeam.placeName?.default ?? game.awayTeam.abbrev}
                            </span>
                            <span style={{ fontSize: '0.5625rem', color: '#524D47',
                              letterSpacing: '0.04em' }}>
                              {game.awayTeam.abbrev}
                            </span>
                            {(isLive || isFinal) && game.awayTeam.score !== undefined && (
                              <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: 'auto',
                                color: '#EDE8E0', letterSpacing: '-0.03em' }}>
                                {game.awayTeam.score}
                              </span>
                            )}
                          </div>

                          {/* @ */}
                          <div style={{ fontSize: '0.75rem', color: '#2E2E2E', fontWeight: 500 }}>@</div>

                          {/* Home */}
                          <div className="flex items-center gap-2 flex-1" style={{ minWidth: '130px' }}>
                            {game.homeTeam.logo && (
                              <Image src={game.homeTeam.logo} alt={game.homeTeam.abbrev}
                                width={26} height={26} className="object-contain opacity-90" unoptimized />
                            )}
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDE8E0',
                              letterSpacing: '-0.01em' }}>
                              {game.homeTeam.placeName?.default ?? game.homeTeam.abbrev}
                            </span>
                            <span style={{ fontSize: '0.5625rem', color: '#524D47',
                              letterSpacing: '0.04em' }}>
                              {game.homeTeam.abbrev}
                            </span>
                            {(isLive || isFinal) && game.homeTeam.score !== undefined && (
                              <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: 'auto',
                                color: '#EDE8E0', letterSpacing: '-0.03em' }}>
                                {game.homeTeam.score}
                              </span>
                            )}
                          </div>

                          {/* Venue */}
                          <div className="hidden md:block" style={{ fontSize: '0.6875rem',
                            color: '#524D47', flexShrink: 0 }}>
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
