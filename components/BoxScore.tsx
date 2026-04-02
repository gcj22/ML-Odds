import { NHLBoxscore } from '@/lib/types';

export default function BoxScore({ boxscore }: { boxscore: NHLBoxscore }) {
  const { awayTeam, homeTeam, playerByGameStats } = boxscore;

  const thStyle: React.CSSProperties = {
    padding: '0.375rem 0.5rem',
    fontSize: '0.5625rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#524D47',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      className="rounded overflow-hidden"
      style={{ background: '#121212', border: '1px solid #242424' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        <h3 style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#C6973F' }}>
          Box Score
        </h3>
      </div>

      {/* Team summary */}
      <div
        className="grid grid-cols-3 gap-4 px-4 py-4"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        <div className="text-center">
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EDE8E0',
            letterSpacing: '-0.01em' }}>{awayTeam.abbrev}</p>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '2rem',
            fontWeight: 700, color: '#C6973F', letterSpacing: '-0.04em' }}>
            {awayTeam.score ?? 0}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-1">
          <p style={{ fontSize: '0.6875rem', color: '#524D47' }}>
            Shots: {awayTeam.sog ?? 0} – {homeTeam.sog ?? 0}
          </p>
          {awayTeam.powerPlayConversion && (
            <p style={{ fontSize: '0.6875rem', color: '#524D47' }}>
              PP: {awayTeam.powerPlayConversion} – {homeTeam.powerPlayConversion}
            </p>
          )}
        </div>
        <div className="text-center">
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EDE8E0',
            letterSpacing: '-0.01em' }}>{homeTeam.abbrev}</p>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '2rem',
            fontWeight: 700, color: '#C6973F', letterSpacing: '-0.04em' }}>
            {homeTeam.score ?? 0}
          </p>
        </div>
      </div>

      {/* Player stats */}
      {playerByGameStats && (
        <div className="divide-y" style={{ borderColor: '#1C1C1C' }}>
          {(['awayTeam', 'homeTeam'] as const).map((side) => {
            const teamAbbrev = side === 'awayTeam' ? awayTeam.abbrev : homeTeam.abbrev;
            const stats = playerByGameStats[side];
            const skaters = [...(stats.forwards ?? []), ...(stats.defense ?? [])];

            return (
              <div key={side} className="p-4 space-y-4">
                {/* Skaters */}
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#C6973F', marginBottom: '0.625rem' }}>
                    {teamAbbrev} Skaters
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                          <th style={{ ...thStyle, textAlign: 'left' }}>Player</th>
                          {['G','A','P','+/-','SOG','TOI'].map((h) => (
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {skaters.map((player, i) => (
                          <tr
                            key={player.playerId}
                            style={{
                              borderBottom: i < skaters.length - 1 ? '1px solid #1C1C1C' : 'none',
                            }}
                          >
                            <td style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem',
                              color: '#EDE8E0', whiteSpace: 'nowrap' }}>
                              {player.name.default}
                            </td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                              color: '#8A8278' }}>{player.goals}</td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                              color: '#8A8278' }}>{player.assists}</td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                              fontWeight: 700, color: player.points > 0 ? '#C6973F' : '#524D47' }}>
                              {player.points}
                            </td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                              color: player.plusMinus > 0 ? '#4A9B6F'
                                : player.plusMinus < 0 ? '#C04040' : '#524D47' }}>
                              {player.plusMinus > 0 ? '+' : ''}{player.plusMinus}
                            </td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                              color: '#8A8278' }}>{player.shots}</td>
                            <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                              fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem',
                              color: '#524D47' }}>{player.toi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Goalies */}
                {stats.goalies && stats.goalies.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: '#C6973F', marginBottom: '0.625rem' }}>
                      {teamAbbrev} Goalies
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Goalie</th>
                            {['SA/SV','SV%','TOI'].map((h) => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stats.goalies.map((g, i) => (
                            <tr
                              key={g.playerId}
                              style={{
                                borderBottom: i < stats.goalies!.length - 1 ? '1px solid #1C1C1C' : 'none',
                              }}
                            >
                              <td style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem',
                                color: '#EDE8E0', whiteSpace: 'nowrap' }}>
                                {g.name.default}
                              </td>
                              <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                                fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                                color: '#8A8278' }}>{g.saveShotsAgainst}</td>
                              <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                                fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem',
                                color: '#C6973F', fontWeight: 600 }}>
                                {(g.savePctg * 100).toFixed(1)}%
                              </td>
                              <td style={{ padding: '0.375rem 0.5rem', textAlign: 'center',
                                fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem',
                                color: '#524D47' }}>{g.toi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
