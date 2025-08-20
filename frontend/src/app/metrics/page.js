'use client'
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Coins, DollarSign, Activity, Target, BarChart3, Clock } from 'lucide-react';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadMetrics();
  }, [timeframe]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch all metrics data
      const [statsRes, usersRes, transactionsRes, leaderboardRes] = await Promise.all([
        fetch(`${apiUrl}/api/price/current`),
        fetch(`${apiUrl}/api/admin/stats`, { 
          headers: { 'admin-key': 'admin123' } // Simple admin key for now
        }),
        fetch(`${apiUrl}/api/admin/metrics?timeframe=${timeframe}`, {
          headers: { 'admin-key': 'admin123' }
        }),
        fetch(`${apiUrl}/api/leaderboard`)
      ]);

      const stats = await statsRes.json();
      const users = await usersRes.json();
      const transactions = await transactionsRes.json();
      const leaderboard = await leaderboardRes.json();

      setMetrics({
        tokenStats: stats.stats || {},
        userStats: users.stats || {},
        transactionData: transactions.data || {},
        leaderboard: leaderboard.leaderboard || []
      });

    } catch (error) {
      console.error('Metrics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 animate-pulse text-yellow-500" />
          <p className="text-xl">Loading metrics...</p>
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
            <h1 className="text-3xl font-bold text-yellow-500">📊 Gambino Metrics</h1>
            <p className="text-gray-400 mt-1">Real-time tokenomics and user data</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            
            <button
              onClick={loadMetrics}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Users */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-sm text-gray-400">Users</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">
              {formatNumber(metrics?.userStats?.totalUsers)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {formatNumber(metrics?.userStats?.activeUsers)} active
            </div>
          </div>

          {/* Total GAMBINO */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-yellow-500" />
              <span className="text-sm text-gray-400">Total Supply</span>
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              {formatNumber(metrics?.tokenStats?.totalGambinoIssued)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              GAMBINO minted
            </div>
          </div>

          {/* Market Value */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-500" />
              <span className="text-sm text-gray-400">Market Value</span>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency((metrics?.tokenStats?.totalGambinoIssued || 0) * (metrics?.tokenStats?.currentPrice || 0.001))}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              @ ${metrics?.tokenStats?.currentPrice || '0.001'}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-purple-500" />
              <span className="text-sm text-gray-400">Transactions</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">
              {formatNumber(metrics?.userStats?.totalTransactions)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              All time
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Token Economics */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-yellow-500" />
              Token Economics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Price</span>
                <span className="font-bold text-green-500">
                  ${metrics?.tokenStats?.currentPrice || '0.001'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="font-bold">
                  {formatNumber(metrics?.tokenStats?.circulatingSupply)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Supply Cap</span>
                <span className="font-bold">
                  {formatNumber(777000000)} (777M)
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Supply Issued</span>
                <span className="font-bold text-yellow-500">
                  {((metrics?.tokenStats?.totalGambinoIssued || 0) / 777000000 * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jackpot Pool Remaining</span>
                <span className="font-bold text-red-500">
                  {formatNumber(777000000 * 0.4 - (metrics?.tokenStats?.jackpotsHitToday || 0))}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">24h Volume</span>
                <span className="font-bold">
                  {formatCurrency(metrics?.tokenStats?.volume24h || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* User Analytics */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-500" />
              User Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Registered Users</span>
                <span className="font-bold text-blue-500">
                  {formatNumber(metrics?.userStats?.totalUsers)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users (7d)</span>
                <span className="font-bold">
                  {formatNumber(metrics?.userStats?.activeUsers)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg. Balance per User</span>
                <span className="font-bold">
                  {formatNumber((metrics?.tokenStats?.totalGambinoIssued || 0) / (metrics?.userStats?.totalUsers || 1))} GAMBINO
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Jackpots Hit</span>
                <span className="font-bold text-yellow-500">
                  {formatNumber(metrics?.tokenStats?.jackpotsHitToday || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tier 1 Members</span>
                <span className="font-bold text-yellow-400">
                  {metrics?.leaderboard?.filter(p => p.tier === 'tier1').length || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tier 2 Members</span>
                <span className="font-bold text-purple-400">
                  {metrics?.leaderboard?.filter(p => p.tier === 'tier2').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
            Top Performers
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Highest Glück Score */}
            <div>
              <h4 className="font-semibold text-purple-400 mb-3">Highest Glück Score</h4>
              {metrics?.leaderboard?.slice(0, 3).map((player, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                      index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{player.email}</span>
                  </div>
                  <span className="font-bold text-purple-500">{player.gluckScore}</span>
                </div>
              ))}
            </div>

            {/* Most Jackpots */}
            <div>
              <h4 className="font-semibold text-yellow-400 mb-3">Most Jackpots</h4>
              {metrics?.leaderboard?.sort((a, b) => b.totalJackpots - a.totalJackpots).slice(0, 3).map((player, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                      index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{player.email}</span>
                  </div>
                  <span className="font-bold text-yellow-500">{player.totalJackpots}</span>
                </div>
              ))}
            </div>

            {/* Most Machines */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Most Machines Played</h4>
              {metrics?.leaderboard?.sort((a, b) => b.uniqueMachines - a.uniqueMachines).slice(0, 3).map((player, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                      index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{player.email}</span>
                  </div>
                  <span className="font-bold text-blue-500">{player.uniqueMachines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-yellow-500" />
            Key Ratios & Health Indicators
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {((metrics?.userStats?.activeUsers || 0) / (metrics?.userStats?.totalUsers || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">User Retention</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {((metrics?.tokenStats?.totalGambinoIssued || 0) / 777000000 * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Supply Minted</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {formatNumber((metrics?.tokenStats?.totalGambinoIssued || 0) / (metrics?.userStats?.totalUsers || 1))}
              </div>
              <div className="text-sm text-gray-400">Tokens per User</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {formatCurrency((metrics?.tokenStats?.volume24h || 0) / (metrics?.userStats?.activeUsers || 1))}
              </div>
              <div className="text-sm text-gray-400">Volume per User</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
