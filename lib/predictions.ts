import { TeamRatings, GamePrediction, BestLines } from './types';

let ratingsCache: TeamRatings | null = null;

export function getTeamRatings(): TeamRatings {
  if (ratingsCache) return ratingsCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ratings = require('../data/team_ratings.json') as TeamRatings;
    ratingsCache = ratings;
    return ratings;
  } catch {
    return { homeIceAdvantage: 0.1, teams: {} };
  }
}

function eloExpected(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function winProbToGoalDiff(prob: number): number {
  return Math.log(prob / (1 - prob)) * 1.5;
}

export function predictGame(
  homeTeamAbbrev: string,
  awayTeamAbbrev: string,
  bestLines?: BestLines
): GamePrediction {
  const ratings = getTeamRatings();

  const homeRating = ratings.teams[homeTeamAbbrev]?.rating ?? 1500;
  const awayRating = ratings.teams[awayTeamAbbrev]?.rating ?? 1500;
  const homeAdvantage = ratings.homeIceAdvantage;

  const adjustedHomeRating = homeRating + homeAdvantage * 100;

  const home_win_prob = eloExpected(adjustedHomeRating, awayRating);
  const away_win_prob = 1 - home_win_prob;
  const projected_goal_diff = winProbToGoalDiff(home_win_prob);

  const ratingDiff = Math.abs(adjustedHomeRating - awayRating);
  const projected_total_goals = 6.0 - ratingDiff * 0.002;

  const prediction: GamePrediction = {
    gameId: '',
    homeTeam: homeTeamAbbrev,
    awayTeam: awayTeamAbbrev,
    projected_goal_diff,
    projected_total_goals,
    home_win_prob,
    away_win_prob,
  };

  if (bestLines?.puckLine) {
    const marketLine = bestLines.puckLine.home.point ?? -1.5;
    const projectedLine = projected_goal_diff;
    const edge = projectedLine - marketLine;
    if (Math.abs(edge) > 0.3) {
      prediction.puck_line_lean = {
        side: edge > 0 ? 'home' : 'away',
        edge: Math.abs(edge),
      };
    }
  }

  if (bestLines?.totals) {
    const marketTotal = bestLines.totals.over.point ?? 5.5;
    const edge = projected_total_goals - marketTotal;
    if (Math.abs(edge) > 0.2) {
      prediction.total_lean = {
        side: edge > 0 ? 'over' : 'under',
        edge: Math.abs(edge),
      };
    }
  }

  return prediction;
}
