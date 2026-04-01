// Helper functions
const isFiniteNumber = (num) => typeof num === 'number' && isFinite(num);
const fmtFixed = (num) => (isFiniteNumber(num) ? num.toFixed(2) : 'N/A');
const fmtPct1 = (num) => (isFiniteNumber(num) ? (num * 100).toFixed(1) + '%' : 'N/A');

//... existing code ...

const shootingPctg = fmtPct1(player?.shootingPctg);
const goalsAgainstAvg = fmtFixed(goalie?.goalsAgainstAvg);
const savePctg = fmtPct1(goalie?.savePctg);

//... existing code ...
