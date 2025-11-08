import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

interface Match {
  id: number;
  player1: { id: number; name: string };
  player2: { id: number; name: string };
  status: string;
  score_player1: number;
  score_player2: number;
  current_set: number;
  sets_won_player1: number;
  sets_won_player2: number;
  court_number?: number;
  scheduled_time?: string;
}

interface ScoreUpdate {
  match_id: number;
  player: 1 | 2;
  score: number;
}

const RefereePanel: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreUpdate, setScoreUpdate] = useState<ScoreUpdate>({ match_id: 0, player: 1, score: 0 });

  const { sendMessage, lastMessage } = useWebSocket({
    url: 'ws://localhost:8000/ws/scoring/'
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'score_update') {
          updateMatchScore(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches/');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchScore = (data: any) => {
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === data.match_id
          ? {
              ...match,
              score_player1: data.score_player1,
              score_player2: data.score_player2,
              current_set: data.current_set,
              sets_won_player1: data.sets_won_player1,
              sets_won_player2: data.sets_won_player2,
              status: data.status
            }
          : match
      )
    );

    if (selectedMatch && selectedMatch.id === data.match_id) {
      setSelectedMatch(prev => prev ? {
        ...prev,
        score_player1: data.score_player1,
        score_player2: data.score_player2,
        current_set: data.current_set,
        sets_won_player1: data.sets_won_player1,
        sets_won_player2: data.sets_won_player2,
        status: data.status
      } : null);
    }
  };

  const handleStartMatch = async (matchId: number) => {
    try {
      await api.post(`/matches/${matchId}/start/`);
      sendMessage(JSON.stringify({
        type: 'match_start',
        match_id: matchId
      }));
      fetchMatches();
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handleEndMatch = async (matchId: number) => {
    try {
      await api.post(`/matches/${matchId}/end/`);
      sendMessage(JSON.stringify({
        type: 'match_end',
        match_id: matchId
      }));
      fetchMatches();
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const handleScoreUpdate = async (matchId: number, player: 1 | 2, score: number) => {
    try {
      await api.post(`/scoring/update-score/`, {
        match_id: matchId,
        player: player,
        score: score
      });

      sendMessage(JSON.stringify({
        type: 'score_update',
        match_id: matchId,
        player: player,
        score: score
      }));
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-400 bg-green-500/20';
      case 'COMPLETED': return 'text-blue-400 bg-blue-500/20';
      case 'SCHEDULED': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return <Play className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Referee Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Referee Panel</h1>
          <p className="text-white/70">Manage live matches and scoring</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Active Matches</h3>
              <div className="space-y-4">
                {matches.map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedMatch?.id === match.id
                        ? 'bg-purple-500/30 border border-purple-400'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Match #{match.id}</span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match.status)}`}>
                        {getMatchStatusIcon(match.status)}
                        <span>{match.status}</span>
                      </div>
                    </div>
                    <div className="text-white/80 text-sm">
                      <div>{match.player1.name} vs {match.player2.name}</div>
                      {match.court_number && (
                        <div className="text-white/60">Court {match.court_number}</div>
                      )}
                    </div>
                    {match.status === 'LIVE' && (
                      <div className="text-white/60 text-xs mt-1">
                        Set {match.current_set} • {match.score_player1}-{match.score_player2}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Match Control Panel */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Match Header */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Match #{selectedMatch.id}</h3>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getMatchStatusColor(selectedMatch.status)}`}>
                      {getMatchStatusIcon(selectedMatch.status)}
                      <span>{selectedMatch.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-white font-medium">{selectedMatch.player1.name}</div>
                      <div className="text-3xl font-bold text-blue-400">{selectedMatch.score_player1}</div>
                      <div className="text-white/60 text-sm">Sets: {selectedMatch.sets_won_player1}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">{selectedMatch.player2.name}</div>
                      <div className="text-3xl font-bold text-red-400">{selectedMatch.score_player2}</div>
                      <div className="text-white/60 text-sm">Sets: {selectedMatch.sets_won_player2}</div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex justify-center space-x-4">
                    {selectedMatch.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStartMatch(selectedMatch.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        <span>Start Match</span>
                      </button>
                    )}

                    {selectedMatch.status === 'LIVE' && (
                      <>
                        <button
                          onClick={() => handleScoreUpdate(selectedMatch.id, 1, selectedMatch.score_player1 + 1)}
                          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                          +1 Player 1
                        </button>
                        <button
                          onClick={() => handleScoreUpdate(selectedMatch.id, 2, selectedMatch.score_player2 + 1)}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          +1 Player 2
                        </button>
                        <button
                          onClick={() => handleEndMatch(selectedMatch.id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <Pause className="w-5 h-5" />
                          <span>End Match</span>
                        </button>
                      </>
                    )}

                    {selectedMatch.status === 'COMPLETED' && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Match Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Match Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-white/80">
                    <div>
                      <span className="font-medium">Current Set:</span> {selectedMatch.current_set}
                    </div>
                    <div>
                      <span className="font-medium">Court:</span> {selectedMatch.court_number || 'Not assigned'}
                    </div>
                    <div>
                      <span className="font-medium">Scheduled:</span> {selectedMatch.scheduled_time || 'Not scheduled'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedMatch.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center"
              >
                <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select a Match</h3>
                <p className="text-white/60">Choose a match from the list to start managing scores and controls</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefereePanel;
