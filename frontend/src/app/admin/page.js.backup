'use client'
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (adminToken && adminData) {
      setToken(adminToken);
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

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
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-yellow-500">🎲 Gambino Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {admin.name} ({admin.role})
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
        <h2 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h2>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Welcome, {admin.name}!</h3>
          <p className="text-gray-300">
            You are logged in as: <span className="text-yellow-400">{admin.role}</span>
          </p>
          <p className="text-gray-300 mt-2">
            Email: <span className="text-gray-400">{admin.email}</span>
          </p>
          
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">Quick Actions</h4>
            <div className="space-x-4">
              <a 
                href="/admin/settings" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Settings
              </a>
              <a 
                href="/admin/treasury" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Treasury
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
