import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdPrint,
  MdRefresh,
  MdWarning,
  MdInventory,
  MdLocalShipping,
  MdTrendingUp,
  MdShoppingCart,
  MdHistory,
} from 'react-icons/md';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';

const InventoryUsage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('usage');

  // Mock data for categories
  const categories = [
    { id: 'training-equipment', name: 'Training Equipment' },
    { id: 'bartending-supplies', name: 'Bartending Supplies' },
    { id: 'kitchen-tools', name: 'Kitchen Tools & Equipment' },
    { id: 'housekeeping-materials', name: 'Housekeeping Materials' },
    { id: 'consumable-supplies', name: 'Consumable Supplies' },
    { id: 'safety-equipment', name: 'Safety Equipment' },
    { id: 'learning-materials', name: 'Learning Materials' },
    { id: 'maintenance-tools', name: 'Maintenance Tools' }
  ];

  // Mock data for inventory summary
  const inventorySummary = {
    totalItems: 856,
    lowStock: 23,
    totalValue: 245000,
    monthlyUsage: 156,
  };

  // Mock data for monthly usage trend
  const monthlyUsageTrend = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
      label: 'Monthly Usage',
      data: [145, 162, 155, 148, 142, 156],
      tension: 0.4,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      fill: true,
    }]
  };

  // Mock data for category usage
  const categoryUsage = {
    labels: categories.map(c => c.name),
    datasets: [{
      label: 'Items Used',
      data: [45, 38, 32, 28, 25, 22],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  // Mock data for inventory items
  const inventoryItems = [
    {
      id: 1,
      name: 'Professional Cocktail Shaker Set',
      category: 'Bartending Supplies',
      totalQuantity: 50,
      inUse: 35,
      available: 15,
      status: 'Good Stock',
      program: 'Bartending NC II',
      condition: 'Good',
      lastMaintenance: '2025-09-15'
    },
    {
      id: 2,
      name: 'Commercial Chef Knife Set',
      category: 'Kitchen Tools & Equipment',
      totalQuantity: 30,
      inUse: 28,
      available: 2,
      status: 'Low Stock',
      program: 'Cookery NC II',
      condition: 'Good',
      lastMaintenance: '2025-09-20'
    },
    {
      id: 3,
      name: 'Industrial Vacuum Cleaner',
      category: 'Housekeeping Materials',
      totalQuantity: 15,
      inUse: 12,
      available: 3,
      status: 'Good Stock',
      program: 'Housekeeping NC II',
      condition: 'Needs Maintenance',
      lastMaintenance: '2025-08-15'
    },
    {
      id: 4,
      name: 'Safety Goggles',
      category: 'Safety Equipment',
      totalQuantity: 100,
      inUse: 75,
      available: 25,
      status: 'Good Stock',
      program: 'Multiple Programs',
      condition: 'Good',
      lastMaintenance: 'N/A'
    },
    {
      id: 5,
      name: 'Barista Training Manual',
      category: 'Learning Materials',
      totalQuantity: 40,
      inUse: 38,
      available: 2,
      status: 'Low Stock',
      program: 'Barista Training NC II',
      condition: 'Good',
      lastMaintenance: 'N/A'
    },
    {
      id: 6,
      name: 'Commercial Coffee Machine',
      category: 'Training Equipment',
      totalQuantity: 5,
      inUse: 4,
      available: 1,
      status: 'Good Stock',
      program: 'Barista Training NC II',
      condition: 'Excellent',
      lastMaintenance: '2025-09-10'
    }
  ];

  const handleExport = (format) => {
    console.log('Exporting in format:', format);
  };

  const handlePrint = () => {
    console.log('Printing inventory report');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
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
                <h1 className="text-2xl font-semibold text-gray-900">Inventory Usage</h1>
                <p className="text-sm text-gray-500">Track and manage inventory consumption</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export Report
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdPrint className="h-5 w-5 mr-2" />
                Print Report
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <MdInventory className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">{inventorySummary.totalItems}</p>
                      <p className="text-sm font-medium text-blue-600">Total Items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <MdWarning className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">{inventorySummary.lowStock}</p>
                      <p className="text-sm font-medium text-red-600">Low Stock Items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <MdShoppingCart className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(inventorySummary.totalValue)}</p>
                      <p className="text-sm font-medium text-green-600">Total Value</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <MdLocalShipping className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">{inventorySummary.monthlyUsage}</p>
                      <p className="text-sm font-medium text-amber-600">Monthly Usage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-3-months">Last 3 Months</option>
                    <option value="all-time">All Time</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="usage">Sort by Usage</option>
                    <option value="name">Sort by Name</option>
                    <option value="stock">Sort by Stock Level</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search inventory..."
                      className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage Trend</h3>
                <div className="h-[300px]">
                  <Line
                    data={monthlyUsageTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0,0,0,0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Category</h3>
                <div className="h-[300px]">
                  <Bar
                    data={categoryUsage}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0,0,0,0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        In Use
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Maintenance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.totalQuantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.inUse}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.available}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.program}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.condition === 'Good' || item.condition === 'Excellent'
                              ? 'bg-green-100 text-green-800'
                              : item.condition === 'Needs Maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.lastMaintenance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Good Stock' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {inventoryItems.length} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MdFileDownload className="h-4 w-4 mr-1.5" />
                      Export List
                    </button>
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MdPrint className="h-4 w-4 mr-1.5" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryUsage;
