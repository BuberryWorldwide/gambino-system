'use client'
import { useState } from 'react';

export default function AdminPage() {
  const [email, setEmail] = useState('admin@gambino.com');
  const [password, setPassword] = useState('admin123');
  const [token, setToken] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const response = await fetch('http://192.168.1.235:3001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        loadStats(data.token);
        loadUsers(data.token);
        setError('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    }
  };

  const loadStats = async (authToken) => {
    try {
      const response = await fetch('http://192.168.1.235:3001/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async (authToken) => {
    try {
      const response = await fetch('http://192.168.1.235:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg w-96">
          <h1 className="text-2xl font-bold text-yellow-500 mb-6">🎲 Gambino Admin</h1>
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded"
            />
            <button
              onClick={login}
              className="w-full p-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-500">🎲 Gambino Admin Dashboard</h1>
        <button 
          onClick={() => setToken('')}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
      
      {stats && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-yellow-500 font-bold">Total Users</h3>
            <p className="text-2xl">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-yellow-500 font-bold">Total Transactions</h3>
            <p className="text-2xl">{stats.totalTransactions || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-yellow-500 font-bold">Current Price</h3>
            <p className="text-2xl">${stats.currentPrice || 0.001}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-yellow-500 font-bold">Jackpots Today</h3>
            <p className="text-2xl">{stats.jackpotsHitToday || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">Recent Users</h2>
        {users.length > 0 ? (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id} className="bg-gray-700 p-4 rounded flex justify-between">
                <div>
                  <p className="font-semibold">{user.email}</p>
                  <p className="text-gray-400">Balance: {user.gambinoBalance} GAMBINO</p>
                  <p className="text-gray-400">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-500">Glück: {user.gluckScore}</p>
                  <p className="text-gray-400">Tier: {user.tier}</p>
                  <p className="text-gray-400">Jackpots: {user.totalJackpots}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No users found</p>
        )}
      </div>
    </div>
  );
}
