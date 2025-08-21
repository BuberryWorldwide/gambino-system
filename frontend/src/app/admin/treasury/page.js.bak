'use client'
import { useState, useEffect } from 'react';

export default function AdminTreasuryPage() {
  const [admin, setAdmin] = useState(null);
  const [treasury, setTreasury] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!adminToken || !adminData) {
      window.location.href = '/admin';
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    loadTreasury();
  }, []);

  const loadTreasury = async () => {
    try {
      setError('');
      const response = await fetch('http://192.168.1.235:3001/api/blockchain-treasury/balances', {
        headers: { 'x-admin-key': 'your-admin-api-key-change-this' }
      });
      const data = await response.json();
      
      if (data.success) {
        setTreasury(data.data);
      } else {
        setError('Failed to load treasury data');
      }
    } catch (error) {
      setError('Network error loading treasury data');
      console.error('Treasury error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTreasury = async () => {
    setRefreshing(true);
    await loadTreasury();
    setRefreshing(false);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          Loading Treasury Data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-yellow-500">🎲 Gambino Admin</h1>
              <nav className="flex space-x-4">
                <a 
                  href="/admin" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a 
                  href="/admin/settings" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </a>
                <a 
                  href="/admin/treasury" 
                  className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Treasury
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {admin?.name} ({admin?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">🏦 Treasury Management</h2>
            <p className="text-gray-400 mt-2">Monitor and manage GAMBINO treasury accounts</p>
          </div>
          <button
            onClick={refreshTreasury}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <span className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {treasury ? (
          <>
            {/* Treasury Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-500 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-green-300 font-semibold text-sm uppercase tracking-wide">Total GAMBINO</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                      {(treasury.summary?.totalTokenBalance / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-green-200 text-sm mt-1">777M Total Supply</p>
                  </div>
                  <div className="text-4xl">🪙</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-500 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wide">Total SOL</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                      {treasury.summary?.totalSolBalance?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-blue-200 text-sm mt-1">Transaction Fees</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-purple-300 font-semibold text-sm uppercase tracking-wide">Active Accounts</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                      {treasury.summary?.healthyAccounts}/{treasury.summary?.totalAccounts}
                    </p>
                    <p className="text-purple-200 text-sm mt-1">All Healthy</p>
                  </div>
                  <div className="text-4xl">🏛️</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-900 to-orange-800 border border-orange-500 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-orange-300 font-semibold text-sm uppercase tracking-wide">Network</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                      {treasury.summary?.network?.toUpperCase()}
                    </p>
                    <p className="text-orange-200 text-sm mt-1">Solana Blockchain</p>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
              </div>
            </div>

            {/* Treasury Accounts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {treasury.accounts?.map(account => (
                <div key={account.accountType} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  {/* Account Header */}
                  <div className="bg-gray-750 border-b border-gray-700 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{account.label}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            account.securityLevel === 'CRITICAL' 
                              ? 'bg-red-900/30 text-red-400 border border-red-500'
                              : account.securityLevel === 'HIGH'
                              ? 'bg-orange-900/30 text-orange-400 border border-orange-500'
                              : account.securityLevel === 'MEDIUM'
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500'
                              : 'bg-green-900/30 text-green-400 border border-green-500'
                          }`}>
                            {account.securityLevel} SECURITY
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            account.status === 'HEALTHY' 
                              ? 'bg-green-900/30 text-green-400 border border-green-500'
                              : 'bg-red-900/30 text-red-400 border border-red-500'
                          }`}>
                            {account.status}
                          </span>
                        </div>
                      </div>
                      {account.percentage > 0 && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">{account.percentage}%</div>
                          <div className="text-xs text-gray-400">of supply</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Balances */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-400 mb-1">GAMBINO Balance</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {(account.tokenBalance / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-gray-500">
                          ${((account.tokenBalance / 1000000) * 0.001 * 1000).toFixed(0)}K value
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-400 mb-1">SOL Balance</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {account.solBalance?.toFixed(4) || '0.0000'}
                        </div>
                        <div className="text-xs text-gray-500">
                          For transactions
                        </div>
                      </div>
                    </div>

                    {/* Wallet Addresses */}
                    <div className="space-y-2">
                      <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                        <div className="font-mono text-xs text-gray-300 break-all">
                          {account.publicKey}
                        </div>
                      </div>
                      {account.tokenAccount && (
                        <div className="bg-gray-900 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Token Account</div>
                          <div className="font-mono text-xs text-gray-300 break-all">
                            {account.tokenAccount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Information */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Last Updated</div>
                  <div className="text-white">
                    {new Date(treasury.summary?.lastUpdated).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Network Status</div>
                  <div className="text-green-400 font-semibold">
                    ✅ Connected to {treasury.summary?.network?.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Token Symbol</div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {treasury.summary?.tokenSymbol}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Treasury Data</h3>
            <p className="text-gray-500">Unable to load treasury information</p>
          </div>
        )}
      </div>
    </div>
  );
}
