'use client'
import { useState, useEffect } from 'react';

export default function StoreMachinesPage() {
  const [admin, setAdmin] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [newMachine, setNewMachine] = useState({
    serialNumber: '',
    gameType: 'NCG Skills 1',
    location: '',
    status: 'active'
  });

  const gameTypes = [
    'NCG Skills 1', 'NCG Skills 2', 'NCG Skills 3', 'NCG Skills 4', 'NCG Skills 5',
    'FireLink', 'Superior Skills 1', 'Superior Skills 2', 'Superior Skills 3'
  ];

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !adminData) {
      window.location.href = '/admin';
      return;
    }

    const parsedAdmin = JSON.parse(adminData);
    setAdmin(parsedAdmin);
    
    // Only store owners and managers can access this page
    if (parsedAdmin.role !== 'store_owner' && parsedAdmin.role !== 'store_manager') {
      window.location.href = '/admin';
      return;
    }

    loadStoreMachines(parsedAdmin);
  }, []);

  const loadStoreMachines = async (adminData) => {
    try {
      // Mock machine data for the store
      const storeMachines = [
        {
          id: 'GB001',
          serialNumber: 'GMB-ELV-001',
          gameType: 'NCG Skills 1',
          location: 'Front Counter',
          status: 'active',
          lastPayout: new Date('2025-08-19'),
          totalPlayed: 15420,
          totalPayout: 8950,
          dailyRevenue: 125.50,
          weeklyRevenue: 890.75,
          monthlyRevenue: 3456.80,
          jackpotPool: 2500,
          minorJackpots: 45,
          majorJackpots: 3,
          lastMaintenance: new Date('2025-08-10'),
          nextMaintenance: new Date('2025-09-10'),
          firmwareVersion: '2.1.4',
          connectionStatus: 'online',
          storeId: adminData.storeId
        },
        {
          id: 'GB002',
          serialNumber: 'GMB-ELV-002',
          gameType: 'FireLink',
          location: 'Back Gaming Area',
          status: 'active',
          lastPayout: new Date('2025-08-20'),
          totalPlayed: 12890,
          totalPayout: 7234,
          dailyRevenue: 98.30,
          weeklyRevenue: 675.20,
          monthlyRevenue: 2890.45,
          jackpotPool: 1875,
          minorJackpots: 38,
          majorJackpots: 2,
          lastMaintenance: new Date('2025-08-05'),
          nextMaintenance: new Date('2025-09-05'),
          firmwareVersion: '2.1.4',
          connectionStatus: 'online',
          storeId: adminData.storeId
        },
        {
          id: 'GB003',
          serialNumber: 'GMB-ELV-003',
          gameType: 'Superior Skills 1',
          location: 'VIP Section',
          status: 'maintenance',
          lastPayout: new Date('2025-08-18'),
          totalPlayed: 9876,
          totalPayout: 5432,
          dailyRevenue: 0,
          weeklyRevenue: 456.75,
          monthlyRevenue: 2134.60,
          jackpotPool: 3200,
          minorJackpots: 28,
          majorJackpots: 4,
          lastMaintenance: new Date('2025-08-20'),
          nextMaintenance: new Date('2025-08-25'),
          firmwareVersion: '2.1.3',
          connectionStatus: 'offline',
          storeId: adminData.storeId
        }
      ];

      setMachines(storeMachines);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    try {
      const machine = {
        id: `GB${String(machines.length + 1).padStart(3, '0')}`,
        serialNumber: newMachine.serialNumber,
        gameType: newMachine.gameType,
        location: newMachine.location,
        status: newMachine.status,
        lastPayout: null,
        totalPlayed: 0,
        totalPayout: 0,
        dailyRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        jackpotPool: 1000,
        minorJackpots: 0,
        majorJackpots: 0,
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        firmwareVersion: '2.1.4',
        connectionStatus: 'pending',
        storeId: admin.storeId
      };

      setMachines(prev => [...prev, machine]);
      setShowAddMachine(false);
      setNewMachine({
        serialNumber: '',
        gameType: 'NCG Skills 1',
        location: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to add machine:', error);
    }
  };

  const toggleMachineStatus = (machineId) => {
    setMachines(prev => prev.map(machine =>
      machine.id === machineId
        ? { 
            ...machine, 
            status: machine.status === 'active' ? 'inactive' : 'active',
            connectionStatus: machine.status === 'active' ? 'offline' : 'online'
          }
        : machine
    ));
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  // Calculate totals
  const totals = machines.reduce((acc, machine) => ({
    revenue: acc.revenue + machine.monthlyRevenue,
    played: acc.played + machine.totalPlayed,
    payout: acc.payout + machine.totalPayout,
    jackpotPool: acc.jackpotPool + machine.jackpotPool,
    minorJackpots: acc.minorJackpots + machine.minorJackpots,
    majorJackpots: acc.majorJackpots + machine.majorJackpots
  }), { revenue: 0, played: 0, payout: 0, jackpotPool: 0, minorJackpots: 0, majorJackpots: 0 });

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
                <a href="/admin/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </a>
                <a href="/admin/store/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Store Users
                </a>
                <a href="/admin/store/machines" className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium">
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
              onClick={() => setShowAddMachine(true)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <span className="mr-2">➕</span>
              Add Machine
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-200 font-semibold text-sm uppercase">Total Machines</h3>
                <p className="text-3xl font-bold text-white mt-2">{machines.length}</p>
                <p className="text-blue-300 text-sm">
                  {machines.filter(m => m.status === 'active').length} Active • {machines.filter(m => m.status !== 'active').length} Offline
                </p>
              </div>
              <div className="text-4xl">🎰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-200 font-semibold text-sm uppercase">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-white mt-2">${totals.revenue.toLocaleString()}</p>
                <p className="text-green-300 text-sm">Profit Margin: {((totals.revenue - totals.payout) / totals.revenue * 100).toFixed(1)}%</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-yellow-200 font-semibold text-sm uppercase">Total Jackpot Pool</h3>
                <p className="text-3xl font-bold text-white mt-2">${totals.jackpotPool.toLocaleString()}</p>
                <p className="text-yellow-300 text-sm">
                  {totals.majorJackpots} Major • {totals.minorJackpots} Minor
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-200 font-semibold text-sm uppercase">Total Plays</h3>
                <p className="text-3xl font-bold text-white mt-2">{totals.played.toLocaleString()}</p>
                <p className="text-purple-300 text-sm">Payout: ${totals.payout.toLocaleString()}</p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
          </div>
        </div>

        {/* Machines Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Store Machines</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Jackpots
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white flex items-center">
                          <span className="mr-2">🎰</span>
                          {machine.gameType}
                        </div>
                        <div className="text-sm text-gray-400">{machine.serialNumber}</div>
                        <div className="text-sm text-gray-500">{machine.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">Monthly: ${machine.monthlyRevenue.toFixed(2)}</div>
                        <div className="text-gray-400">Plays: {machine.totalPlayed.toLocaleString()}</div>
                        <div className="text-gray-400">Payout: ${machine.totalPayout.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-yellow-400">Pool: ${machine.jackpotPool.toLocaleString()}</div>
                        <div className="text-green-400">Major: {machine.majorJackpots}</div>
                        <div className="text-blue-400">Minor: {machine.minorJackpots}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          machine.status === 'active'
                            ? 'bg-green-900/30 text-green-400 border border-green-500'
                            : machine.status === 'maintenance'
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500'
                            : 'bg-red-900/30 text-red-400 border border-red-500'
                        }`}>
                          {machine.status.toUpperCase()}
                        </span>
                        <div className={`text-xs ${
                          machine.connectionStatus === 'online' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {machine.connectionStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-white">Last: {machine.lastMaintenance.toLocaleDateString()}</div>
                        <div className={`${
                          new Date(machine.nextMaintenance) < new Date() ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          Next: {machine.nextMaintenance.toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 text-xs">v{machine.firmwareVersion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleMachineStatus(machine.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          machine.status === 'active'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {machine.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => setSelectedMachine(machine)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎰</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Machines Found</h3>
            <p className="text-gray-500">Add your first machine to get started</p>
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      {showAddMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Machine</h3>
              <button
                onClick={() => setShowAddMachine(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={newMachine.serialNumber}
                  onChange={(e) => setNewMachine(prev => ({...prev, serialNumber: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GMB-STR-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Game Type</label>
                <select
                  value={newMachine.gameType}
                  onChange={(e) => setNewMachine(prev => ({...prev, gameType: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {gameTypes.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location in Store</label>
                <input
                  type="text"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine(prev => ({...prev, location: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Front Counter, Back Area, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Initial Status</label>
                <select
                  value={newMachine.status}
                  onChange={(e) => setNewMachine(prev => ({...prev, status: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMachine(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMachine}
                disabled={!newMachine.serialNumber || !newMachine.location}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
              >
                Add Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machine Details Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Machine Details: {selectedMachine.gameType}</h3>
              <button
                onClick={() => setSelectedMachine(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Machine Info</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Serial:</span> <span className="text-white">{selectedMachine.serialNumber}</span></div>
                    <div><span className="text-gray-400">Location:</span> <span className="text-white">{selectedMachine.location}</span></div>
                    <div><span className="text-gray-400">Firmware:</span> <span className="text-white">v{selectedMachine.firmwareVersion}</span></div>
                    <div><span className="text-gray-400">Connection:</span> 
                      <span className={selectedMachine.connectionStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                        {selectedMachine.connectionStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Total Plays:</span> <span className="text-white">{selectedMachine.totalPlayed.toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Total Payout:</span> <span className="text-white">${selectedMachine.totalPayout.toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Daily Revenue:</span> <span className="text-green-400">${selectedMachine.dailyRevenue.toFixed(2)}</span></div>
                    <div><span className="text-gray-400">Weekly Revenue:</span> <span className="text-green-400">${selectedMachine.weeklyRevenue.toFixed(2)}</span></div>
                    <div><span className="text-gray-400">Monthly Revenue:</span> <span className="text-green-400">${selectedMachine.monthlyRevenue.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Jackpot Data</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Current Pool:</span> <span className="text-yellow-400">${selectedMachine.jackpotPool.toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Major Jackpots:</span> <span className="text-green-400">{selectedMachine.majorJackpots}</span></div>
                    <div><span className="text-gray-400">Minor Jackpots:</span> <span className="text-blue-400">{selectedMachine.minorJackpots}</span></div>
                    <div><span className="text-gray-400">Last Payout:</span> <span className="text-white">{selectedMachine.lastPayout?.toLocaleDateString() || 'None'}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Maintenance</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Last Service:</span> <span className="text-white">{selectedMachine.lastMaintenance.toLocaleDateString()}</span></div>
                    <div><span className="text-gray-400">Next Service:</span> 
                      <span className={new Date(selectedMachine.nextMaintenance) < new Date() ? 'text-red-400' : 'text-white'}>
                        {selectedMachine.nextMaintenance.toLocaleDateString()}
                      </span>
                    </div>
                    <div><span className="text-gray-400">Status:</span> 
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedMachine.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        selectedMachine.status === 'maintenance' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {selectedMachine.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedMachine(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Edit Settings
              </button>
              <button 
                onClick={() => toggleMachineStatus(selectedMachine.id)}
                className={`px-4 py-2 rounded text-white ${
                  selectedMachine.status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedMachine.status === 'active' ? 'Disable Machine' : 'Enable Machine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
