import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import styles from './Navigation.module.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/register', label: 'Register', icon: '📝' },
    { path: '/players', label: 'Players', icon: '👥' },
    { path: '/fixtures', label: 'Fixtures', icon: '🏆' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/live', label: 'Live Score', icon: '🎯' },
    { path: '/results', label: 'Results', icon: '🏅' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
    { path: '/referee', label: 'Referee', icon: '🏓' },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className={styles.navigationContainer}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <motion.span
                className={styles.navIcon}
                animate={location.pathname === item.path ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {item.icon}
              </motion.span>
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;
