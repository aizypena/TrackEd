import React, { useState, useEffect } from 'react';
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
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

const SystemLogs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1,
  });
  
  const adminToken = sessionStorage.getItem('adminToken');

  // Fetch logs from API
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        per_page: 50,
      });

      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedModule !== 'all') params.append('action', selectedModule);
      if (selectedUser !== 'all') params.append('user_id', selectedUser);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`http://localhost:8000/api/admin/system-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
      } else {
        toast.error('Failed to fetch system logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Error loading system logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on component mount and when filters change
  useEffect(() => {
    if (adminToken) {
      fetchLogs();
    }
  }, [selectedLevel, selectedModule, selectedUser, dateRange, adminToken]);

  // Mock data for modules (actions) - you can update this based on actual actions
  const modules = [
    { id: 'login', name: 'Login Activities' },
    { id: 'logout', name: 'Logout Activities' },
    { id: 'admin', name: 'Admin Actions' },
    { id: 'trainer', name: 'Trainer Actions' },
    { id: 'staff', name: 'Staff Actions' },
    { id: 'student', name: 'Student Actions' },
  ];

  const users = [];

  const handleRefresh = () => {
    fetchLogs(pagination.current_page || 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1); // Search from first page
  };

  const handleExport = () => {
    toast.success('Exporting logs...');
    // Export functionality here
  };

  const handleClearLogs = () => {
    toast.success('Logs cleared successfully');
    // Clear logs functionality here
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchLogs(newPage);
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

  const formatAction = (action) => {
    if (!action) return 'N/A';
    
    // Replace underscores with spaces and capitalize each word
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
          <div className="max-w-full mx-auto px-4">
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
                      <form onSubmit={handleSearch}>
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
                      </form>
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
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Role
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
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <MdRefresh className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            <p>Loading logs...</p>
                          </div>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <MdInfo className="h-8 w-8 text-gray-400 mb-2" />
                            <p>No logs found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <MdAccessTime className="h-5 w-5 mr-2 text-gray-400" />
                              {formatDate(log.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelStyle(log.log_level)}`}>
                              {getLevelIcon(log.log_level)}
                              <span className="ml-1 capitalize">{log.log_level}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatAction(log.action)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {log.user?.role || 'System'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <MdPerson className="h-5 w-5 mr-2 text-gray-400" />
                              <span>{log.user?.email || 'System'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip_address || 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {!loading && logs.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">
                            {((pagination.current_page - 1) * pagination.per_page) + 1}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <MdChevronLeft className="h-5 w-5" />
                          </button>
                          {[...Array(pagination.last_page)].map((_, idx) => {
                            const page = idx + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === pagination.last_page ||
                              (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.current_page
                                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === pagination.current_page - 2 ||
                              page === pagination.current_page + 2
                            ) {
                              return (
                                <span
                                  key={page}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                          <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <MdChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default SystemLogs;
