import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../layouts/admin/Sidebar';
import { getAdminToken } from '../../utils/adminAuth';
import { 
  MdMenu,
  MdSearch,
  MdDownload,
  MdRefresh,
  MdArrowUpward,
  MdArrowDownward,
  MdSwapHoriz,
  MdClose,
  MdInventory,
  MdCalendarToday,
  MdPerson,
  MdDescription,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdCheckCircle,
  MdError
} from 'react-icons/md';

const AdminStockTransactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    stockIn: 0,
    stockOut: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [searchTerm, transactionTypeFilter, categoryFilter, dateFilter, sortBy]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (transactionTypeFilter !== 'all') params.append('type', transactionTypeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (dateFilter !== 'all') params.append('date_filter', dateFilter);
      if (sortBy) params.append('sort_by', sortBy);
      
      const response = await fetch(`https://api.smitracked.cloud/api/staff/equipment/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.data || []);
          setStats(data.stats || {
            totalTransactions: 0,
            stockIn: 0,
            stockOut: 0,
            totalValue: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMessage('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('https://api.smitracked.cloud/api/staff/equipment/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getTransactionTypeBadge = (type) => {
    const typeConfig = {
      in: {
        className: 'bg-green-100 text-green-800',
        icon: <MdArrowDownward className="h-3.5 w-3.5" />,
        label: 'Stock In'
      },
      out: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdArrowUpward className="h-3.5 w-3.5" />,
        label: 'Stock Out'
      }
    };

    const config = typeConfig[type] || typeConfig.in;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const handleExport = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Transaction Code',
        'Date',
        'Time',
        'Type',
        'Equipment Name',
        'Equipment Code',
        'Brand',
        'Model',
        'Category',
        'Quantity',
        'Unit Price',
        'Total Amount',
        'Batch',
        'Requested By',
        'Purpose',
        'Status'
      ];

      // Prepare CSV rows
      const rows = transactions.map(transaction => [
        transaction.transactionCode || '',
        transaction.date || '',
        transaction.time || '',
        transaction.type === 'in' ? 'Stock In' : 'Stock Out',
        transaction.itemName || '',
        transaction.equipmentCode || '',
        transaction.brand || '',
        transaction.model || '',
        transaction.category || '',
        transaction.quantity || '',
        transaction.unitPrice || '',
        transaction.totalAmount || '',
        transaction.batch || '',
        transaction.requestedBy || '',
        transaction.purpose || '',
        transaction.status || ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `stock_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setErrorMessage('Failed to export transactions');
    }
  };

  const filteredTransactions = transactions;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Stock Transactions</h1>
                <p className="text-sm text-blue-100">Track equipment stock in and stock out transactions</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdSwapHoriz className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdArrowUpward className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Stock Out</p>
                  <p className="text-xl font-bold text-blue-600">{stats.stockOut}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdArrowDownward className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Stock In</p>
                  <p className="text-xl font-bold text-green-600">{stats.stockIn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Types</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Program</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">Amount (High to Low)</option>
                  <option value="amount_low">Amount (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleExport}
                  className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <MdDownload className="h-5 w-5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <MdRefresh className="h-8 w-8 animate-spin mx-auto mb-2 text-tracked-primary" />
                        <p>Loading transactions...</p>
                      </td>
                    </tr>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.transactionCode}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MdCalendarToday className="h-3 w-3" />
                            {transaction.date} {transaction.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.itemName}</div>
                          <div className="text-xs text-gray-500">{transaction.equipmentCode}</div>
                          <div className="text-xs text-gray-500">{transaction.brand} - {transaction.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTransactionTypeBadge(transaction.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.quantity} {transaction.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.batch || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MdPerson className="h-4 w-4 text-gray-400" />
                            {transaction.requestedBy}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-tracked-primary">
                            {formatCurrency(transaction.totalAmount)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-green-50 border border-green-200">
            <MdCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="ml-2 text-green-600 hover:text-green-800">
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-red-50 border border-red-200">
            <MdError className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="ml-2 text-red-600 hover:text-red-800">
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStockTransactions;
