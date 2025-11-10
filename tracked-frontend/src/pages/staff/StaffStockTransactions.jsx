import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdPrint,
  MdArrowUpward,
  MdArrowDownward,
  MdSwapHoriz,
  MdClose,
  MdInventory,
  MdCalendarToday,
  MdPerson,
  MdDescription,
  MdShoppingCart,
  MdAssignment,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList
} from 'react-icons/md';

const StaffStockTransactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [loading, setLoading] = useState(true);

  // Equipment transactions data - based on StaffEquipment.jsx structure
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      transactionCode: 'TXN-2025-001',
      date: '2025-11-10',
      time: '09:30 AM',
      type: 'in',
      itemName: 'Arc Welding Machine Lincoln Electric',
      equipmentCode: 'EQP-WLD-001',
      brand: 'Lincoln Electric',
      model: 'Power MIG 260',
      category: 'Welding NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop A',
      condition: 'excellent',
      unitPrice: 85000,
      totalAmount: 85000,
      supplier: 'Manila Industrial Equipment',
      requestedBy: 'Engr. Ramon Cruz',
      approvedBy: 'Director',
      purpose: 'New equipment acquisition for Welding NC II program expansion',
      referenceNumber: 'PO-2025-089',
      notes: 'Brand new with 2-year warranty, includes accessories and training manual',
      status: 'completed'
    },
    {
      id: 2,
      transactionCode: 'TXN-2025-002',
      date: '2025-11-10',
      time: '10:15 AM',
      type: 'out',
      itemName: 'Industrial Safety Helmet',
      equipmentCode: 'EQP-SAF-003',
      brand: '3M',
      model: 'Hard Hat H-700 Series',
      category: 'Construction Painting NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Storage Room',
      condition: 'good',
      unitPrice: 850,
      totalAmount: 850,
      requestedBy: 'Mr. Pedro Ramos',
      approvedBy: 'Admin Staff',
      purpose: 'Issued to Construction Painting NC II Batch 02-2025 for practical training',
      referenceNumber: 'ISU-2025-134',
      notes: 'Student Juan Dela Cruz signed equipment acknowledgment form',
      status: 'completed'
    },
    {
      id: 3,
      transactionCode: 'TXN-2025-003',
      date: '2025-11-09',
      time: '02:45 PM',
      type: 'in',
      itemName: 'Automotive Diagnostic Scanner',
      equipmentCode: 'EQP-AUTO-005',
      brand: 'Launch',
      model: 'X431 Pro Elite',
      category: 'Automotive Servicing NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop B',
      condition: 'excellent',
      unitPrice: 42000,
      totalAmount: 42000,
      supplier: 'Automotive Tools Philippines',
      requestedBy: 'Mr. Jose Santos',
      approvedBy: 'Director',
      purpose: 'Equipment upgrade for Automotive Servicing NC II diagnostics module',
      referenceNumber: 'PO-2025-091',
      notes: 'Latest model with OBD-II compatibility, includes software updates and technical support',
      status: 'completed'
    },
    {
      id: 4,
      transactionCode: 'TXN-2025-004',
      date: '2025-11-08',
      time: '11:00 AM',
      type: 'out',
      itemName: 'Digital Multimeter',
      equipmentCode: 'EQP-ELEC-012',
      brand: 'Fluke',
      model: '87V Industrial',
      category: 'Electronics NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop B',
      condition: 'good',
      unitPrice: 3500,
      totalAmount: 3500,
      requestedBy: 'Engr. Luis Garcia',
      approvedBy: 'Admin Staff',
      purpose: 'Issued to Electronics NC II Batch 03-2025 for circuit testing and troubleshooting module',
      referenceNumber: 'ISU-2025-138',
      notes: 'Equipment assigned to Workshop B, includes carrying case and test leads. Batch instructor responsible for care',
      status: 'completed'
    },
    {
      id: 5,
      transactionCode: 'TXN-2025-005',
      date: '2025-11-07',
      time: '03:20 PM',
      type: 'adjustment',
      itemName: 'Auto-Darkening Welding Helmet',
      equipmentCode: 'EQP-WLD-008',
      brand: 'Miller',
      model: 'Digital Elite',
      category: 'Welding NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop A',
      condition: 'good',
      unitPrice: 2800,
      totalAmount: 2800,
      requestedBy: 'Engr. Ramon Cruz',
      approvedBy: 'Admin Staff',
      purpose: 'Equipment returned from maintenance - status updated to available',
      referenceNumber: 'MNT-2025-012',
      notes: 'Auto-darkening lens replaced by certified technician, calibrated and tested, now available for use',
      status: 'completed'
    },,
    {
      id: 4,
      transactionCode: 'TXN-2025-004',
      date: '2025-10-05',
      time: '11:20 AM',
      type: 'out',
      itemName: 'PVC Pipes 1/2 inch',
      category: 'Plumbing Materials',
      quantity: 30,
      unit: 'meters',
      unitPrice: 125,
      totalAmount: 3750,
      requestedBy: 'Mr. Pedro Reyes',
      approvedBy: 'Admin Staff',
      purpose: 'Training materials for Plumbing NCII practical exam',
      referenceNumber: 'REQ-2025-135',
      notes: 'Used for pipe threading practice',
      status: 'completed'
    },
    {
      id: 5,
      transactionCode: 'TXN-2025-005',
      date: '2025-10-05',
      time: '09:00 AM',
      type: 'adjustment',
      itemName: 'Engine Oil 5W-30',
      category: 'Automotive Supplies',
      quantity: -5,
      unit: 'liters',
      unitPrice: 450,
      totalAmount: -2250,
      requestedBy: 'Mr. Jose Santos',
      approvedBy: 'Admin Staff',
      purpose: 'Inventory correction - damaged containers',
      referenceNumber: 'ADJ-2025-012',
      notes: 'Damaged during storage, disposed properly',
      status: 'completed'
    },
    {
      id: 6,
      transactionCode: 'TXN-2025-006',
      date: '2025-11-06',
      time: '09:00 AM',
      type: 'in',
      itemName: 'Commercial Double Deck Oven',
      equipmentCode: 'EQP-COOK-003',
      brand: 'Vulcan',
      model: 'VC4GD Double Deck',
      category: 'Cookery NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Training Kitchen',
      condition: 'excellent',
      unitPrice: 95000,
      totalAmount: 95000,
      supplier: 'Commercial Kitchen Solutions Inc.',
      requestedBy: 'Ms. Ana Lopez',
      approvedBy: 'Director',
      purpose: 'New equipment for Cookery NC II baking and pastry module expansion',
      referenceNumber: 'PO-2025-094',
      notes: 'Double deck gas-powered oven, professionally installed in Training Kitchen with safety certification',
      status: 'completed'
    },
    {
      id: 7,
      transactionCode: 'TXN-2025-007',
      date: '2025-11-05',
      time: '01:30 PM',
      type: 'out',
      itemName: 'MIG Welding Torch Assembly',
      equipmentCode: 'EQP-WLD-015',
      brand: 'Bernard',
      model: 'Q-Gun 300A',
      category: 'Welding NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop A',
      condition: 'good',
      unitPrice: 8500,
      totalAmount: 8500,
      requestedBy: 'Engr. Ramon Cruz',
      approvedBy: 'Admin Staff',
      purpose: 'Issued to Welding NC II Batch 01-2025 for MIG welding practical assessment',
      referenceNumber: 'ISU-2025-145',
      notes: 'Complete torch assembly with consumables. Equipment checkout form signed by instructor Engr. Ramon Cruz',
      status: 'completed'
    },
    {
      id: 8,
      transactionCode: 'TXN-2025-008',
      date: '2025-11-04',
      time: '10:45 AM',
      type: 'in',
      itemName: 'Digital Soldering Station',
      equipmentCode: 'EQP-ELEC-020',
      brand: 'Hakko',
      model: 'FX-888D',
      category: 'Electronics NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop B',
      condition: 'excellent',
      unitPrice: 12000,
      totalAmount: 12000,
      supplier: 'Electronics Supply Cebu',
      requestedBy: 'Engr. Luis Garcia',
      approvedBy: 'Director',
      purpose: 'New equipment for Electronics NC II surface mount technology training module',
      referenceNumber: 'PO-2025-097',
      notes: 'Digital temperature control (200-480°C), anti-static design, includes tips and accessories',
      status: 'completed'
    },
    {
      id: 9,
      transactionCode: 'TXN-2025-009',
      date: '2025-11-03',
      time: '03:15 PM',
      type: 'out',
      itemName: '2-Post Hydraulic Car Lift',
      equipmentCode: 'EQP-AUTO-002',
      brand: 'Rotary',
      model: 'SPO12 2-Post',
      category: 'Automotive Servicing NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Workshop A',
      condition: 'excellent',
      unitPrice: 125000,
      totalAmount: 125000,
      requestedBy: 'Mr. Jose Santos',
      approvedBy: 'Admin Staff',
      purpose: 'Permanently assigned to Workshop A for Automotive Servicing NC II vehicle undercarriage training',
      referenceNumber: 'ASG-2025-152',
      notes: '2-post asymmetric lift, 4-ton (8,000 lbs) capacity, safety lock certified, installed with floor anchors',
      status: 'completed'
    },
    {
      id: 10,
      transactionCode: 'TXN-2025-010',
      date: '2025-11-02',
      time: '11:30 AM',
      type: 'in',
      itemName: 'Commercial Planetary Food Mixer',
      equipmentCode: 'EQP-COOK-007',
      brand: 'Hobart',
      model: 'Legacy HL200',
      category: 'Cookery NC II',
      quantity: 1,
      unit: 'unit',
      location: 'Training Kitchen',
      condition: 'excellent',
      unitPrice: 38000,
      totalAmount: 38000,
      supplier: 'Kitchen Equipment Manila',
      requestedBy: 'Ms. Ana Lopez',
      approvedBy: 'Director',
      purpose: 'New equipment for Cookery NC II bread and pastry production module',
      referenceNumber: 'PO-2025-099',
      notes: '20-liter capacity planetary mixer with dough hook, wire whip, and flat beater attachments. Includes safety guard',
      status: 'completed'
    }
  ]);

  const categories = [
    'Welding NC II',
    'Automotive Servicing NC II',
    'Electronics NC II',
    'Cookery NC II',
    'Carpentry NC II',
    'Plumbing NC II',
    'Construction Painting NC II',
    'Electrical Installation NC II'
  ];

  const getTransactionTypeBadge = (type) => {
    const typeConfig = {
      in: {
        className: 'bg-green-100 text-green-800',
        icon: <MdArrowDownward className="h-4 w-4" />,
        label: 'Stock In'
      },
      out: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdArrowUpward className="h-4 w-4" />,
        label: 'Stock Out'
      },
      adjustment: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdSwapHoriz className="h-4 w-4" />,
        label: 'Adjustment'
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
    }).format(Math.abs(amount));
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = transactionTypeFilter === 'all' || transaction.type === transactionTypeFilter;
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const transactionDate = new Date(transaction.date);
        const today = new Date('2025-10-06');
        
        if (dateFilter === 'today') {
          matchesDate = transaction.date === '2025-10-06';
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = transactionDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = transactionDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
      } else if (sortBy === 'oldest') {
        return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
      } else if (sortBy === 'amount') {
        return Math.abs(b.totalAmount) - Math.abs(a.totalAmount);
      } else if (sortBy === 'item') {
        return a.itemName.localeCompare(b.itemName);
      }
      return 0;
    });

  const stats = {
    totalTransactions: transactions.length,
    stockIn: transactions.filter(t => t.type === 'in').length,
    stockOut: transactions.filter(t => t.type === 'out').length,
    totalValue: transactions.reduce((sum, t) => sum + (t.type === 'in' ? t.totalAmount : 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
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
                <p className="text-sm text-blue-100">Track inventory movements and transactions</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">New Transaction</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdInventory className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalTransactions}</p>
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
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdArrowUpward className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Stock Out</p>
                  <p className="text-xl font-bold text-purple-600">{stats.stockOut}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MdTrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Value In</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalValue)}</p>
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
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
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
                  <option value="amount">Amount (High to Low)</option>
                  <option value="item">Item Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <MdDownload className="h-5 w-5" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <MdPrint className="h-5 w-5" />
                Print
              </button>
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
                      Item & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.transactionCode}</div>
                          <div className="text-xs text-gray-500">{transaction.date} • {transaction.time}</div>
                          {transaction.referenceNumber && (
                            <div className="text-xs text-blue-600 mt-1">Ref: {transaction.referenceNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.itemName}</div>
                          <div className="text-xs text-blue-600">{transaction.equipmentCode}</div>
                          <div className="text-xs text-gray-500">{transaction.category}</div>
                          {transaction.brand && transaction.model && (
                            <div className="text-xs text-gray-400 mt-1">{transaction.brand} - {transaction.model}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            transaction.type === 'in' ? 'text-green-600' :
                            transaction.type === 'out' ? 'text-blue-600' :
                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            @ {formatCurrency(transaction.unitPrice)}/{transaction.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold ${
                            transaction.totalAmount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.totalAmount > 0 ? '+' : ''}{formatCurrency(transaction.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTransactionTypeBadge(transaction.type)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.requestedBy}</div>
                          {transaction.supplier && (
                            <div className="text-xs text-gray-500 mt-1">
                              Supplier: {transaction.supplier}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit Transaction"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-700"
                              title="Print Receipt"
                            >
                              <MdPrint className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                  <span className="font-medium">{transactions.length}</span> transactions
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedTransaction.transactionCode}</h2>
                  <p className="text-blue-100">{selectedTransaction.date} • {selectedTransaction.time}</p>
                  <div className="flex gap-2 mt-3">
                    {getTransactionTypeBadge(selectedTransaction.type)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Item Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdInventory className="h-5 w-5 text-tracked-primary" />
                  Equipment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Item Name</p>
                    <p className="text-lg font-bold text-gray-800">{selectedTransaction.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Equipment Code</p>
                    <p className="text-lg font-bold text-blue-600">{selectedTransaction.equipmentCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Brand</p>
                    <p className="text-base font-semibold text-gray-800">{selectedTransaction.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="text-base font-semibold text-gray-800">{selectedTransaction.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-base font-semibold text-gray-800">{selectedTransaction.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-base font-semibold text-gray-800">{selectedTransaction.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="text-base font-semibold text-gray-800 capitalize">{selectedTransaction.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className={`text-lg font-bold ${
                      selectedTransaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTransaction.quantity > 0 ? '+' : ''}{selectedTransaction.quantity} {selectedTransaction.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedTransaction.unitPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdDescription className="h-5 w-5 text-tracked-primary" />
                  Transaction Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reference Number</span>
                    <span className="text-sm font-semibold text-blue-600">{selectedTransaction.referenceNumber}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Purpose</span>
                    <span className="text-sm font-medium text-gray-800 text-right max-w-xs">
                      {selectedTransaction.purpose}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Requested By</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedTransaction.requestedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved By</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedTransaction.approvedBy}</span>
                  </div>
                  {selectedTransaction.supplier && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Supplier</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedTransaction.supplier}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-tracked-primary bg-opacity-10 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className={`text-3xl font-bold ${
                      selectedTransaction.totalAmount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTransaction.totalAmount > 0 ? '+' : ''}{formatCurrency(selectedTransaction.totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Unit Price × Quantity</p>
                    <p className="text-lg text-gray-700">
                      {formatCurrency(selectedTransaction.unitPrice)} × {Math.abs(selectedTransaction.quantity)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Notes</h3>
                  <p className="text-gray-800">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Transaction
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Receipt
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Download PDF
                </button>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="ml-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffStockTransactions;
