import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdDateRange,
  MdPerson,
  MdAccessTime,
  MdInfo,
  MdWarning,
  MdError,
  MdDownload,
  MdDelete,
} from 'react-icons/md';

const SystemLogs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for logs
  const logs = [
    {
      id: 1,
      timestamp: '2025-09-29T08:30:00',
      level: 'info',
      module: 'student',
      action: 'Student enrollment',
      description: 'New student Juan Dela Cruz enrolled in Bartending NC II',
      user: 'admin@smi.edu.ph',
      userType: 'admin',
      ipAddress: '192.168.1.100',
    },
    {
      id: 2,
      timestamp: '2025-09-29T09:15:00',
      level: 'warning',
      module: 'assessment',
      action: 'Assessment submission',
      description: 'Late assessment submission for Food and Beverage NC II',
      user: 'instructor1@smi.edu.ph',
      userType: 'staff',
      ipAddress: '192.168.1.101',
    },
    {
      id: 3,
      timestamp: '2025-09-29T10:00:00',
      level: 'error',
      module: 'inventory',
      action: 'Stock update failed',
      description: 'Failed to update inventory stock level for Kitchen Equipment',
      user: 'staff2@smi.edu.ph',
      userType: 'staff',
      ipAddress: '192.168.1.102',
    },
    {
      id: 4,
      timestamp: '2025-09-29T11:30:00',
      level: 'info',
      module: 'attendance',
      action: 'Attendance recorded',
      description: 'Batch attendance recorded for Cookery NC II morning session',
      user: 'instructor3@smi.edu.ph',
      userType: 'staff',
      ipAddress: '192.168.1.103',
    },
  ];

  const modules = [
    { id: 'student', name: 'Student Management' },
    { id: 'assessment', name: 'Assessments' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'certification', name: 'Certification' },
    { id: 'finance', name: 'Finance' },
    { id: 'user', name: 'User Management' },
    { id: 'system', name: 'System' },
  ];

  const users = [
    { id: 'admin@smi.edu.ph', name: 'System Admin' },
    { id: 'instructor1@smi.edu.ph', name: 'John Instructor' },
    { id: 'staff2@smi.edu.ph', name: 'Mary Staff' },
    { id: 'instructor3@smi.edu.ph', name: 'Peter Instructor' },
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting logs...');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      console.log('Clearing logs...');
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info':
        return <MdInfo className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <MdWarning className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <MdError className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">System Logs</h1>
                <p className="text-sm text-gray-500">Monitor all system activities and events</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Export Logs
              </button>
              <button
                onClick={handleClearLogs}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <MdDelete className="h-5 w-5 mr-2" />
                Clear Logs
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              {/* Filter Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <MdFilterList className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-base font-medium text-gray-900">Filter Logs</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Top Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Log Level Filter */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <MdInfo className="h-4 w-4 text-gray-400" />
                        <span>Log Level</span>
                      </div>
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  {/* Module Filter */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <MdFilterList className="h-4 w-4 text-gray-400" />
                        <span>Module</span>
                      </div>
                    </label>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Modules</option>
                      {modules.map(module => (
                        <option key={module.id} value={module.id}>{module.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* User Filter */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <MdPerson className="h-4 w-4 text-gray-400" />
                        <span>User</span>
                      </div>
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Range and Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Range */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <MdDateRange className="h-4 w-4 text-gray-400" />
                        <span>Date Range</span>
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Start Date"
                        />
                        <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">From</span>
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="End Date"
                        />
                        <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">To</span>
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <MdSearch className="h-4 w-4 text-gray-400" />
                          <span>Search</span>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in logs..."
                          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdSearch className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-7">
                      <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300"
                      >
                        <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <MdAccessTime className="h-5 w-5 mr-2 text-gray-400" />
                            {formatDate(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelStyle(log.level)}`}>
                            {getLevelIcon(log.level)}
                            <span className="ml-1 capitalize">{log.level}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {log.module}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MdPerson className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemLogs;
