'use client'
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (adminToken && adminData) {
      setToken(adminToken);
      setAdmin(JSON.parse(adminData));
      loadDashboardData(adminToken, JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const loadDashboardData = async (token, adminData) => {
    try {
      // Load basic stats
      const statsResponse = await fetch('http://192.168.1.235:3001/api/admin/metrics?timeframe=7d', {
        headers: { 'admin-key': 'admin123' }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load users (filtered by role)
      // Store owners/managers should only see their store's users
      // This would be implemented in the backend, for now we'll mock it
      const mockUsers = [
        {
          email: 'user1@store.com',
          gambinoBalance: 25000,
          tier: 'tier2',
          storeId: adminData.role === 'super_admin' ? 'all' : 'elevated_main'
        },
        {
          email: 'user2@store.com',
          gambinoBalance: 15000,
          tier: 'tier1',
          storeId: adminData.role === 'super_admin' ? 'all' : 'elevated_main'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!token || !admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">You need admin access to view this page.</p>
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Login
          </a>
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
                  className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/settings"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </a>
                {/* Role-based navigation - FIXED ROUTING */}
                {admin.role === 'super_admin' ? (
                  <>
                    <a
                      href="/admin/users"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Manage Users
                    </a>
                    <a
                      href="/admin/treasury"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Treasury
                    </a>
                  </>
                ) : (admin.role === 'store_owner' || admin.role === 'store_manager') ? (
                  <>
                    <a
                      href="/admin/store/users"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Store Users
                    </a>
                    <a
                      href="/admin/store/machines"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Machines
                    </a>
                  </>
                ) : null}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {admin.firstName} {admin.lastName} ({admin.role?.replace('_', ' ')})
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">
            {admin.role === 'super_admin' ? 'System Overview' : 
             admin.role === 'store_owner' ? 'Store Management' : 
             'Store Dashboard'}
          </h2>
          <p className="text-gray-400 mt-2">
            {admin.role === 'super_admin' ? 'Complete system administration' :
             admin.role === 'store_owner' ? `Managing ${admin.storeName || 'your stores'}` :
             `Managing ${admin.storeName || 'your store'}`}
          </p>
        </div>

        {/* Role-based Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 font-semibold text-sm uppercase">
                    {admin.role === 'super_admin' ? 'Total Users' : 'Store Users'}
                  </h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {admin.role === 'super_admin' ? stats.newUsers : users.length}
                  </p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 font-semibold text-sm uppercase">
                    {admin.role === 'super_admin' ? 'Total Transactions' : 'Store Transactions'}
                  </h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.totalTransactions || 0}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 font-semibold text-sm uppercase">Volume (7d)</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    ${stats.totalVolume?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 font-semibold text-sm uppercase">
                    {admin.role === 'super_admin' ? 'System Status' : 'Store Status'}
                  </h3>
                  <p className="text-3xl font-bold text-green-400 mt-2">ACTIVE</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>
        )}

        {/* Role-based Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions - Role Based - FIXED ROUTING */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/settings"
                className="flex items-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <span className="mr-3">⚙️</span>
                <div>
                  <div className="font-semibold">Account Settings</div>
                  <div className="text-sm text-blue-200">Manage your admin account</div>
                </div>
              </a>

              {/* Fixed user management routing by role */}
              {admin.role === 'super_admin' ? (
                <>
                  <a
                    href="/admin/users"
                    className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <span className="mr-3">👥</span>
                    <div>
                      <div className="font-semibold">Manage All Users</div>
                      <div className="text-sm text-purple-200">System-wide user management</div>
                    </div>
                  </a>
                  <a
                    href="/admin/treasury"
                    className="flex items-center p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <span className="mr-3">🏦</span>
                    <div>
                      <div className="font-semibold">Treasury Management</div>
                      <div className="text-sm text-green-200">Monitor GAMBINO reserves</div>
                    </div>
                  </a>
                </>
              ) : (admin.role === 'store_owner' || admin.role === 'store_manager') ? (
                <>
                  <a
                    href="/admin/store/users"
                    className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <span className="mr-3">👥</span>
                    <div>
                      <div className="font-semibold">Manage Store Users</div>
                      <div className="text-sm text-purple-200">Your store's customers</div>
                    </div>
                  </a>
                  <a
                    href="/admin/store/machines"
                    className="flex items-center p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    <span className="mr-3">🎰</span>
                    <div>
                      <div className="font-semibold">Manage Machines</div>
                      <div className="text-sm text-orange-200">Gaming machines & analytics</div>
                    </div>
                  </a>
                </>
              ) : null}
            </div>
          </div>

          {/* Store Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {admin.role === 'super_admin' ? 'System Information' : 'Store Information'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <div className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                  admin.role === 'super_admin'
                    ? 'bg-red-900/30 text-red-400 border border-red-500'
                    : admin.role === 'store_owner'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500'
                    : 'bg-purple-900/30 text-purple-400 border border-purple-500'
                }`}>
                  {admin.role?.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <div className="text-white">{admin.email}</div>
              </div>

              {admin.role !== 'super_admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Store</label>
                    <div className="text-white">{admin.storeName || 'Store Name'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Store ID</label>
                    <div className="text-gray-300 font-mono text-sm">{admin.storeId || 'store_id'}</div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Access Level</label>
                <div className="text-white">
                  {admin.role === 'super_admin' ? 'Full System Access' :
                   admin.role === 'store_owner' ? 'Store Management Access' :
                   'Store Operations Access'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (if available) */}
        {users.length > 0 && admin.role !== 'super_admin' && (
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Store Users</h3>
            <div className="space-y-3">
              {users.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">{user.email}</div>
                    <div className="text-sm text-gray-400">
                      Balance: {user.gambinoBalance?.toLocaleString()} GAMBINO • Tier: {user.tier}
                    </div>
                  </div>
                  <div className="text-green-400 text-sm">Active</div>
                </div>
              ))}
            </div>
            
            {/* Link to view all users - role-based routing */}
            <div className="mt-4 flex space-x-4">
              <a
                href={admin.role === 'super_admin' ? '/admin/users' : '/admin/store/users'}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all {admin.role === 'super_admin' ? 'users' : 'store users'} →
              </a>
              {(admin.role === 'store_owner' || admin.role === 'store_manager') && (
                <a
                  href="/admin/store/machines"
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  Manage machines →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
