import { computeBestLines } from '../best-lines';
import type { OddsGame } from '../types';

const mockGame: OddsGame = {
  id: 'game-1',
  sport_key: 'icehockey_nhl',
  sport_title: 'NHL',
  commence_time: '2025-11-01T00:00:00Z',
  home_team: 'Boston Bruins',
  away_team: 'Toronto Maple Leafs',
  bookmakers: [
    {
      key: 'fanduel',
      title: 'FanDuel',
      last_update: '2025-11-01T00:00:00Z',
      markets: [
        {
          key: 'h2h',
          last_update: '2025-11-01T00:00:00Z',
          outcomes: [
            { name: 'Boston Bruins', price: -140 },
            { name: 'Toronto Maple Leafs', price: +120 },
          ],
        },
      ],
    },
    {
      key: 'draftkings',
      title: 'DraftKings',
      last_update: '2025-11-01T00:00:00Z',
      markets: [
        {
          key: 'h2h',
          last_update: '2025-11-01T00:00:00Z',
          outcomes: [
            { name: 'Boston Bruins', price: -135 },
            { name: 'Toronto Maple Leafs', price: +125 },
          ],
        },
      ],
    },
  ],
};

describe('computeBestLines', () => {
  it('returns an empty array for empty input', () => {
    expect(computeBestLines([])).toEqual([]);
  });

  it('includes sportKey and sportTitle in output', () => {
    const [result] = computeBestLines([mockGame]);
    expect(result.sportKey).toBe('icehockey_nhl');
    expect(result.sportTitle).toBe('NHL');
  });

  it('selects the best (highest) h2h price for home team', () => {
    const [result] = computeBestLines([mockGame]);
    // DraftKings has -135 for Boston (better than FanDuel -140)
    expect(result.h2h?.home.price).toBe(-135);
    expect(result.h2h?.home.bookTitle).toBe('DraftKings');
  });

  it('selects the best (highest) h2h price for away team', () => {
    const [result] = computeBestLines([mockGame]);
    // DraftKings has +125 for Toronto (better than FanDuel +120)
    expect(result.h2h?.away.price).toBe(125);
    expect(result.h2h?.away.bookTitle).toBe('DraftKings');
  });

  it('returns undefined h2h when no bookmakers have h2h market', () => {
    const gameNoH2h: OddsGame = {
      ...mockGame,
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '2025-11-01T00:00:00Z',
          markets: [],
        },
      ],
    };
    const [result] = computeBestLines([gameNoH2h]);
    expect(result.h2h).toBeUndefined();
  });

  it('handles multiple games correctly', () => {
    const game2: OddsGame = {
      ...mockGame,
      id: 'game-2',
      home_team: 'New York Rangers',
      away_team: 'Detroit Red Wings',
      sport_key: 'icehockey_nhl',
      sport_title: 'NHL',
    };
    const results = computeBestLines([mockGame, game2]);
    expect(results).toHaveLength(2);
    expect(results[0].gameId).toBe('game-1');
    expect(results[1].gameId).toBe('game-2');
  });

  it('preserves commenceTime and team names', () => {
    const [result] = computeBestLines([mockGame]);
    expect(result.commenceTime).toBe('2025-11-01T00:00:00Z');
    expect(result.homeTeam).toBe('Boston Bruins');
    expect(result.awayTeam).toBe('Toronto Maple Leafs');
  });
});
