import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Calendar, BarChart3, Settings, Shield, UserCheck, UserX } from 'lucide-react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_verified: boolean;
}

interface TournamentStats {
  total_players: number;
  total_matches: number;
  completed_matches: number;
  active_matches: number;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TournamentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, playersRes, matchesRes] = await Promise.all([
        api.get('/auth/users/'),
        api.get('/players/'),
        api.get('/matches/')
      ]);

      setUsers(usersRes.data);
      setStats({
        total_players: playersRes.data.length,
        total_matches: matchesRes.data.length,
        completed_matches: matchesRes.data.filter((m: any) => m.status === 'COMPLETED').length,
        active_matches: matchesRes.data.filter((m: any) => m.status === 'LIVE').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await api.patch(`/auth/users/${userId}/`, { is_verified: true });
      } else {
        await api.delete(`/auth/users/${userId}/`);
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-white/80" />
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Panel...</div>
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
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/70">Manage tournament users and monitor system activity</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Players"
                value={stats.total_players}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Trophy}
                title="Total Matches"
                value={stats.total_matches}
                color="from-green-500 to-green-600"
              />
              <StatCard
                icon={Calendar}
                title="Completed Matches"
                value={stats.completed_matches}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                icon={Shield}
                title="Active Matches"
                value={stats.active_matches}
                color="from-orange-500 to-orange-600"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.user_type === 'admin' ? 'bg-red-500/20 text-red-300' :
                        user.user_type === 'referee' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {user.user_type}
                      </span>
                      {user.is_verified ? (
                        <UserCheck className="w-5 h-5 text-green-400" />
                      ) : (
                        <UserX className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">User Management</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                      <p className="text-white/40 text-xs capitalize">{user.user_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_verified ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    {!user.is_verified && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'approve')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'reject')}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">System Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Tournament Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter tournament name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Max Players per Match</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="2">Singles (2 players)</option>
                    <option value="4">Doubles (4 players)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
