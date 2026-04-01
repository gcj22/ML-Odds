export function formatAmericanOdds(price: number): string {
  if (price > 0) return `+${price}`;
  return `${price}`;
}

export function formatGameTime(utcTime: string): string {
  const date = new Date(utcTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getGameStatus(game: {
  gameState: string;
  period?: number;
  clock?: { timeRemaining: string; inIntermission: boolean };
}): string {
  switch (game.gameState) {
    case 'FUT':
    case 'PRE':
      return 'Scheduled';
    case 'LIVE':
    case 'CRIT':
      if (game.period && game.clock) {
        const periodStr = game.period <= 3 ? `P${game.period}` : `OT${game.period - 3}`;
        return game.clock.inIntermission ? `INT` : `${periodStr} ${game.clock.timeRemaining}`;
      }
      return 'Live';
    case 'FINAL':
    case 'OFF':
    case 'OVER':
      return 'Final';
    default:
      return game.gameState;
  }
}
