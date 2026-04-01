import { NHLBoxscore } from '@/lib/types';

export default function BoxScore({ boxscore }: { boxscore: NHLBoxscore }) {
  const { awayTeam, homeTeam, playerByGameStats } = boxscore;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Box Score</h3>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="font-bold text-lg">{awayTeam.abbrev}</div>
          <div className="text-3xl font-bold text-yellow-400">{awayTeam.score ?? 0}</div>
        </div>
        <div className="text-center text-gray-500 text-sm flex flex-col justify-center gap-1">
          <div>Shots: {awayTeam.sog ?? 0} - {homeTeam.sog ?? 0}</div>
          {awayTeam.powerPlayConversion && (
            <div>PP: {awayTeam.powerPlayConversion} - {homeTeam.powerPlayConversion}</div>
          )}
        </div>
        <div className="text-center">
          <div className="font-bold text-lg">{homeTeam.abbrev}</div>
          <div className="text-3xl font-bold text-yellow-400">{homeTeam.score ?? 0}</div>
        </div>
      </div>

      {/* Player Stats */}
      {playerByGameStats && (
        <div className="space-y-6">
          {(['awayTeam', 'homeTeam'] as const).map((side) => {
            const teamAbbrev = side === 'awayTeam' ? awayTeam.abbrev : homeTeam.abbrev;
            const stats = playerByGameStats[side];
            const skaters = [...(stats.forwards ?? []), ...(stats.defense ?? [])];

            return (
              <div key={side}>
                <h4 className="font-semibold text-yellow-400 mb-2">{teamAbbrev} Skaters</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-border">
                      <th className="text-left py-1">Player</th>
                      <th className="text-center py-1">G</th>
                      <th className="text-center py-1">A</th>
                      <th className="text-center py-1">P</th>
                      <th className="text-center py-1">+/-</th>
                      <th className="text-center py-1">SOG</th>
                      <th className="text-center py-1">TOI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skaters.map((player) => (
                      <tr key={player.playerId} className="border-b border-border/30">
                        <td className="py-1">{player.name.default}</td>
                        <td className="text-center py-1">{player.goals}</td>
                        <td className="text-center py-1">{player.assists}</td>
                        <td className="text-center py-1 font-semibold">{player.points}</td>
                        <td
                          className={`text-center py-1 ${
                            player.plusMinus > 0
                              ? 'text-green-400'
                              : player.plusMinus < 0
                              ? 'text-red-400'
                              : ''
                          }`}
                        >
                          {player.plusMinus > 0 ? '+' : ''}
                          {player.plusMinus}
                        </td>
                        <td className="text-center py-1">{player.shots}</td>
                        <td className="text-center py-1 text-gray-400">{player.toi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {stats.goalies && stats.goalies.length > 0 && (
                  <>
                    <h4 className="font-semibold text-yellow-400 mt-3 mb-2">{teamAbbrev} Goalies</h4>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-border">
                          <th className="text-left py-1">Goalie</th>
                          <th className="text-center py-1">SA/SV</th>
                          <th className="text-center py-1">SV%</th>
                          <th className="text-center py-1">TOI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.goalies.map((g) => (
                          <tr key={g.playerId} className="border-b border-border/30">
                            <td className="py-1">{g.name.default}</td>
                            <td className="text-center py-1">{g.saveShotsAgainst}</td>
                            <td className="text-center py-1">
                              {(g.savePctg * 100).toFixed(1)}%
                            </td>
                            <td className="text-center py-1 text-gray-400">{g.toi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
