import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdPayment,
  MdCheckCircle,
  MdWarning,
  MdPending,
  MdReceipt,
  MdAdd,
  MdPrint,
  MdHistory,
  MdAttachMoney,
  MdCalendarToday
} from 'react-icons/md';

const StaffPaymentRecords = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data - replace with actual API calls
  const [paymentRecords, setPaymentRecords] = useState([
    {
      id: 1,
      studentId: 'STU-2025-001',
      studentName: 'Juan Dela Cruz',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      totalFee: 15000,
      amountPaid: 15000,
      balance: 0,
      paymentStatus: 'paid',
      lastPaymentDate: '2025-09-15',
      paymentMethod: 'Cash',
      transactions: [
        { date: '2025-09-15', amount: 15000, method: 'Cash', receiptNo: 'REC-001', remarks: 'Full payment' }
      ]
    },
    {
      id: 2,
      studentId: 'STU-2025-002',
      studentName: 'Maria Santos',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      totalFee: 18000,
      amountPaid: 10000,
      balance: 8000,
      paymentStatus: 'partial',
      lastPaymentDate: '2025-10-01',
      paymentMethod: 'Bank Transfer',
      transactions: [
        { date: '2025-09-20', amount: 5000, method: 'Cash', receiptNo: 'REC-002', remarks: 'Initial payment' },
        { date: '2025-10-01', amount: 5000, method: 'Bank Transfer', receiptNo: 'REC-003', remarks: 'Second installment' }
      ]
    },
    {
      id: 3,
      studentId: 'STU-2025-003',
      studentName: 'Pedro Reyes',
      program: 'Electronics NCII',
      batch: 'Batch 01-2025',
      totalFee: 16000,
      amountPaid: 16000,
      balance: 0,
      paymentStatus: 'paid',
      lastPaymentDate: '2025-08-10',
      paymentMethod: 'GCash',
      transactions: [
        { date: '2025-08-10', amount: 16000, method: 'GCash', receiptNo: 'REC-004', remarks: 'Full payment' }
      ]
    },
    {
      id: 4,
      studentId: 'STU-2025-004',
      studentName: 'Ana Garcia',
      program: 'Food Processing NCII',
      batch: 'Batch 03-2025',
      totalFee: 14000,
      amountPaid: 0,
      balance: 14000,
      paymentStatus: 'unpaid',
      lastPaymentDate: null,
      paymentMethod: null,
      transactions: []
    },
    {
      id: 5,
      studentId: 'STU-2025-005',
      studentName: 'Roberto Cruz',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      totalFee: 15000,
      amountPaid: 8000,
      balance: 7000,
      paymentStatus: 'overdue',
      lastPaymentDate: '2025-08-20',
      paymentMethod: 'Cash',
      transactions: [
        { date: '2025-08-15', amount: 5000, method: 'Cash', receiptNo: 'REC-005', remarks: 'Initial payment' },
        { date: '2025-08-20', amount: 3000, method: 'Cash', receiptNo: 'REC-006', remarks: 'Partial payment' }
      ]
    },
    {
      id: 6,
      studentId: 'STU-2025-006',
      studentName: 'Carmen Lopez',
      program: 'Plumbing NCII',
      batch: 'Batch 02-2025',
      totalFee: 15500,
      amountPaid: 15500,
      balance: 0,
      paymentStatus: 'paid',
      lastPaymentDate: '2025-09-18',
      paymentMethod: 'Bank Transfer',
      transactions: [
        { date: '2025-09-18', amount: 15500, method: 'Bank Transfer', receiptNo: 'REC-007', remarks: 'Full payment via bank' }
      ]
    }
  ]);

  const programs = [
    'Welding NCII',
    'Automotive Servicing NCII',
    'Electronics NCII',
    'Food Processing NCII',
    'Plumbing NCII',
    'Carpentry NCII'
  ];

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Paid'
      },
      partial: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Partial'
      },
      unpaid: {
        className: 'bg-red-100 text-red-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Unpaid'
      },
      overdue: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Overdue'
      }
    };

    const config = statusConfig[status] || statusConfig.unpaid;

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

  const filteredRecords = paymentRecords
    .filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = paymentStatusFilter === 'all' || record.paymentStatus === paymentStatusFilter;
      const matchesProgram = programFilter === 'all' || record.program === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.lastPaymentDate || 0) - new Date(a.lastPaymentDate || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.lastPaymentDate || 0) - new Date(b.lastPaymentDate || 0);
      } else if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      } else if (sortBy === 'balance_high') {
        return b.balance - a.balance;
      }
      return 0;
    });

  const stats = {
    totalRevenue: paymentRecords.reduce((sum, r) => sum + r.amountPaid, 0),
    totalOutstanding: paymentRecords.reduce((sum, r) => sum + r.balance, 0),
    paidCount: paymentRecords.filter(r => r.paymentStatus === 'paid').length,
    unpaidCount: paymentRecords.filter(r => r.paymentStatus === 'unpaid' || r.paymentStatus === 'overdue').length
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
                <h1 className="text-xl font-bold">Payment Records</h1>
                <p className="text-sm text-blue-100">Track student payments and transactions</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Record Payment</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdAttachMoney className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <MdWarning className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Outstanding</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Fully Paid</p>
                  <p className="text-xl font-bold text-blue-600">{stats.paidCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MdPending className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Unpaid/Overdue</p>
                  <p className="text-xl font-bold text-orange-600">{stats.unpaidCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
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
                  <option value="newest">Latest Payment</option>
                  <option value="oldest">Oldest Payment</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="balance_high">Highest Balance</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
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

          {/* Payment Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                          <div className="text-xs text-gray-500">{record.studentId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{record.program}</div>
                          <div className="text-xs text-gray-500">{record.batch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(record.totalFee)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">{formatCurrency(record.amountPaid)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${record.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(record.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(record.paymentStatus)}
                        </td>
                        <td className="px-6 py-4">
                          {record.lastPaymentDate ? (
                            <>
                              <div className="text-sm text-gray-900">{record.lastPaymentDate}</div>
                              <div className="text-xs text-gray-500">{record.paymentMethod}</div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No payment yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedStudent(record)}
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-700"
                              title="Add Payment"
                            >
                              <MdPayment className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Print Receipt"
                            >
                              <MdReceipt className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No payment records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRecords.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredRecords.length}</span> of{' '}
                  <span className="font-medium">{paymentRecords.length}</span> records
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

      {/* Payment Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.studentName}</h2>
                  <p className="text-blue-100">{selectedStudent.studentId} • {selectedStudent.program}</p>
                  <div className="flex gap-2 mt-2">
                    {getPaymentStatusBadge(selectedStudent.paymentStatus)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Total Fee</p>
                  <p className="text-2xl font-bold text-blue-800 mt-2">{formatCurrency(selectedStudent.totalFee)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-800 mt-2">{formatCurrency(selectedStudent.amountPaid)}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(selectedStudent.amountPaid / selectedStudent.totalFee) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {((selectedStudent.amountPaid / selectedStudent.totalFee) * 100).toFixed(1)}% paid
                    </p>
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${selectedStudent.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-sm font-medium ${selectedStudent.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Balance
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${selectedStudent.balance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                    {formatCurrency(selectedStudent.balance)}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdHistory className="h-5 w-5 text-tracked-primary" />
                  Transaction History
                </h3>
                {selectedStudent.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.transactions.map((transaction, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MdCalendarToday className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{transaction.date}</span>
                              <span className="text-xs text-gray-500">• Receipt: {transaction.receiptNo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MdPayment className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{transaction.method}</span>
                            </div>
                            {transaction.remarks && (
                              <p className="text-xs text-gray-500 mt-2 italic">{transaction.remarks}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(transaction.amount)}
                            </div>
                            <button className="mt-2 text-xs text-tracked-primary hover:text-tracked-secondary flex items-center gap-1">
                              <MdReceipt className="h-3 w-3" />
                              Print Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MdWarning className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No payment transactions recorded yet.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                {selectedStudent.balance > 0 && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                    <MdPayment className="h-5 w-5" />
                    Record Payment
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Summary
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Download Statement
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
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

export default StaffPaymentRecords;
