import { useState, useEffect } from 'react';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { MdMenu } from 'react-icons/md';

const StaffEnrollmentReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms();
    // Set default date range (current year)
    const currentYear = new Date().getFullYear();
    setDateFrom(`${currentYear}-01-01`);
    setDateTo(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = getStaffToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/staff/programs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setPrograms(result.data);
        // toast.success(`Loaded ${result.data.length} programs`);
      } else {
        // toast.error('Failed to load programs');
      }
    } catch (error) {
      // toast.error('Error loading programs: ' + error.message);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      const params = new URLSearchParams({
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
        program: programFilter,
        status: statusFilter
      });

      const response = await fetch(`http://localhost:8000/api/staff/enrollment-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      let csvContent = '';
      let filename = '';

      if (reportType === 'summary') {
        filename = `enrollment_summary_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Program,Total Enrollments,Active,Completed,Withdrawn,Dropped Out\n';
        reportData.programs.forEach(program => {
          csvContent += `"${program.program}",${program.total},${program.active},${program.completed},${program.withdrawn},${program.dropped_out || 0}\n`;
        });
      } else if (reportType === 'detailed') {
        filename = `enrollment_detailed_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Student Name,Email,Program,Batch,Status,Enrollment Date\n';
        reportData.enrollments.forEach(enrollment => {
          csvContent += `"${enrollment.student_name}","${enrollment.email}","${enrollment.program}","${enrollment.batch}","${enrollment.status}","${enrollment.enrollment_date}"\n`;
        });
      } else if (reportType === 'by_program') {
        filename = `enrollment_by_program_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Program,Month,Enrollments\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.program}","${item.month}",${item.enrollments}\n`;
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
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
    }
  };

  const exportToPDF = () => {
    toast.info('PDF export will be available soon');
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
                <h1 className="text-xl font-bold">Enrollment Reports</h1>
                <p className="text-sm text-blue-100">Generate and export enrollment reports</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Report Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Report Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent"
                >
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Enrollment List</option>
                  <option value="by_program">Enrollment by Program</option>
                  <option value="by_status">Enrollment by Status</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent"
                />
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program
                </label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent"
                >
                  <option value="all">All Programs</option>
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading programs...</option>
                  )}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent"
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
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-6 py-2.5 bg-tracked-primary text-white font-medium rounded-lg hover:bg-tracked-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              
              {reportData && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export to CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Export to PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Report Preview */}
          {reportData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Report Preview
              </h2>

              {/* Summary Statistics */}
              {reportData.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Enrollments</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.statistics.total}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.statistics.active}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.statistics.completed}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">Withdrawn</p>
                    <p className="text-3xl font-bold text-orange-600">{reportData.statistics.withdrawn}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">Dropped Out</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.statistics.dropped_out || 0}</p>
                  </div>
                </div>
              )}

              {/* Summary Report Table */}
              {reportType === 'summary' && reportData.programs && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Total Enrollments
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Active
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Withdrawn
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Dropped Out
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.programs.map((program, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {program.program}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {program.total}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            {program.active}
                          </td>
                          <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                            {program.completed}
                          </td>
                          <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                            {program.withdrawn}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-medium">
                            {program.dropped_out || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Detailed Report Table */}
              {reportType === 'detailed' && reportData.enrollments && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Enrollment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.enrollments.map((enrollment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {enrollment.student_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {enrollment.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {enrollment.program}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {enrollment.batch}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              enrollment.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' :
                              enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              enrollment.status === 'withdrawn' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                              'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {enrollment.status === 'dropped_out' ? 'Dropped Out' : enrollment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* By Program Report */}
              {reportType === 'by_program' && reportData.data && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Enrollments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.program}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {item.enrollments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* By Status Report */}
              {reportType === 'by_status' && reportData.data && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {reportData.data.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          {item.status === 'dropped_out' ? 'Dropped Out' : item.status}
                        </h3>
                        <span className="text-3xl font-bold text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            item.status === 'active' ? 'bg-green-600' :
                            item.status === 'completed' ? 'bg-blue-600' :
                            item.status === 'withdrawn' ? 'bg-orange-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{item.percentage}% of total enrollments</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Data Message */}
          {!reportData && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Generated</h3>
                <p className="text-gray-600">Configure your report settings above and click "Generate Report" to view enrollment data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
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

export default StaffEnrollmentReports;
