import { useState, useEffect } from 'react';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { MdMenu, MdDownload } from 'react-icons/md';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffStudentReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('program_distribution');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms();
    // Set default date range (October 2024 onwards - when student records started)
    setDateFrom('2024-10-01');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateTo(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setPrograms(result.data || []);
      } else {
        toast.error('Failed to load programs');
      }
    } catch (error) {
      toast.error('Error loading programs');
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
      const response = await fetch('http://localhost:8000/api/staff/reports/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
          program_id: programFilter !== 'all' ? programFilter : null,
          status: statusFilter !== 'all' ? statusFilter : null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        toast.success('Report generated successfully');
        
        // Log action to system logs
        await logAction('report_generated', `Generated ${reportType} student report for period ${dateFrom} to ${dateTo}`);
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

      if (reportType === 'program_distribution') {
        filename = `student_program_distribution_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Program,Total Students,Active,Completed,Withdrawn,Dropped Out\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.program}",${item.total},${item.active},${item.completed},${item.withdrawn},${item.dropped_out}\n`;
        });
      } else if (reportType === 'status_report') {
        filename = `student_status_report_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Student Name,Email,Program,Batch,Status,Enrollment Date\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.student_name}","${item.email}","${item.program}","${item.batch}","${item.status}","${item.enrollment_date}"\n`;
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
      
      // Log action to system logs
      await logAction('report_exported_csv', `Exported ${reportType} student report to CSV (${filename})`);
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
      
      // Add header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('TrackEd Student Report', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 14, 25);
      doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 30);
      
      if (programFilter !== 'all') {
        const program = programs.find(p => p.id.toString() === programFilter);
        doc.text(`Program: ${program ? program.title : programFilter}`, 14, 35);
      }
      
      if (statusFilter !== 'all') {
        doc.text(`Status: ${statusFilter}`, 14, programFilter !== 'all' ? 40 : 35);
      }

      let yPosition = programFilter !== 'all' && statusFilter !== 'all' ? 45 : 
                      (programFilter !== 'all' || statusFilter !== 'all' ? 40 : 35);

      // Generate PDF based on report type
      if (reportType === 'program_distribution') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Program', 'Total', 'Active', 'Completed', 'Withdrawn', 'Dropped Out']],
          body: reportData.data.map(item => [
            item.program,
            item.total,
            item.active,
            item.completed,
            item.withdrawn,
            item.dropped_out
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });

      } else if (reportType === 'status_report') {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Student Status Distribution', 14, yPosition + 5);
        
        autoTable(doc, {
          startY: yPosition + 12,
          head: [['Student Name', 'Email', 'Program', 'Batch', 'Status', 'Enrollment Date']],
          body: reportData.data.map(item => [
            item.student_name,
            item.email,
            item.program,
            item.batch,
            item.status,
            item.enrollment_date
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 45 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
          }
        });
      }

      // Add footer with page numbers
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

      // Save the PDF
      const filename = `student_${reportType}_${dateFrom}_to_${dateTo}.pdf`;
      doc.save(filename);
      
      toast.success('PDF exported successfully');
      
      // Log action to system logs
      await logAction('report_exported_pdf', `Exported ${reportType} student report to PDF (${filename})`);
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
                <h1 className="text-xl font-bold">Student Reports</h1>
                <p className="text-sm text-blue-100">Generate and export comprehensive student reports</p>
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
                  <option value="program_distribution">Program Distribution</option>
                  <option value="status_report">Student Status Report</option>
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

              {/* Program Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Filter
                </label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="dropped_out">Dropped Out</option>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.statistics.total}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.statistics.active}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.statistics.completed}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Withdrawn</p>
                    <p className="text-3xl font-bold text-orange-600">{reportData.statistics.withdrawn}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Dropped Out</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.statistics.dropped_out}</p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'program_distribution' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Active</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Completed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Withdrawn</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Dropped Out</th>
                        </>
                      )}
                      {reportType === 'status_report' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Batch</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Enrollment Date</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data && reportData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {reportType === 'program_distribution' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.program}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.active}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.completed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.withdrawn}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.dropped_out}</td>
                          </>
                        )}
                        {reportType === 'status_report' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.student_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.program}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.batch}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${
                                row.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                row.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                row.status === 'withdrawn' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1).replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.enrollment_date}</td>
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

export default StaffStudentReports;
