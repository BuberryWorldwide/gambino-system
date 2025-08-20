'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Coins, Trophy, TrendingUp, LogOut, MapPin, Clock, Star } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('gambino_token');
      const savedUser = localStorage.getItem('gambino_user');
      
      if (!token || !savedUser) {
        window.location.href = '/login';
        return;
      }

      setUser(JSON.parse(savedUser));

      // Load user profile (fresh data)
      const profileResponse = await fetch(`${apiUrl}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user);
        localStorage.setItem('gambino_user', JSON.stringify(profileData.user));
      }

      // Load stats
      const statsResponse = await fetch(`${apiUrl}/api/price/current`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load transactions
      const transactionsResponse = await fetch(`${apiUrl}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }

      // Load leaderboard
      const leaderboardResponse = await fetch(`${apiUrl}/api/leaderboard`);
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.leaderboard || []);
      }

    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gambino_token');
    localStorage.removeItem('gambino_user');
    window.location.href = '/';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierInfo = (tier) => {
    const tiers = {
      'none': { name: 'Newcomer', color: 'text-gray-400', bg: 'bg-gray-800' },
      'tier3': { name: 'Lucky League', color: 'text-blue-400', bg: 'bg-blue-900/20' },
      'tier2': { name: 'Thousand Club', color: 'text-purple-400', bg: 'bg-purple-900/20' },
      'tier1': { name: 'Board Member', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
    };
    return tiers[tier] || tiers['none'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎲</div>
          <p className="text-xl">Loading your fortune...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-3xl font-bold text-yellow-500 hover:text-yellow-400">
              🎲 GAMBINO
            </Link>
            <p className="text-gray-400 mt-1">Farm Luck. Mine Destiny.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="font-semibold">{user?.firstName || 'Lucky Player'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Balance Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-yellow-500" />
              <span className="text-sm text-gray-400">Balance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {user?.gambinoBalance?.toLocaleString() || '0'} GAMBINO
            </div>
            <div className="text-sm text-gray-400 mt-1">
              ≈ ${((user?.gambinoBalance || 0) * (stats?.currentPrice || 0.001)).toFixed(2)}
            </div>
          </div>

          {/* Glück Score Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8 text-purple-500" />
              <span className="text-sm text-gray-400">Glück Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {user?.gluckScore || 0}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Luck Rating
            </div>
          </div>

          {/* Tier Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-blue-500" />
              <span className="text-sm text-gray-400">Tier</span>
            </div>
            <div className={`text-2xl font-bold ${getTierInfo(user?.tier).color}`}>
              {getTierInfo(user?.tier).name}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {user?.totalJackpots || 0} jackpots hit
            </div>
          </div>

          {/* Token Price Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <span className="text-sm text-gray-400">Token Price</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              ${stats?.currentPrice || '0.001'}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Per GAMBINO
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Profile */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Overview */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <User className="h-6 w-6 mr-2 text-yellow-500" />
                Account Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Wallet Address</p>
                  <p className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                    {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-6)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="font-semibold">{user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Last Activity</p>
                  <p className="font-semibold">{user?.lastActivity ? formatDate(user.lastActivity) : 'Now'}</p>
                </div>
              </div>

              {/* Jackpot Stats */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <h4 className="font-semibold mb-3">Jackpot History</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{user?.majorJackpots || 0}</div>
                    <div className="text-sm text-gray-400">Major</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{user?.minorJackpots || 0}</div>
                    <div className="text-sm text-gray-400">Minor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{user?.machinesPlayed?.length || 0}</div>
                    <div className="text-sm text-gray-400">Machines</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-yellow-500" />
                Recent Activity
              </h3>
              
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-semibold capitalize">{tx.type}</div>
                        <div className="text-sm text-gray-400">{formatDate(tx.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${tx.type === 'purchase' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {tx.type === 'purchase' ? '+' : ''}{tx.amount.toLocaleString()} GAMBINO
                        </div>
                        {tx.usdAmount && (
                          <div className="text-sm text-gray-400">${tx.usdAmount}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start playing to see your activity here!</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              Leaderboard
            </h3>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((player, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    player.email === user?.email ? 'bg-yellow-900/20 border border-yellow-500/50' : 'bg-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-yellow-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {player.email === user?.email ? 'You' : player.email}
                        </div>
                        <div className={`text-xs ${getTierInfo(player.tier).color}`}>
                          {getTierInfo(player.tier).name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-500">{player.gluckScore}</div>
                      <div className="text-xs text-gray-400">{player.totalJackpots} wins</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rankings yet</p>
                <p className="text-sm">Be the first to climb the ladder!</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/machines"
            className="bg-yellow-500 text-black font-bold py-4 px-6 rounded-xl text-center hover:bg-yellow-400 transition-colors"
          >
            🎰 Find Machines
          </Link>
          
          <Link 
            href="/buy-tokens"
            className="bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-blue-500 transition-colors"
          >
            💰 Buy Tokens
          </Link>
          
          <Link 
            href="/leaderboard"
            className="bg-purple-600 text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-purple-500 transition-colors"
          >
            🏆 Full Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
