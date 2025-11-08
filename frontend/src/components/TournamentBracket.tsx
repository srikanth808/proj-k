import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../services/api';

interface Player {
  id: number;
  name: string;
  category: string;
  ranking: number;
}

interface Fixture {
  id: number;
  round_number: number;
  match_number: number;
  player1: Player | null;
  player2: Player | null;
  bye: boolean;
  winner?: Player;
}

interface TournamentBracketProps {
  tournamentId?: number;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournamentId }) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);

  useEffect(() => {
    loadFixtures();
  }, [tournamentId]);

  const loadFixtures = async () => {
    try {
      const response = await apiService.getFixtures({ tournament: tournamentId });
      setFixtures(response.data);
    } catch (error) {
      console.error('Failed to load fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    try {
      setLoading(true);
      await apiService.generateFixtures();
      await loadFixtures();
    } catch (error) {
      console.error('Failed to generate fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRounds = () => {
    const rounds: { [key: number]: Fixture[] } = {};
    fixtures.forEach(fixture => {
      if (!rounds[fixture.round_number]) {
        rounds[fixture.round_number] = [];
      }
      rounds[fixture.round_number].push(fixture);
    });
    return rounds;
  };

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (totalRounds === 1) return 'Final';
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Final';
    if (roundNumber === totalRounds - 2) return 'Quarter-Final';
    return `Round ${roundNumber}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const rounds = getRounds();
  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <div className="tournament-bracket">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tournament Bracket</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateBracket}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          Generate Bracket
        </motion.button>
      </div>

      {fixtures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No fixtures generated yet</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateBracket}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Generate Tournament Bracket
          </motion.button>
        </div>
      ) : (
        <div className="bracket-container overflow-x-auto">
          <div className="flex gap-8 min-w-max p-4">
            {roundNumbers.map((roundNum, index) => (
              <div key={roundNum} className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-orange-400 text-center mb-4">
                  {getRoundName(roundNum, roundNumbers.length)}
                </h3>
                <div className="flex flex-col gap-4">
                  {rounds[roundNum].map((fixture, matchIndex) => (
                    <motion.div
                      key={fixture.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + matchIndex * 0.05 }}
                      className="relative"
                    >
                      <div
                        className="match-card cursor-pointer"
                        onClick={() => setSelectedMatch(fixture)}
                      >
                        <div className="player-slot">
                          <div className="player-info">
                            {fixture.player1 ? (
                              <>
                                <span className="player-name">{fixture.player1.name}</span>
                                <span className="player-rank">#{fixture.player1.ranking}</span>
                              </>
                            ) : fixture.bye ? (
                              <span className="text-gray-500">BYE</span>
                            ) : (
                              <span className="text-gray-500">TBD</span>
                            )}
                          </div>
                          {fixture.winner?.id === fixture.player1?.id && (
                            <div className="winner-badge">✓</div>
                          )}
                        </div>

                        <div className="vs-divider">VS</div>

                        <div className="player-slot">
                          <div className="player-info">
                            {fixture.player2 ? (
                              <>
                                <span className="player-name">{fixture.player2.name}</span>
                                <span className="player-rank">#{fixture.player2.ranking}</span>
                              </>
                            ) : fixture.bye ? (
                              <span className="text-gray-500">BYE</span>
                            ) : (
                              <span className="text-gray-500">TBD</span>
                            )}
                          </div>
                          {fixture.winner?.id === fixture.player2?.id && (
                            <div className="winner-badge">✓</div>
                          )}
                        </div>
                      </div>

                      {/* Connection line to next round */}
                      {roundNum < roundNumbers.length && (
                        <div className="connection-line"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedMatch(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-glass p-6 rounded-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Match Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Round:</span>
                <span className="text-white">{getRoundName(selectedMatch.round_number, roundNumbers.length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Match:</span>
                <span className="text-white">#{selectedMatch.match_number}</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="text-center text-orange-400 font-medium mb-2">Players</div>
                <div className="space-y-2">
                  <div className="text-white">{selectedMatch.player1?.name || 'TBD'}</div>
                  <div className="text-center text-gray-400">vs</div>
                  <div className="text-white">{selectedMatch.player2?.name || 'TBD'}</div>
                </div>
              </div>
              {selectedMatch.winner && (
                <div className="border-t border-gray-600 pt-3">
                  <div className="text-center">
                    <span className="text-green-400 font-medium">Winner: {selectedMatch.winner.name}</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedMatch(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TournamentBracket;
