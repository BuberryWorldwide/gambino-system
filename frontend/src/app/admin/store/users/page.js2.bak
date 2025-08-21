'use client'
import { useState, useEffect } from 'react';

export default function StoreUsersPage() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !adminData) {
      window.location.href = '/admin';
      return;
    }

    const parsedAdmin = JSON.parse(adminData);
    setAdmin(parsedAdmin);
    
    // Redirect super admins to the main users page
    if (parsedAdmin.role === 'super_admin') {
      window.location.href = '/admin/users';
      return;
    }

    // Only store owners and managers can access this page
    if (parsedAdmin.role !== 'store_owner' && parsedAdmin.role !== 'store_manager') {
      window.location.href = '/admin';
      return;
    }

    fetchStoreUsers(parsedAdmin);
  }, [currentPage, searchTerm, statusFilter]);

  const fetchStoreUsers = async (adminData) => {
    try {
      // For now, mock store-specific users
      // In production, this would call /api/admin/store-users
      const storeUsers = [
        {
          _id: '1',
          email: 'customer1@elevated.com',
          firstName: 'John',
          lastName: 'Customer',
          role: 'user',
          gambinoBalance: 45000,
          gluckScore: 120,
          tier: 'gold',
          isActive: true,
          createdAt: new Date('2024-06-15'),
          lastVisit: new Date('2025-08-19'),
          favoriteLocation: adminData.storeId
        },
        {
          _id: '2',
          email: 'player2@elevated.com',
          firstName: 'Sarah',
          lastName: 'Player',
          role: 'user',
          gambinoBalance: 23000,
          gluckScore: 85,
          tier: 'silver',
          isActive: true,
          createdAt: new Date('2024-07-20'),
          lastVisit: new Date('2025-08-18'),
          favoriteLocation: adminData.storeId
        },
        {
          _id: '3',
          email: 'vip@elevated.com',
          firstName: 'High',
          lastName: 'Roller',
          role: 'user',
          gambinoBalance: 156000,
          gluckScore: 450,
          tier: 'platinum',
          isActive: true,
          createdAt: new Date('2024-05-10'),
          lastVisit: new Date('2025-08-20'),
          favoriteLocation: adminData.storeId
        },
        {
          _id: '4',
          email: 'regular@elevated.com',
          firstName: 'Regular',
          lastName: 'Customer',
          role: 'user',
          gambinoBalance: 8500,
          gluckScore: 35,
          tier: 'bronze',
          isActive: true,
          createdAt: new Date('2024-08-01'),
          lastVisit: new Date('2025-08-17'),
          favoriteLocation: adminData.storeId
        },
        {
          _id: '5',
          email: 'inactive@elevated.com',
          firstName: 'Inactive',
          lastName: 'User',
          role: 'user',
          gambinoBalance: 1200,
          gluckScore: 5,
          tier: 'bronze',
          isActive: false,
          createdAt: new Date('2024-04-15'),
          lastVisit: new Date('2025-06-30'),
          favoriteLocation: adminData.storeId
        }
      ];

      // Filter based on admin's store
      const filteredUsers = storeUsers.filter(user => 
        user.favoriteLocation === adminData.storeId
      );

      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
    } catch (error) {
      console.error('Failed to fetch store users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      // Mock API call - in production this would call the backend
      setUsers(prev => prev.map(user =>
        user._id === userId
          ? { ...user, isActive: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
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
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!admin || (admin.role !== 'store_owner' && admin.role !== 'store_manager')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to view store users.</p>
        </div>
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
                  href="/admin/store/users"
                  className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Store Users
                </a>
                <a
                  href="/admin/store/machines"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Machines
                </a>
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

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Store Info Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">🏪 Store User Management</h2>
              <p className="text-blue-200 mt-1">
                Managing users for: <span className="font-semibold">{admin.storeName || admin.storeId}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{filteredUsers.length}</div>
              <div className="text-blue-200 text-sm">Store Customers</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-gray-400 text-sm">Total Customers</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{users.filter(u => u.isActive).length}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{users.filter(u => !u.isActive).length}</div>
            <div className="text-gray-400 text-sm">Inactive</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {users.reduce((sum, u) => sum + (u.gambinoBalance || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total GAMBINO</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search Customers
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Store Customers</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    GAMBINO Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tier / Glück
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No customers found for this store
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-mono">
                          {user.gambinoBalance?.toLocaleString() || '0'} GAMBINO
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {user.tier || 'Basic'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Glück: {user.gluckScore || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-900/30 text-green-400 border border-green-500' 
                            : 'bg-red-900/30 text-red-400 border border-red-500'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.lastVisit ? new Date(user.lastVisit).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {admin.role === 'store_owner' && (
                            <button
                              onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                user.isActive
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {user.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 text-white px-3 py-1 rounded text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 text-white px-3 py-1 rounded text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
