import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import styles from './PlayersList.module.css';

type Player = {
  id: number;
  name: string;
  age: number;
  email?: string;
  phone?: string;
  country?: string;
  ranking: number;
  category: string;
  category_display: string;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: string;
  win_percentage: string;
  tournaments_played: number;
  best_finish?: string;
};

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('ranking');

  useEffect(() => {
    fetchPlayers();
  }, [searchTerm, categoryFilter, sortBy]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await api.get(`/players/?${params.toString()}`);
      let sortedPlayers = res.data;

      sortedPlayers.sort((a: Player, b: Player) => {
        if (sortBy === 'ranking') return b.ranking - a.ranking;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'win_rate') return parseFloat(b.win_rate) - parseFloat(a.win_rate);
        return 0;
      });

      setPlayers(sortedPlayers);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      'MS': '👨',
      'WS': '👩',
      'MD': '👨‍👨',
      'WD': '👩‍👩',
      'XD': '👫'
    };
    return emojis[category] || '🏓';
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking >= 1000) return { color: 'var(--accent-gold)', text: '🥇 Elite', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' };
    if (ranking >= 500) return { color: '#94a3b8', text: '🥈 Advanced', gradient: 'linear-gradient(135deg, #cbd5e1, #94a3b8)' };
    if (ranking >= 100) return { color: '#fb923c', text: '🥉 Intermediate', gradient: 'linear-gradient(135deg, #fb923c, #f97316)' };
    return { color: 'var(--accent-tertiary)', text: '🌱 Beginner', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' };
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="card mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card-header">
          <motion.h2
            className="mb-0 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            🏆 Player Rankings & Stats
          </motion.h2>
          <motion.p
            className="text-center text-muted mb-0 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            View and search all registered players
          </motion.p>
        </div>

        <div className="card-body">
          {/* Filters */}
          <motion.div
            className="grid grid-cols-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <motion.div
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="form-label">🔍 Search Players</label>
              <motion.input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or country..."
                className="form-input"
                whileFocus={{ scale: 1.02, borderColor: "var(--accent-primary)" }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            <motion.div
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="form-label">🏓 Filter by Category</label>
              <motion.select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
                aria-label="Filter players by category"
                whileFocus={{ scale: 1.02, borderColor: "var(--accent-primary)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <option value="">All Categories</option>
                <option value="MS">Men Singles</option>
                <option value="WS">Women Singles</option>
                <option value="MD">Men Doubles</option>
                <option value="WD">Women Doubles</option>
                <option value="XD">Mixed Doubles</option>
              </motion.select>
            </motion.div>

            <motion.div
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="form-label">📊 Sort By</label>
              <motion.select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                aria-label="Sort players"
                whileFocus={{ scale: 1.02, borderColor: "var(--accent-primary)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <option value="ranking">Ranking Points</option>
                <option value="name">Name</option>
                <option value="win_rate">Win Rate</option>
              </motion.select>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <div>Loading players...</div>
            </div>
          ) : players.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <motion.div
                className="empty-state-icon"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                🏓
              </motion.div>
              <h3>No players found</h3>
              <p>No players match your search criteria.</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-auto-fit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              {players.map((player, index) => {
                const badge = getRankingBadge(player.ranking);
                return (
                  <motion.div
                    key={player.id}
                    className="card"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.0 + (index * 0.1),
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      boxShadow: "0 20px 40px rgba(249, 115, 22, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card-body">
                      <div className={styles.playerCard}>
                        <motion.div
                          style={{
                            fontSize: '2.5rem',
                            marginRight: '1rem',
                            background: badge.gradient,
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)'
                          }}
                          animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 5 + (index * 0.5)
                          }}
                        >
                          {getCategoryEmoji(player.category)}
                        </motion.div>
                        <div className={styles.playerInfo}>
                          <h3 className={styles.playerName}>{player.name}</h3>
                          <motion.span
                            className={`badge ${styles.playerBadge}`}
                            style={{ background: badge.gradient }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {badge.text}
                          </motion.span>
                        </div>

                        <div className={styles.statsGrid}>
                          <motion.div
                            className={styles.statRow}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-muted">🏆 Ranking:</span>
                            <span className={`text-primary ${styles.rankingPoints}`}>{player.ranking} pts</span>
                          </motion.div>
                          <motion.div
                            className={styles.statRow}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-muted">🎯 Win Rate:</span>
                            <span className={`text-primary ${styles.rankingPoints}`}>{player.win_percentage}</span>
                          </motion.div>
                          <motion.div
                            className={styles.statRow}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-muted">📊 Record:</span>
                            <span className={`text-primary ${styles.rankingPoints}`}>{player.wins}W - {player.losses}L</span>
                          </motion.div>
                          <motion.div
                            className={styles.statRow}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-muted">🏓 Category:</span>
                            <span className={`text-primary ${styles.rankingPoints}`}>{player.category_display}</span>
                          </motion.div>
                          {player.country && (
                            <motion.div
                              className={styles.statRow}
                              whileHover={{ scale: 1.02 }}
                            >
                              <span className="text-muted">🌍 Country:</span>
                              <span className={`text-primary ${styles.rankingPoints}`}>{player.country}</span>
                            </motion.div>
                          )}
                        </div>

                        <motion.div
                          className="text-center"
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)'
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.2 + (index * 0.1) }}
                        >
                          Age: {player.age} • Tournaments: {player.tournaments_played}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayersList;