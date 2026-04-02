import { redirect } from 'next/navigation';

/**
 * /stats/player-stats redirects to the canonical /stats/players URL
 * so that both slugs continue to work.
 */
export default function PlayerStatsCanonicalPage() {
  redirect('/stats/players');
}
