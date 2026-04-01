import { isFiniteNumber, fmtFixed, fmtPct1 } from 'myHelpers';

// ... other imports

const shootingPctg = isFiniteNumber(player.shootingPctg) ? fmtPct1(player.shootingPctg) : 'N/A';
const goalsAgainstAvg = isFiniteNumber(player.goalsAgainstAvg) ? fmtFixed(player.goalsAgainstAvg, 2) : 'N/A';
const savePctg = isFiniteNumber(player.savePctg) ? fmtFixed(player.savePctg, 2) : 'N/A';

// ... rest of PlayerStatsClient.tsx code ...