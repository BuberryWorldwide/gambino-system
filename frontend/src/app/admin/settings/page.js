'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!token || !adminData) {
      router.push('/admin');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    setLoading(false);
  }, [router]);

  const changePassword = async () => {
    setMessage('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://192.168.1.235:3001/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password: ' + error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
                  className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </a>
                {admin?.role === 'super_admin' && (
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
                )}
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Admin Settings</h2>
          <p className="text-gray-400 mt-2">Manage your admin account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">👤 Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <div className="text-white bg-gray-700 p-3 rounded-md">
                  {admin?.name || 'Admin User'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="text-white bg-gray-700 p-3 rounded-md">
                  {admin?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <div className="text-white bg-gray-700 p-3 rounded-md">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    admin?.role === 'super_admin' 
                      ? 'bg-red-900/20 text-red-400 border border-red-500'
                      : admin?.role === 'store_owner'
                      ? 'bg-blue-900/20 text-blue-400 border border-blue-500'
                      : 'bg-green-900/20 text-green-400 border border-green-500'
                  }`}>
                    {admin?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Admin ID</label>
                <div className="text-gray-300 bg-gray-700 p-3 rounded-md font-mono text-sm">
                  {admin?.id}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🔐 Change Password</h3>
            
            {message && (
              <div className="bg-green-900/20 border border-green-500 text-green-300 p-3 rounded mb-4">
                {message}
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-300 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="Confirm your new password"
                />
              </div>

              <button
                onClick={changePassword}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-md transition duration-200"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🛡️ Security Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-500 mb-2">Password Strength</h4>
              <p className="text-gray-300 text-sm">
                Always use strong passwords with at least 8 characters, including numbers and symbols.
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-blue-500 mb-2">Access Level</h4>
              <p className="text-gray-300 text-sm">
                Your {admin?.role} role determines what features and data you can access in the system.
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-green-500 mb-2">Session Security</h4>
              <p className="text-gray-300 text-sm">
                Always logout when finished and never share your admin credentials with others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
