'use client'

import { useState, useEffect } from 'react';

export default function StoreUsersPage() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCashConversion, setShowCashConversion] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversionData, setConversionData] = useState({
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
    
    if (parsedAdmin.role === 'super_admin') {
      window.location.href = '/admin/users';
      return;
    }

    if (parsedAdmin.role !== 'store_owner' && parsedAdmin.role !== 'store_manager') {
      window.location.href = '/admin';
      return;
    }

    fetchStoreUsers(parsedAdmin);
    fetchActiveUsers(parsedAdmin);
    
    // Refresh active users every 30 seconds
    const interval = setInterval(() => fetchActiveUsers(parsedAdmin), 30000);
    return () => clearInterval(interval);
  }, [searchTerm, statusFilter]);

  const fetchStoreUsers = async (adminData) => {
    try {
      // Mock store-specific users - replace with API call
      const storeUsers = [
        {
          _id: '1',
          email: 'john.customer@example.com',
          firstName: 'John',
          lastName: 'Customer',
          role: 'user',
          gambinoBalance: 45000,
          gluckScore: 120,
          tier: 'gold',
          isActive: true,
          createdAt: new Date('2024-06-15'),
          lastVisit: new Date('2025-08-19'),
          favoriteLocation: adminData.storeId,
          totalDeposits: 450,
          totalWithdrawals: 125,
          lifetimePlay: 12500
        },
        {
          _id: '2',
          email: 'sarah.player@example.com',
          firstName: 'Sarah',
          lastName: 'Player',
          role: 'user',
          gambinoBalance: 23000,
          gluckScore: 85,
          tier: 'silver',
          isActive: true,
          createdAt: new Date('2024-07-20'),
          lastVisit: new Date('2025-08-18'),
          favoriteLocation: adminData.storeId,
          totalDeposits: 230,
          totalWithdrawals: 45,
          lifetimePlay: 5600
        },
        {
          _id: '3',
          email: 'vip@example.com',
          firstName: 'High',
          lastName: 'Roller',
          role: 'user',
          gambinoBalance: 156000,
          gluckScore: 450,
          tier: 'platinum',
          isActive: true,
          createdAt: new Date('2024-05-10'),
          lastVisit: new Date('2025-08-20'),
          favoriteLocation: adminData.storeId,
          totalDeposits: 1560,
          totalWithdrawals: 890,
          lifetimePlay: 45000
        },
        {
          _id: '4',
          email: 'regular@example.com',
          firstName: 'Regular',
          lastName: 'Customer',
          role: 'user',
          gambinoBalance: 8500,
          gluckScore: 35,
          tier: 'bronze',
          isActive: true,
          createdAt: new Date('2024-08-01'),
          lastVisit: new Date('2025-08-17'),
          favoriteLocation: adminData.storeId,
          totalDeposits: 85,
          totalWithdrawals: 20,
          lifetimePlay: 2100
        }
      ];

      setUsers(storeUsers.filter(user => user.favoriteLocation === adminData.storeId));
    } catch (error) {
      console.error('Failed to fetch store users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async (adminData) => {
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
      // Mock active users for development
      setActiveUsers([
        {
          _id: '1',
          email: 'john.customer@example.com',
          gambinoBalance: 45000,
          durationDisplay: '25 minutes',
          checkedInAt: new Date(Date.now() - 25 * 60 * 1000)
        },
        {
          _id: '3',
          email: 'vip@example.com',
          gambinoBalance: 156000,
          durationDisplay: '8 minutes',
          checkedInAt: new Date(Date.now() - 8 * 60 * 1000)
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
          userId: selectedUser._id,
          cashAmount: parseFloat(conversionData.cashAmount),
          machineId: conversionData.machineId,
          storeId: admin.storeId,
          notes: conversionData.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Successfully converted $${conversionData.cashAmount} to ${result.transaction.tokensDistributed} GAMBINO tokens for ${selectedUser.email}!`);
        setShowCashConversion(false);
        setSelectedUser(null);
        setConversionData({ cashAmount: '', machineId: '', notes: '' });
        // Refresh data
        fetchStoreUsers(admin);
        fetchActiveUsers(admin);
      } else {
        alert(`❌ Conversion failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = user.isActive;
    else if (statusFilter === 'inactive') matchesStatus = !user.isActive;
    else if (statusFilter === 'in_store') matchesStatus = activeUsers.some(au => au._id === user._id);
    
    return matchesSearch && matchesStatus;
  });

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading users...</div>
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
                <span className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Store Users
                </span>
                <a href="/admin/store/machines" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Machines
                </a>
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">👥 Store Users</h2>
          <p className="text-gray-400 mt-2">
            Managing users for: <span className="font-semibold">{admin?.storeName || admin?.storeId}</span>
          </p>
        </div>

        {/* Active Users Alert */}
        {activeUsers.length > 0 && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-200">🟢 Users Currently in Store</h3>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {activeUsers.length} Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeUsers.map((user, index) => (
                <div key={index} className="bg-green-800/30 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{user.email}</div>
                      <div className="text-sm text-green-200">
                        Balance: {user.gambinoBalance?.toLocaleString()} GAMBINO
                      </div>
                      <div className="text-xs text-green-300">
                        In store for: {user.durationDisplay}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowCashConversion(true);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm font-semibold ml-3"
                    >
                      💰 Convert Cash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="in_store">Currently In Store</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Balance & Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredUsers.map((user) => {
                  const isCurrentlyInStore = activeUsers.some(au => au._id === user._id);
                  const activeUserData = activeUsers.find(au => au._id === user._id);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.tier === 'platinum' ? 'bg-purple-600' :
                              user.tier === 'gold' ? 'bg-yellow-600' :
                              user.tier === 'silver' ? 'bg-gray-500' :
                              'bg-orange-600'
                            }`}>
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            {isCurrentlyInStore && (
                              <div className="text-xs text-green-400 font-semibold">
                                🟢 In store for {activeUserData?.durationDisplay}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {user.gambinoBalance?.toLocaleString()} GAMBINO
                        </div>
                        <div className="text-xs text-gray-400">
                          Glück Score: {user.gluckScore} • {user.tier?.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Deposits: ${user.totalDeposits} • Lifetime: ${user.lifetimePlay}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          Last Visit: {user.lastVisit?.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Member since: {user.createdAt?.toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isCurrentlyInStore
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                              : user.isActive
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                              : 'bg-red-900/30 text-red-400 border border-red-500/30'
                          }`}>
                            {isCurrentlyInStore ? 'IN STORE' : user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => alert(`View details for ${user.email}`)}
                          >
                            View
                          </button>
                          {isCurrentlyInStore && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowCashConversion(true);
                              }}
                              className="text-green-400 hover:text-green-300 font-semibold"
                            >
                              💰 Convert Cash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400">No users found matching your criteria</div>
            </div>
          )}
        </div>

        {/* Cash Conversion Modal */}
        {showCashConversion && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">💰 Convert Cash to GAMBINO Tokens</h3>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400">Converting for:</div>
                <div className="font-semibold text-white">{selectedUser.email}</div>
                <div className="text-sm text-blue-300">
                  Current Balance: {selectedUser.gambinoBalance?.toLocaleString()} GAMBINO
                </div>
              </div>
              
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Machine ID</label>
                  <select
                    value={conversionData.machineId}
                    onChange={(e) => setConversionData(prev => ({ ...prev, machineId: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select machine...</option>
                    <option value="GMB-001">GMB-001 - NCG Skills 1 (Front Counter)</option>
                    <option value="GMB-002">GMB-002 - FireLink (Back Wall)</option>
                    <option value="GMB-003">GMB-003 - Superior Skills 1 (Side Counter)</option>
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
                      setSelectedUser(null);
                      setConversionData({ cashAmount: '', machineId: '', notes: '' });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCashConversion}
                    disabled={!conversionData.cashAmount || !conversionData.machineId}
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
