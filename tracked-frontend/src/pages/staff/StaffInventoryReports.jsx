import { useState, useEffect } from 'react';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { MdMenu } from 'react-icons/md';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffInventoryReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('stock_summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    // Set default date range (October 2024 onwards)
    setDateFrom('2024-10-01');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateTo(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fetchCategories = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/equipment/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data || []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error loading categories');
    }
  };

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
      
      if (categoryFilter && categoryFilter !== 'all') {
        requestBody.category = categoryFilter;
      }
      
      if (statusFilter && statusFilter !== 'all') {
        requestBody.status = statusFilter;
      }
      
      const response = await fetch('http://localhost:8000/api/staff/reports/inventory', {
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
        
        await logAction('report_generated', `Generated ${reportType} inventory report for period ${dateFrom} to ${dateTo}`);
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

      if (reportType === 'stock_summary') {
        filename = `inventory_stock_summary_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Equipment Name,Category,Total Quantity,Available,In Use,Maintenance,Damaged,Status\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.name}","${item.category}",${item.quantity},${item.available},${item.in_use},${item.maintenance},${item.damaged},"${item.status}"\n`;
        });
      } else if (reportType === 'maintenance_schedule') {
        filename = `inventory_maintenance_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Equipment Name,Category,Last Maintenance,Next Maintenance,Status,Condition\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.name}","${item.category}","${item.last_maintenance}","${item.next_maintenance}","${item.status}","${item.condition}"\n`;
        });
      } else if (reportType === 'utilization_report') {
        filename = `inventory_utilization_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Category,Total Equipment,Available,In Use,Utilization Rate\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.category}",${item.total},${item.available},${item.in_use},${item.utilization_rate}%\n`;
        });
      } else if (reportType === 'value_summary') {
        filename = `inventory_value_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Category,Total Items,Total Value,Average Value\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.category}",${item.total_items},"$${item.total_value}","$${item.average_value}"\n`;
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
      
      await logAction('report_exported_csv', `Exported ${reportType} inventory report to CSV (${filename})`);
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
      doc.text('TrackEd Inventory Report', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 14, 25);
      doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 30);
      
      if (categoryFilter !== 'all') {
        doc.text(`Category: ${categoryFilter}`, 14, 35);
      }
      
      if (statusFilter !== 'all') {
        doc.text(`Status: ${statusFilter}`, 14, categoryFilter !== 'all' ? 40 : 35);
      }

      let yPosition = categoryFilter !== 'all' && statusFilter !== 'all' ? 45 : 
                      (categoryFilter !== 'all' || statusFilter !== 'all' ? 40 : 35);

      if (reportType === 'stock_summary') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Equipment', 'Category', 'Total', 'Available', 'In Use', 'Maintenance', 'Damaged', 'Status']],
          body: reportData.data.map(item => [
            item.name,
            item.category,
            item.quantity,
            item.available,
            item.in_use,
            item.maintenance,
            item.damaged,
            item.status
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 7, cellPadding: 2 }
        });

      } else if (reportType === 'maintenance_schedule') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Equipment', 'Category', 'Last Maintenance', 'Next Maintenance', 'Status', 'Condition']],
          body: reportData.data.map(item => [
            item.name,
            item.category,
            item.last_maintenance,
            item.next_maintenance,
            item.status,
            item.condition
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 }
        });

      } else if (reportType === 'utilization_report') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Category', 'Total Equipment', 'Available', 'In Use', 'Utilization Rate']],
          body: reportData.data.map(item => [
            item.category,
            item.total,
            item.available,
            item.in_use,
            `${item.utilization_rate}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });

      } else if (reportType === 'value_summary') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Category', 'Total Items', 'Total Value', 'Average Value']],
          body: reportData.data.map(item => [
            item.category,
            item.total_items,
            `$${item.total_value}`,
            `$${item.average_value}`
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

      const filename = `inventory_${reportType}_${dateFrom}_to_${dateTo}.pdf`;
      doc.save(filename);
      
      toast.success('PDF exported successfully');
      
      await logAction('report_exported_pdf', `Exported ${reportType} inventory report to PDF (${filename})`);
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
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
                <p className="text-sm text-gray-600">Generate and export equipment inventory reports</p>
              </div>
            </div>
          </div>
        </div>

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
                  <option value="stock_summary">Stock Summary</option>
                  <option value="maintenance_schedule">Maintenance Schedule</option>
                  <option value="utilization_report">Utilization Report</option>
                  <option value="value_summary">Value Summary</option>
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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="inUse">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              
              {reportData && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                  >
                    Export to CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                  >
                    Export to PDF
                  </button>
                </>
              )}
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
                    <p className="text-sm text-gray-600 mb-1">Total Equipment</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.statistics.total}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Available</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.statistics.available}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">In Use</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.statistics.in_use}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Maintenance</p>
                    <p className="text-3xl font-bold text-orange-600">{reportData.statistics.maintenance}</p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'stock_summary' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Equipment Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Available</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">In Use</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Maintenance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Damaged</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Status</th>
                        </>
                      )}
                      {reportType === 'maintenance_schedule' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Equipment Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Last Maintenance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Next Maintenance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Condition</th>
                        </>
                      )}
                      {reportType === 'utilization_report' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Available</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">In Use</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Utilization Rate</th>
                        </>
                      )}
                      {reportType === 'value_summary' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Average Value</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data && reportData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {reportType === 'stock_summary' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{row.available}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{row.in_use}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">{row.maintenance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{row.damaged}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${
                                row.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                                row.status === 'inUse' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                row.status === 'maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                row.status === 'damaged' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'maintenance_schedule' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.last_maintenance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.next_maintenance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${
                                row.condition === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                                row.condition === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                row.condition === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {row.condition}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'utilization_report' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{row.available}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{row.in_use}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.utilization_rate}%</td>
                          </>
                        )}
                        {reportType === 'value_summary' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total_items}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${row.total_value}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.average_value}</td>
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

export default StaffInventoryReports;
