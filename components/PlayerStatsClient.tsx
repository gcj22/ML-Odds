// Safe number helpers
function isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

function fmtFixed(v, digits) {
    return isFiniteNumber(v) ? v.toFixed(digits) : 'N/A';
}

function fmtPct1(v) {
    return isFiniteNumber(v) ? `${(v * 100).toFixed(1)}%` : 'N/A';
}

// Updated contents for PlayerStatsClient.tsx

// Assume the rest of the component is preserved from the version in the ref cbdb7779d1eb634e28ccc5ceaa2452d12c945ec7

const shootingPctg = fmtPct1(playerStats.shootingPercentage);
const goalsAgainstAvg = fmtFixed(playerStats.goalsAgainstAverage, 2);
const savePctg = fmtPct1(playerStats.savePercentage);

// Your component code continues...