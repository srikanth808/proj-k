import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import styles from './App.module.css';
import Registration from './pages/Registration';
import PlayersList from './pages/PlayersList';
import Fixtures from './pages/Fixtures';
import Schedule from './pages/Schedule';
import LiveScore from './pages/LiveScore';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';
import RefereePanel from './pages/RefereePanel';
import api from './services/api';

const App = () => {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [playersRes, matchesRes] = await Promise.all([
          api.get('/players/'),
          api.get('/matches/'),
        ]);

        const players = playersRes.data;
        const matches = matchesRes.data;

        setStats({
          totalPlayers: players.length,
          totalMatches: matches.length,
          liveMatches: matches.filter((m: any) => m.status === 'LIVE').length,
          completedMatches: matches.filter((m: any) => m.status === 'COMPLETED').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const HomePage = () => (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Hero Section */}
      <motion.div
        className="hero mb-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="hero-content">
          <motion.h1
            className={styles.mainTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            🏓 Badminton Tournament Manager
          </motion.h1>
          <motion.p
            className={styles.mainDescription}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Professional tournament management system for badminton enthusiasts. Track players, manage fixtures, and score matches in real-time.
          </motion.p>
          <motion.div
            className={styles.actionContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="btn btn-primary">
                📝 Register Player
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/live" className="btn btn-secondary">
                🎯 View Live Scores
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/fixtures" className="btn btn-outline">
                🏆 Tournament Fixtures
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <motion.h2
          className="mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          📊 Tournament Overview
        </motion.h2>
        <div className="grid grid-auto-fit">
          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(249, 115, 22, 0.2)"
            }}
          >
            <motion.div
              className="stats-card-icon"
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
              👥
            </motion.div>
            <div className="stats-card-value">{loading ? '...' : stats.totalPlayers}</div>
            <div className="stats-card-label">Total Players</div>
          </motion.div>

          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)"
            }}
          >
            <motion.div
              className="stats-card-icon"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              🏓
            </motion.div>
            <div className="stats-card-value">{loading ? '...' : stats.totalMatches}</div>
            <div className="stats-card-label">Total Matches</div>
          </motion.div>

          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(239, 68, 68, 0.2)"
            }}
          >
            <div className="stats-card-icon">
              <motion.span
                className="live-indicator"
                style={{ width: '12px', height: '12px' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
              />
            </div>
            <div className="stats-card-value" style={{ color: 'var(--error)' }}>
              {loading ? '...' : stats.liveMatches}
            </div>
            <div className="stats-card-label">Live Matches</div>
          </motion.div>

          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)"
            }}
          >
            <motion.div
              className="stats-card-icon"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 5
              }}
            >
              🏅
            </motion.div>
            <div className="stats-card-value" style={{ color: 'var(--accent-secondary)' }}>
              {loading ? '...' : stats.completedMatches}
            </div>
            <div className="stats-card-label">Completed</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        whileHover={{ y: -5 }}
      >
        <div className="card-header">
          <h3 className="mb-0">⚡ Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-auto-fit">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/fixtures" className="btn btn-secondary">
                🏆 Generate Fixtures
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/schedule" className="btn btn-secondary">
                📅 Manage Schedule
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/players" className="btn btn-secondary">
                👥 View Players
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/results" className="btn btn-secondary">
                🏅 View Results
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="app">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/players" element={<PlayersList />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/live" element={<LiveScore />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/referee" element={<RefereePanel />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
