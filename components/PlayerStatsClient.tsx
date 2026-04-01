// Safe number formatting helper function
function safeToFixed(value, decimals) {
    return (typeof value === 'number' && !isNaN(value)) ? value.toFixed(decimals) : '0.00';
}

const PlayerStatsClient = () => {
    //... other code

    const shootingPctg = safeToFixed(shootingP, 2);
    const goalsAgainstAvg = safeToFixed(goalsAgainst, 2);
    const savePctg = safeToFixed(savesPercentage, 2);

    //... rest of the component logic remains unchanged

    return (
        <div>
            {/* Render values here */}
            <p>Shooting Percentage: {shootingPctg}</p>
            <p>Goals Against Average: {goalsAgainstAvg}</p>
            <p>Save Percentage: {savePctg}</p>
        </div>
    );
};

export default PlayerStatsClient;
