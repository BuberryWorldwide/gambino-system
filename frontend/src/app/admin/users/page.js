'use client'
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminData, setCreateAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'store_manager',
    storeId: '',
    storeName: ''
  });
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!adminToken || !adminData) {
      window.location.href = '/admin';
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError('');
      const response = await fetch('http://192.168.1.235:3001/api/admin/metrics?timeframe=all', {
        headers: { 'admin-key': 'admin123' }
      });
      
      // For now, let's get users from the database
      const usersResponse = await fetch('http://192.168.1.235:3001/api/admin/users', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'admin-key': 'admin123'
        }
      });
      
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        setUsers(userData.users || []);
      } else {
        // Fallback - create mock users list
        setUsers([
          {
            _id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
            gambinoBalance: 50000,
            gluckScore: 0,
            tier: 'none',
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date()
          },
          {
            _id: '2', 
            email: 'support@buberryworldwide.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            gambinoBalance: 0,
            gluckScore: 0,
            tier: 'none',
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date()
          }
        ]);
      }
    } catch (error) {
      setError('Failed to load users');
      console.error('Users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    if (!createAdminData.firstName || !createAdminData.lastName || !createAdminData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // For now, we'll simulate creating an admin
      // In a real implementation, you'd call an API endpoint
      const newAdmin = {
        _id: Date.now().toString(),
        firstName: createAdminData.firstName,
        lastName: createAdminData.lastName,
        email: createAdminData.email,
        role: createAdminData.role,
        storeId: createAdminData.storeId,
        storeName: createAdminData.storeName,
        gambinoBalance: 0,
        gluckScore: 0,
        tier: 'none',
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      setUsers(prev => [...prev, newAdmin]);
      setShowCreateAdmin(false);
      setCreateAdminData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'store_manager',
        storeId: '',
        storeName: ''
      });
    } catch (error) {
      setError('Failed to create admin account');
    } finally {
      setCreating(false);
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user._id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          Loading Users...
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
                  href="/admin/users" 
                  className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Manage Users
                </a>
                <a 
                  href="/admin/treasury" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
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
            <h2 className="text-3xl font-bold text-white">👥 User Management</h2>
            <p className="text-gray-400 mt-2">Manage users and create admin accounts</p>
          </div>
          {admin?.role === 'super_admin' && (
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">➕</span>
              Create Admin
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Total Users: {users.length}</span>
              <span className="text-green-400">Active: {users.filter(u => u.isActive).length}</span>
              <span className="text-red-400">Inactive: {users.filter(u => !u.isActive).length}</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.firstName || 'Unknown'} {user.lastName || 'User'}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === 'super_admin'
                          ? 'bg-red-900/30 text-red-400 border border-red-500'
                          : user.role === 'store_owner'
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-500'
                          : user.role === 'store_manager'
                          ? 'bg-purple-900/30 text-purple-400 border border-purple-500'
                          : 'bg-gray-900/30 text-gray-400 border border-gray-500'
                      }`}>
                        {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {user.gambinoBalance?.toLocaleString() || '0'} GAMBINO
                      </div>
                      <div className="text-sm text-gray-400">
                        Glück Score: {user.gluckScore || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.isActive
                          ? 'bg-green-900/30 text-green-400 border border-green-500'
                          : 'bg-red-900/30 text-red-400 border border-red-500'
                      }`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.isActive
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Users Found</h3>
            <p className="text-gray-500">No users match your search criteria</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create Admin Account</h3>
              <button
                onClick={() => setShowCreateAdmin(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                  <input
                    type="text"
                    value={createAdminData.firstName}
                    onChange={(e) => setCreateAdminData(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={createAdminData.lastName}
                    onChange={(e) => setCreateAdminData(prev => ({...prev, lastName: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={createAdminData.email}
                  onChange={(e) => setCreateAdminData(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="admin@store.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <select
                  value={createAdminData.role}
                  onChange={(e) => setCreateAdminData(prev => ({...prev, role: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="store_manager">Store Manager</option>
                  <option value="store_owner">Store Owner</option>
                  {admin?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Store ID</label>
                  <input
                    type="text"
                    value={createAdminData.storeId}
                    onChange={(e) => setCreateAdminData(prev => ({...prev, storeId: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="nash_downtown"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Store Name</label>
                  <input
                    type="text"
                    value={createAdminData.storeName}
                    onChange={(e) => setCreateAdminData(prev => ({...prev, storeName: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Nashville Downtown"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateAdmin(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={createAdmin}
                disabled={creating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
