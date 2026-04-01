import React from 'react';
import { PlayerStats, GoalStats } from './types';

// Number formatting helpers
const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(0)}%`;
};

const formatRatio = (value: number): string => {
    return value.toFixed(3);
};

const formatGoalsAgainstAverage = (value: number): string => {
    return value.toFixed(2);
};

const PlayerStatsClient: React.FC<{ stats: PlayerStats[] }> = ({ stats }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Shooting Percentage</th>
                    <th>Goals Against Average</th>
                    <th>Save Percentage</th>
                </tr>
            </thead>
            <tbody>
                {stats.map((player) => (
                    <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{formatPercentage(player.shootingPctg)}</td>
                        <td>{formatGoalsAgainstAverage(player.goalsAgainstAvg)}</td>
                        <td>{formatRatio(player.savePctg)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PlayerStatsClient;
