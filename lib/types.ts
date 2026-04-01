// NHL API Types
export interface NHLGame {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: { default: string };
  startTimeUTC: string;
  awayTeam: NHLTeamScore;
  homeTeam: NHLTeamScore;
  gameState: 'FUT' | 'PRE' | 'LIVE' | 'CRIT' | 'FINAL' | 'OFF' | 'OVER';
  gameScheduleState: string;
  period?: number;
  clock?: { timeRemaining: string; inIntermission: boolean };
}

export interface NHLTeamScore {
  id: number;
  placeName: { default: string };
  abbrev: string;
  logo: string;
  score?: number;
}

export interface NHLScheduleResponse {
  nextStartDate: string;
  previousStartDate: string;
  gameWeek: Array<{
    date: string;
    dayAbbrev: string;
    games: NHLGame[];
  }>;
}

export interface NHLBoxscore {
  id: number;
  gameDate: string;
  gameState: string;
  awayTeam: NHLTeamScore & {
    sog?: number;
    faceoffWinningPctg?: number;
    powerPlayConversion?: string;
  };
  homeTeam: NHLTeamScore & {
    sog?: number;
    faceoffWinningPctg?: number;
    powerPlayConversion?: string;
  };
  clock?: { timeRemaining: string; inIntermission: boolean };
  period?: number;
  playerByGameStats?: {
    awayTeam: { forwards: PlayerStat[]; defense: PlayerStat[]; goalies: GoalieStat[] };
    homeTeam: { forwards: PlayerStat[]; defense: PlayerStat[]; goalies: GoalieStat[] };
  };
}

export interface PlayerStat {
  playerId: number;
  name: { default: string };
  position: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  toi: string;
}

export interface GoalieStat {
  playerId: number;
  name: { default: string };
  position: string;
  saveShotsAgainst: string;
  savePctg: number;
  toi: string;
}

// Odds API Types
export interface OddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: 'h2h' | 'spreads' | 'totals';
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

// Best Lines Types
export interface BestLine {
  price: number;
  point?: number;
  book: string;
  bookTitle: string;
}

export interface BestLines {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  puckLine?: {
    home: BestLine;
    away: BestLine;
  };
  totals?: {
    over: BestLine;
    under: BestLine;
  };
  h2h?: {
    home: BestLine;
    away: BestLine;
  };
}

// Predictions Types
export interface TeamRatings {
  homeIceAdvantage: number;
  teams: Record<string, { name: string; rating: number }>;
}

export interface GamePrediction {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  projected_goal_diff: number;
  projected_total_goals: number;
  home_win_prob: number;
  away_win_prob: number;
  puck_line_lean?: {
    side: 'home' | 'away';
    edge: number;
  };
  total_lean?: {
    side: 'over' | 'under';
    edge: number;
  };
}

// NHL Standings Types
export interface NHLStandingsTeam {
  teamName: { default: string };
  teamAbbrev: { default: string };
  teamLogo: string;
  conferenceName: string;
  divisionName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPctg: number;
  regulationWins: number;
  regulationPlusOtWins: number;
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;
  streakCode?: string;
  streakCount?: number;
  wildcardSequence?: number;
  divisionSequence?: number;
  conferenceSequence?: number;
  leagueSequence?: number;
}

export interface NHLStandingsResponse {
  standings: NHLStandingsTeam[];
}

// NHL Player Stats Types
export interface NHLSkaterStat {
  playerId: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  teamAbbrev: string;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  shootingPctg: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shortHandedGoals: number;
  avgToi: string;
  faceoffWinningPctg?: number;
}

export interface NHLGoalieStatEntry {
  playerId: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  teamAbbrev: string;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  goalsAgainstAvg: number;
  savePctg: number;
  shotsAgainst: number;
  saves: number;
  shutouts: number;
  avgToi: string;
}

export interface NHLPlayerProfile {
  playerId: number;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  position: string;
  headshot: string;
  teamLogo: string;
  teamAbbrev?: string;
  birthDate: string;
  birthCity: { default: string };
  birthCountry: string;
  heightInInches: number;
  weightInPounds: number;
  isActive: boolean;
  featuredStats?: {
    season: number;
    regularSeason: {
      subSeason: {
        gamesPlayed: number;
        goals?: number;
        assists?: number;
        points?: number;
        plusMinus?: number;
        pim?: number;
        shots?: number;
        avgToi?: string;
        goalsAgainstAvg?: number;
        savePctg?: number;
        wins?: number;
        losses?: number;
        shutouts?: number;
      };
    };
  };
  last5Games?: Array<{
    gameId: number;
    goals?: number;
    assists?: number;
    points?: number;
    plusMinus?: number;
    toi?: string;
    decision?: string;
    savePctg?: number;
  }>;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Combined Game Data
export interface EnrichedGame {
  nhl: NHLGame;
  bestLines?: BestLines;
  prediction?: GamePrediction;
}
