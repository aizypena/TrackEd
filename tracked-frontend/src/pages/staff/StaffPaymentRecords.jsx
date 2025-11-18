import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import PaymentDetailModal from '../../components/staff/PaymentDetailModal';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
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
  MdAttachMoney
} from 'react-icons/md';

const StaffPaymentRecords = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState([]);

  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch('https://api.smitracked.cloud/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          log_level: logLevel,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log system action');
      }
    } catch (error) {
      console.error('Error logging system action:', error);
    }
  };

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch('https://api.smitracked.cloud/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment records:', data);
        
        // Transform the data to match our component structure
        const transformedRecords = data.payments.map(payment => {
          // Check if user has a voucher
          const hasVoucher = payment.user?.voucher_id && payment.user?.voucher;
          
          return {
            id: payment.id,
            studentId: payment.user?.student_id || 'N/A',
            studentName: `${payment.user?.first_name || ''} ${payment.user?.last_name || ''}`.trim() || 'Unknown',
            program: payment.user?.program?.title || 'N/A',
            batch: payment.batch_id || 'N/A',
            hasVoucher: hasVoucher,
            totalFee: hasVoucher ? 0 : parseFloat(payment.amount),
            amountPaid: hasVoucher ? 0 : (payment.payment_status === 'paid' ? parseFloat(payment.amount) : 0),
            balance: hasVoucher ? 0 : (payment.payment_status === 'paid' ? 0 : parseFloat(payment.amount)),
            paymentStatus: hasVoucher ? 'voucher' : payment.payment_status,
            lastPaymentDate: payment.updated_at ? new Date(payment.updated_at).toISOString().split('T')[0] : null,
            paymentMethod: hasVoucher ? 'VOUCHER' : (payment.payment_method ? payment.payment_method.toUpperCase() : 'N/A'),
            referenceCode: payment.reference_code,
            paymongoPaymentId: payment.paymongo_payment_id,
            description: payment.payment_description,
            createdAt: payment.created_at,
            transactions: payment.payment_status === 'paid' ? [
              {
                date: payment.updated_at ? new Date(payment.updated_at).toISOString().split('T')[0] : 'N/A',
                amount: parseFloat(payment.amount),
                method: payment.payment_method ? payment.payment_method.toUpperCase() : 'N/A',
                receiptNo: payment.reference_code,
                remarks: payment.payment_description
              }
            ] : []
          };
        });

        setPaymentRecords(transformedRecords);
      } else {
        toast.error('Failed to fetch payment records');
      }
    } catch (error) {
      console.error('Error fetching payment records:', error);
      toast.error('Error loading payment records');
    } finally {
      setLoading(false);
    }
  };

  const programs = [];

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Paid'
      },
      voucher: {
        className: 'bg-purple-100 text-purple-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Voucher'
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

  // Export to Excel function
  const handleExportToExcel = async () => {
    const loadingToast = toast.loading('Generating Excel file...');

    try {
      // Get staff user info for logging
      const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
      const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

      // Prepare data for export
      const exportData = filteredRecords.map((record, index) => ({
        'No.': index + 1,
        'Student ID': record.studentId || 'N/A',
        'Student Name': record.studentName || 'N/A',
        'Program': record.program || 'N/A',
        'Batch': record.batch || 'N/A',
        'Total Fee': record.totalFee || 0,
        'Amount Paid': record.amountPaid || 0,
        'Payment Status': record.paymentStatus ? record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1) : 'N/A',
        'Last Payment Date': record.lastPaymentDate || 'N/A',
        'Payment Method': record.paymentMethod || 'N/A',
        'Reference Code': record.referenceCode || 'N/A',
        'PayMongo Payment ID': record.paymongoPaymentId || 'N/A',
        'Description': record.description || 'N/A',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },  // No.
        { wch: 15 }, // Student ID
        { wch: 25 }, // Student Name
        { wch: 30 }, // Program
        { wch: 15 }, // Batch
        { wch: 15 }, // Total Fee
        { wch: 15 }, // Amount Paid
        { wch: 15 }, // Payment Status
        { wch: 18 }, // Last Payment Date
        { wch: 15 }, // Payment Method
        { wch: 25 }, // Reference Code
        { wch: 30 }, // PayMongo Payment ID
        { wch: 30 }, // Description
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Records');

      // Generate filename with current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Payment_Records_Export_${dateStr}_${timeStr}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      // Log the export action
      await logSystemAction(
        'payment_records_exported',
        `${staffName} exported ${filteredRecords.length} payment record(s) to Excel (${filename}) - Total Revenue: ${formatCurrency(stats.totalRevenue)}`,
        'info'
      );

      toast.success(`Successfully exported ${filteredRecords.length} payment record(s) to Excel!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel', {
        id: loadingToast,
      });
    }
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
    paidCount: paymentRecords.filter(r => r.paymentStatus === 'paid').length,
    voucherCount: paymentRecords.filter(r => r.paymentStatus === 'voucher').length
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
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl font-bold text-green-600">₱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-600">₱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Paid</p>
                  <p className="text-xl font-bold text-blue-600">{stats.paidCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl font-bold text-purple-600">₱</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Voucher</p>
                  <p className="text-xl font-bold text-purple-600">{stats.voucherCount}</p>
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
              <button 
                onClick={fetchPaymentRecords}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
              >
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button 
                onClick={handleExportToExcel}
                disabled={filteredRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDownload className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>

          {/* Payment Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
                <span className="ml-3 text-gray-600">Loading payment records...</span>
              </div>
            ) : (
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
                              onClick={() => {
                                const token = getStaffToken();
                                window.open(`https://api.smitracked.cloud/api/payments/${record.id}/receipt?token=${token}`, '_blank');
                              }}
                              className="text-green-600 hover:text-green-700"
                              title="Download Receipt"
                              disabled={!record.referenceCode}
                            >
                              <MdDownload className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No payment records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}

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
      <PaymentDetailModal 
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default StaffPaymentRecords;
