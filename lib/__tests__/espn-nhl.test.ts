import {
  normalizeSkater,
  normalizeGoalie,
  normalizeToi,
  getStatByName,
  getESPNCurrentSeason,
} from '../espn-nhl';
import type { ESPNStatsAthleteEntry, ESPNStatsCategory } from '../espn-nhl';

const skaterCategories: ESPNStatsCategory[] = [
  { name: 'gamesPlayed', displayName: 'GP', abbreviation: 'GP' },
  { name: 'goals', displayName: 'G', abbreviation: 'G' },
  { name: 'assists', displayName: 'A', abbreviation: 'A' },
  { name: 'points', displayName: 'PTS', abbreviation: 'PTS' },
  { name: 'plusMinus', displayName: '+/-', abbreviation: '+/-' },
  { name: 'shots', displayName: 'SOG', abbreviation: 'SOG' },
  { name: 'shootingPct', displayName: 'S%', abbreviation: 'S%' },
  { name: 'powerPlayGoals', displayName: 'PPG', abbreviation: 'PPG' },
  { name: 'powerPlayPoints', displayName: 'PPP', abbreviation: 'PPP' },
  { name: 'shortHandedGoals', displayName: 'SHG', abbreviation: 'SHG' },
  { name: 'avgTimeOnIce', displayName: 'TOI/G', abbreviation: 'TOI/G' },
];

const skaterEntry: ESPNStatsAthleteEntry = {
  athlete: {
    id: '4233',
    displayName: 'Nathan MacKinnon',
    position: { abbreviation: 'C', name: 'Center' },
    team: { id: '17', abbreviation: 'COL', displayName: 'Colorado Avalanche' },
  },
  stats: ['82', '51', '93', '144', '28', '263', '19.4', '18', '52', '1', '1340'],
};

const goalieCategories: ESPNStatsCategory[] = [
  { name: 'gamesPlayed', displayName: 'GP', abbreviation: 'GP' },
  { name: 'gamesStarted', displayName: 'GS', abbreviation: 'GS' },
  { name: 'wins', displayName: 'W', abbreviation: 'W' },
  { name: 'losses', displayName: 'L', abbreviation: 'L' },
  { name: 'otLosses', displayName: 'OTL', abbreviation: 'OTL' },
  { name: 'goalsAgainstAverage', displayName: 'GAA', abbreviation: 'GAA' },
  { name: 'savePct', displayName: 'SV%', abbreviation: 'SV%' },
  { name: 'shotsAgainst', displayName: 'SA', abbreviation: 'SA' },
  { name: 'saves', displayName: 'SV', abbreviation: 'SV' },
  { name: 'shutouts', displayName: 'SO', abbreviation: 'SO' },
  { name: 'avgTimeOnIce', displayName: 'TOI/G', abbreviation: 'TOI/G' },
];

const goalieEntry: ESPNStatsAthleteEntry = {
  athlete: {
    id: '5678',
    displayName: 'Connor Hellebuyck',
    position: { abbreviation: 'G', name: 'Goalie' },
    team: { id: '30', abbreviation: 'WPG', displayName: 'Winnipeg Jets' },
  },
  stats: ['60', '58', '37', '15', '8', '2.39', '0.921', '1720', '1585', '6', '3600'],
};

describe('getStatByName', () => {
  it('returns the correct stat value by name', () => {
    expect(getStatByName(['82', '51'], skaterCategories, 'gamesPlayed')).toBe(82);
    expect(getStatByName(['82', '51'], skaterCategories, 'goals')).toBe(51);
  });

  it('returns 0 when category name not found', () => {
    expect(getStatByName(['82'], skaterCategories, 'nonExistent')).toBe(0);
  });

  it('returns 0 when stats array is shorter than category index', () => {
    expect(getStatByName(['82'], skaterCategories, 'assists')).toBe(0);
  });
});

describe('normalizeToi', () => {
  it('returns 0:00 for empty string', () => {
    expect(normalizeToi('')).toBe('0:00');
  });

  it('passes through already-formatted MM:SS strings', () => {
    expect(normalizeToi('22:14')).toBe('22:14');
  });

  it('converts seconds (as string) to MM:SS format', () => {
    expect(normalizeToi('1340')).toBe('22:20');
    expect(normalizeToi('3600')).toBe('60:00');
    expect(normalizeToi('90')).toBe('1:30');
  });

  it('handles non-numeric strings gracefully', () => {
    expect(normalizeToi('N/A')).toBe('N/A');
  });
});

describe('normalizeSkater', () => {
  it('maps ESPN skater entry to ESPNSkaterStat correctly', () => {
    const result = normalizeSkater(skaterEntry, skaterCategories);
    expect(result.id).toBe('4233');
    expect(result.name).toBe('Nathan MacKinnon');
    expect(result.position).toBe('C');
    expect(result.teamAbbr).toBe('COL');
    expect(result.gamesPlayed).toBe(82);
    expect(result.goals).toBe(51);
    expect(result.assists).toBe(93);
    expect(result.points).toBe(144);
    expect(result.plusMinus).toBe(28);
    expect(result.shots).toBe(263);
    expect(result.shootingPct).toBeCloseTo(19.4);
    expect(result.powerPlayGoals).toBe(18);
    expect(result.powerPlayPoints).toBe(52);
    expect(result.shortHandedGoals).toBe(1);
    expect(result.avgToi).toBe('22:20');
  });

  it('uses fallback values when athlete fields are missing', () => {
    const sparse: ESPNStatsAthleteEntry = {
      athlete: { id: '999', displayName: 'Unknown Player' },
      stats: [],
    };
    const result = normalizeSkater(sparse, skaterCategories);
    expect(result.position).toBe('—');
    expect(result.teamAbbr).toBe('—');
    expect(result.gamesPlayed).toBe(0);
  });
});

describe('normalizeGoalie', () => {
  it('maps ESPN goalie entry to ESPNGoalieStat correctly', () => {
    const result = normalizeGoalie(goalieEntry, goalieCategories);
    expect(result.id).toBe('5678');
    expect(result.name).toBe('Connor Hellebuyck');
    expect(result.teamAbbr).toBe('WPG');
    expect(result.gamesPlayed).toBe(60);
    expect(result.gamesStarted).toBe(58);
    expect(result.wins).toBe(37);
    expect(result.losses).toBe(15);
    expect(result.otLosses).toBe(8);
    expect(result.goalsAgainstAvg).toBeCloseTo(2.39);
    expect(result.savePct).toBeCloseTo(0.921);
    expect(result.shotsAgainst).toBe(1720);
    expect(result.saves).toBe(1585);
    expect(result.shutouts).toBe(6);
    expect(result.avgToi).toBe('60:00');
  });
});

describe('getESPNCurrentSeason', () => {
  it('returns previous year before July', () => {
    // April 2026 → season started in 2025 (2025-26)
    const spy = jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(3); // April = index 3
    expect(getESPNCurrentSeason()).toBe(2025);
    spy.mockRestore();
    jest.restoreAllMocks();
  });

  it('returns current year from July onward', () => {
    // October 2025 → season started in 2025 (2025-26)
    const spy = jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2025);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(9); // October = index 9
    expect(getESPNCurrentSeason()).toBe(2025);
    spy.mockRestore();
    jest.restoreAllMocks();
  });
});
