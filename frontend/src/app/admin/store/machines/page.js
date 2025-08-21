'use client'

import { useState, useEffect } from 'react';

export default function StoreMachinesPage() {
  const [admin, setAdmin] = useState(null);
  const [machines, setMachines] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showCashConversion, setShowCashConversion] = useState(false);
  const [conversionData, setConversionData] = useState({
    userId: '',
    cashAmount: '',
    machineId: '',
    notes: ''
  });

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !adminData) {
      window.location.href = '/admin';
      return;
    }

    const parsedAdmin = JSON.parse(adminData);
    setAdmin(parsedAdmin);
    
    if (parsedAdmin.role !== 'store_owner' && parsedAdmin.role !== 'store_manager') {
      window.location.href = '/admin';
      return;
    }

    loadStoreMachines(parsedAdmin);
    loadActiveUsers(parsedAdmin);
    
    // Refresh active users every 30 seconds
    const interval = setInterval(() => loadActiveUsers(parsedAdmin), 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStoreMachines = async (adminData) => {
    try {
      // Mock machine data - replace with API call
      const storeMachines = [
        {
          id: 'GMB-001',
          serialNumber: 'GMB-ELV-001',
          gameType: 'NCG Skills 1',
          location: 'Front Counter',
          status: 'active',
          connectionStatus: 'online',
          lastActivity: new Date(Date.now() - 5000),
          monthlyRevenue: 4500,
          totalPlayed: 1250000,
          totalPayout: 875000,
          jackpotPool: 12500,
          cashBalance: 850 // NEW: Current cash in machine
        },
        {
          id: 'GMB-002',
          serialNumber: 'GMB-ELV-002',
          gameType: 'FireLink',
          location: 'Back Wall',
          status: 'active',
          connectionStatus: 'online',
          lastActivity: new Date(Date.now() - 15000),
          monthlyRevenue: 6200,
          totalPlayed: 1580000,
          totalPayout: 1106000,
          jackpotPool: 18750,
          cashBalance: 1240
        },
        {
          id: 'GMB-003',
          serialNumber: 'GMB-ELV-003',
          gameType: 'Superior Skills 1',
          location: 'Side Counter',
          status: 'maintenance',
          connectionStatus: 'offline',
          lastActivity: new Date(Date.now() - 3600000),
          monthlyRevenue: 3800,
          totalPlayed: 950000,
          totalPayout: 665000,
          jackpotPool: 9500,
          cashBalance: 620
        }
      ];

      setMachines(storeMachines);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveUsers = async (adminData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://192.168.1.235:3001/api/stores/${adminData.storeId}/active-users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveUsers(data.activeUsers || []);
      }
    } catch (error) {
      console.error('Failed to load active users:', error);
      // Mock data for development
      setActiveUsers([
        {
          _id: '1',
          email: 'john.doe@example.com',
          gambinoBalance: 45000,
          durationDisplay: '15 minutes',
          walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
        },
        {
          _id: '2', 
          email: 'sarah.player@example.com',
          gambinoBalance: 23000,
          durationDisplay: '8 minutes',
          walletAddress: '8yLYuh3DX98e08YKTEqcE6kCifgUeRsB94aVsKpthBtV'
        }
      ]);
    }
  };

  const handleCashConversion = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://192.168.1.235:3001/api/admin/convert-cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          userId: conversionData.userId,
          cashAmount: parseFloat(conversionData.cashAmount),
          machineId: conversionData.machineId,
          storeId: admin.storeId,
          notes: conversionData.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Successfully converted $${conversionData.cashAmount} to ${result.transaction.tokensDistributed} GAMBINO tokens!`);
        setShowCashConversion(false);
        setConversionData({ userId: '', cashAmount: '', machineId: '', notes: '' });
        // Refresh active users to show updated balance
        loadActiveUsers(admin);
      } else {
        alert(`❌ Conversion failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading machines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-yellow-500">🎲 Gambino Admin</h1>
              <nav className="flex space-x-4">
                <a href="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/admin/store/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Store Users
                </a>
                <span className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Machines
                </span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {admin?.firstName} {admin?.lastName} ({admin?.role?.replace('_', ' ')})
              </span>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Store Machine Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">🎰 Machine Management</h2>
              <p className="text-gray-400 mt-2">
                Managing machines for: <span className="font-semibold">{admin?.storeName || admin?.storeId}</span>
              </p>
            </div>
            <button
              onClick={() => setShowCashConversion(true)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <span className="mr-2">💰</span>
              Convert Cash to Tokens
            </button>
          </div>
        </div>

        {/* Active Users Panel */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-200">👥 Users Currently in Store</h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {activeUsers.length} Active
            </span>
          </div>
          
          {activeUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUsers.map((user, index) => (
                <div key={index} className="bg-blue-800/30 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{user.email}</div>
                      <div className="text-sm text-blue-200">
                        Balance: {user.gambinoBalance?.toLocaleString()} GAMBINO
                      </div>
                      <div className="text-xs text-blue-300">
                        In store for: {user.durationDisplay}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setConversionData(prev => ({ ...prev, userId: user._id }));
                        setShowCashConversion(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                    >
                      Convert Cash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-300">
              No users currently checked into this store
            </div>
          )}
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{machine.id}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    machine.status === 'active' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                      : machine.status === 'maintenance'
                      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-900/30 text-red-400 border border-red-500/30'
                  }`}>
                    {machine.status.toUpperCase()}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${
                    machine.connectionStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Game Type</div>
                    <div className="font-semibold text-white">{machine.gameType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="font-semibold text-white">{machine.location}</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Monthly Revenue</div>
                      <div className="font-semibold text-green-400">${machine.monthlyRevenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Cash Balance</div>
                      <div className="font-semibold text-yellow-400">${machine.cashBalance}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Jackpot Pool</div>
                      <div className="font-semibold text-purple-400">${machine.jackpotPool.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Last Activity</div>
                      <div className="text-sm text-gray-300">
                        {Math.floor((Date.now() - machine.lastActivity) / 60000)}m ago
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConversionData(prev => ({ ...prev, machineId: machine.id }));
                    setShowCashConversion(true);
                  }}
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-semibold"
                >
                  💰 Record Cash Sale
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cash Conversion Modal */}
        {showCashConversion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">💰 Convert Cash to GAMBINO Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Select User</label>
                  <select
                    value={conversionData.userId}
                    onChange={(e) => setConversionData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Choose a user currently in store...</option>
                    {activeUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.email} (Balance: {user.gambinoBalance?.toLocaleString()} GAMBINO)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cash Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={conversionData.cashAmount}
                    onChange={(e) => setConversionData(prev => ({ ...prev, cashAmount: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="20.00"
                  />
                  {conversionData.cashAmount && (
                    <div className="text-sm text-green-400 mt-1">
                      Will convert to: {Math.floor(parseFloat(conversionData.cashAmount || 0) / 0.001).toLocaleString()} GAMBINO tokens
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Machine</label>
                  <select
                    value={conversionData.machineId}
                    onChange={(e) => setConversionData(prev => ({ ...prev, machineId: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select machine...</option>
                    {machines.filter(m => m.status === 'active').map(machine => (
                      <option key={machine.id} value={machine.id}>
                        {machine.id} - {machine.gameType} ({machine.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={conversionData.notes}
                    onChange={(e) => setConversionData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Customer fed $20 into machine..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCashConversion(false);
                      setConversionData({ userId: '', cashAmount: '', machineId: '', notes: '' });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCashConversion}
                    disabled={!conversionData.userId || !conversionData.cashAmount || !conversionData.machineId}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
                  >
                    Convert ${conversionData.cashAmount}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
