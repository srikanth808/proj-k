import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Fixture {
  id: number;
  round_number: number;
  match_number: number;
  player1: { id: number; name: string } | null;
  player2: { id: number; name: string } | null;
  winner: { id: number; name: string } | null;
}

const Fixtures: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    setFetchLoading(true);
    try {
      const res = await api.get('/fixtures/');
      setFixtures(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setFixtures([]);
      setError('Failed to load fixtures');
    } finally {
      setFetchLoading(false);
    }
  };

  const generateDefault = async () => {
    setLoading(true);
    setMessage('Generating fixtures...');
    try {
      const res = await api.post('/fixtures/generate_default/');
      setMessage('Fixtures generated for tournament ' + res.data.tournament_id);
      // Set fixtures directly from response if available, otherwise fetch
      if (res.data.fixtures && Array.isArray(res.data.fixtures)) {
        setFixtures(res.data.fixtures);
        setError('');
      } else {
        await fetchFixtures();
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to generate fixtures');
    } finally {
      setLoading(false);
    }
  };

  const groupFixturesByRound = (fixtures: Fixture[]) => {
    const grouped: { [key: number]: Fixture[] } = {};
    fixtures.forEach(fixture => {
      if (!grouped[fixture.round_number]) {
        grouped[fixture.round_number] = [];
      }
      grouped[fixture.round_number].push(fixture);
    });
    return grouped;
  };

  const groupedFixtures = groupFixturesByRound(fixtures);

  return (
    <div className="p-4 fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0 text-center">🏆 Tournament Fixtures</h2>
          <p className="text-center text-muted mb-0 mt-2">
            Generate and manage tournament brackets
          </p>
        </div>
        <div className="card-body">
          <div className="mb-4 text-center">
            <button
              onClick={generateDefault}
              disabled={loading}
              className="btn btn-secondary"
              style={{ minWidth: '250px' }}
            >
              {loading ? '⏳ Generating...' : '🎯 Generate Fixtures (Auto)'}
            </button>
            {message && (
              <div className={message.includes('Failed') ? 'error' : 'success'} style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>
                  {message.includes('Failed') ? '❌' : '✅'}
                </span>
                {message}
              </div>
            )}
          </div>

          {error && <div className="error">❌ {error}</div>}

          {fetchLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <div>Loading fixtures...</div>
            </div>
          ) : fixtures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏓</div>
              <h3>No fixtures yet</h3>
              <p>Generate fixtures to start the tournament bracket</p>
            </div>
          ) : (
            <div className="bracket-container">
              {Object.entries(groupedFixtures)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundFixtures], roundIndex) => (
                  <div key={round} className="mb-5 slide-up" style={{ animationDelay: `${roundIndex * 0.1}s` }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                      gap: '1rem'
                    }}>
                      <div style={{ 
                        height: '2px', 
                        flex: 1, 
                        background: 'linear-gradient(to right, transparent, var(--border-color), transparent)' 
                      }}></div>
                      <h3 className="mb-0" style={{ color: 'var(--accent-primary)' }}>
                        Round {round}
                      </h3>
                      <span className="badge">{roundFixtures.length} matches</span>
                      <div style={{ 
                        height: '2px', 
                        flex: 1, 
                        background: 'linear-gradient(to left, transparent, var(--border-color), transparent)' 
                      }}></div>
                    </div>
                    <div className="grid grid-auto-fit">
                      {roundFixtures.map((fixture, index) => (
                        <div
                          key={fixture.id}
                          className="card scale-in"
                          style={{
                            border: fixture.winner ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                            animationDelay: `${(roundIndex * 0.1) + (index * 0.05)}s`
                          }}
                        >
                          <div className="card-body">
                            <div className="text-center mb-3">
                              <span className="badge badge-primary">
                                Match {fixture.match_number}
                              </span>
                            </div>

                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '1rem',
                                  borderRadius: 'var(--border-radius-md)',
                                  background: fixture.winner?.id === fixture.player1?.id 
                                    ? 'linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-dark))' 
                                    : 'var(--bg-glass)',
                                  color: fixture.winner?.id === fixture.player1?.id ? 'white' : 'var(--text-primary)',
                                  marginBottom: '0.75rem',
                                  fontWeight: '600',
                                  transition: 'all var(--transition-base)'
                                }}
                              >
                                <span>{fixture.player1?.name || 'TBD'}</span>
                                {fixture.winner?.id === fixture.player1?.id && <span style={{ fontSize: '1.5rem' }}>🏆</span>}
                              </div>

                              <div style={{ 
                                textAlign: 'center', 
                                margin: '0.75rem 0', 
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                              }}>
                                VS
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '1rem',
                                  borderRadius: 'var(--border-radius-md)',
                                  background: fixture.winner?.id === fixture.player2?.id 
                                    ? 'linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-dark))' 
                                    : 'var(--bg-glass)',
                                  color: fixture.winner?.id === fixture.player2?.id ? 'white' : 'var(--text-primary)',
                                  fontWeight: '600',
                                  transition: 'all var(--transition-base)'
                                }}
                              >
                                <span>{fixture.player2?.name || 'TBD'}</span>
                                {fixture.winner?.id === fixture.player2?.id && <span style={{ fontSize: '1.5rem' }}>🏆</span>}
                              </div>
                            </div>

                            {fixture.winner && (
                              <div className="text-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <span className="badge badge-success">
                                  Winner: {fixture.winner.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
