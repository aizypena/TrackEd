import { useState, useEffect } from 'react';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { MdMenu, MdDownload } from 'react-icons/md';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffPaymentReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('revenue_summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Set default date range (October 2024 onwards)
    setDateFrom('2024-10-01');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateTo(`${yyyy}-${mm}-${dd}`);
  }, []);

  const logAction = async (action, description) => {
    try {
      const token = getStaffToken();
      await fetch('http://localhost:8000/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          log_level: 'info'
        })
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const token = getStaffToken();
      
      const requestBody = {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo
      };
      
      if (statusFilter && statusFilter !== 'all') {
        requestBody.status = statusFilter;
      }
      
      if (methodFilter && methodFilter !== 'all') {
        requestBody.method = methodFilter;
      }
      
      const response = await fetch('http://localhost:8000/api/staff/reports/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        toast.success('Report generated successfully');
        
        await logAction('report_generated', `Generated ${reportType} payment report for period ${dateFrom} to ${dateTo}`);
      } else {
        toast.error(result.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      let csvContent = '';
      let filename = '';

      if (reportType === 'revenue_summary') {
        filename = `payment_revenue_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Period,Total Revenue,Total Transactions,Average Transaction,Payment Methods\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.period}","₱${item.total_revenue}",${item.transaction_count},"₱${item.average_transaction}",${item.payment_methods}\n`;
        });
      } else if (reportType === 'payment_method_breakdown') {
        filename = `payment_methods_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Payment Method,Transaction Count,Total Amount,Percentage\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.method}",${item.count},"₱${item.amount}",${item.percentage}%\n`;
        });
      } else if (reportType === 'outstanding_payments') {
        filename = `outstanding_payments_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Student Name,Batch,Amount,Due Date,Days Overdue,Status\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.student_name}","${item.batch}","₱${item.amount}","${item.due_date}",${item.days_overdue},"${item.status}"\n`;
        });
      } else if (reportType === 'daily_collection') {
        filename = `daily_collection_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Date,Transactions,Total Collected,Cash,Online Payments\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.date}",${item.transactions},"₱${item.total}","₱${item.cash}","₱${item.online}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
      
      await logAction('report_exported_csv', `Exported ${reportType} payment report to CSV (${filename})`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
    }
  };

  const exportToPDF = async () => {
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('TrackEd Payment Report', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 14, 25);
      doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 30);
      
      if (statusFilter !== 'all') {
        doc.text(`Status: ${statusFilter}`, 14, 35);
      }
      
      if (methodFilter !== 'all') {
        doc.text(`Method: ${methodFilter}`, 14, statusFilter !== 'all' ? 40 : 35);
      }

      let yPosition = statusFilter !== 'all' && methodFilter !== 'all' ? 45 : 
                      (statusFilter !== 'all' || methodFilter !== 'all' ? 40 : 35);

      if (reportType === 'revenue_summary') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Period', 'Total Revenue', 'Transactions', 'Avg Transaction', 'Methods']],
          body: reportData.data.map(item => [
            item.period,
            `₱${item.total_revenue}`,
            item.transaction_count,
            `₱${item.average_transaction}`,
            item.payment_methods
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 }
        });

      } else if (reportType === 'payment_method_breakdown') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Payment Method', 'Count', 'Total Amount', 'Percentage']],
          body: reportData.data.map(item => [
            item.method,
            item.count,
            `₱${item.amount}`,
            `${item.percentage}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });

      } else if (reportType === 'outstanding_payments') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Student', 'Batch', 'Amount', 'Due Date', 'Days Overdue', 'Status']],
          body: reportData.data.map(item => [
            item.student_name,
            item.batch,
            `₱${item.amount}`,
            item.due_date,
            item.days_overdue,
            item.status
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 7, cellPadding: 2 }
        });

      } else if (reportType === 'daily_collection') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Date', 'Transactions', 'Total', 'Cash', 'Online']],
          body: reportData.data.map(item => [
            item.date,
            item.transactions,
            `₱${item.total}`,
            `₱${item.cash}`,
            `₱${item.online}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      const filename = `payment_${reportType}_${dateFrom}_to_${dateTo}.pdf`;
      doc.save(filename);
      
      toast.success('PDF exported successfully');
      
      await logAction('report_exported_pdf', `Exported ${reportType} payment report to PDF (${filename})`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
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
                <h1 className="text-xl font-bold">Payment Reports</h1>
                <p className="text-sm text-blue-100">Generate and export payment and revenue reports</p>
              </div>
            </div>
            {reportData && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white text-tracked-primary rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <MdDownload className="h-5 w-5" />
                Export to Excel
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="p-6">
          {/* Configuration Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="revenue_summary">Revenue Summary</option>
                  <option value="payment_method_breakdown">Payment Method Breakdown</option>
                  <option value="daily_collection">Daily Collection</option>
                  <option value="outstanding_payments">Outstanding Payments</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  min="2024-10-01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min="2024-10-01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                  <option value="card">Card</option>
                  <option value="grab_pay">GrabPay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-6 py-2.5 bg-tracked-primary text-white font-medium rounded-lg hover:bg-tracked-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Report Results */}
          {reportData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Results</h2>
              
              {/* Statistics Overview */}
              {reportData.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">₱{reportData.statistics.total_revenue}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.statistics.total_transactions}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Paid</p>
                    <p className="text-3xl font-bold text-green-600">₱{reportData.statistics.paid}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Unpaid</p>
                    <p className="text-3xl font-bold text-orange-600">₱{reportData.statistics.unpaid}</p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'revenue_summary' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Avg Transaction</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Payment Methods</th>
                        </>
                      )}
                      {reportType === 'payment_method_breakdown' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Payment Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Transaction Count</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Percentage</th>
                        </>
                      )}
                      {reportType === 'outstanding_payments' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Batch</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Days Overdue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Status</th>
                        </>
                      )}
                      {reportType === 'daily_collection' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Collected</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Cash</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Online Payments</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data && reportData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {reportType === 'revenue_summary' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.period}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₱{row.total_revenue}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.transaction_count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{row.average_transaction}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{row.payment_methods}</td>
                          </>
                        )}
                        {reportType === 'payment_method_breakdown' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {row.method}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₱{row.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{row.percentage}%</td>
                          </>
                        )}
                        {reportType === 'outstanding_payments' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.student_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.batch}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₱{row.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.due_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{row.days_overdue}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${
                                row.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                row.status === 'unpaid' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'daily_collection' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.transactions}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₱{row.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">₱{row.cash}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">₱{row.online}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default StaffPaymentReports;
