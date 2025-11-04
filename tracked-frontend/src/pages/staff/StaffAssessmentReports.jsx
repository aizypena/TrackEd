import { useState, useEffect } from 'react';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { MdMenu } from 'react-icons/md';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffAssessmentReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('pass_rate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchPrograms();
    fetchBatches();
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

  const fetchBatches = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Batches API response:', result);
      
      if (result.success) {
        console.log('Batches data:', result.data);
        setBatches(result.data || []);
      } else {
        console.error('Failed to load batches:', result);
        toast.error('Failed to load batches');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Error loading batches');
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
      
      // Prepare request body
      const requestBody = {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo
      };
      
      // Only add filters if they're not 'all'
      if (programFilter && programFilter !== 'all') {
        requestBody.program_id = parseInt(programFilter);
      }
      
      if (batchFilter && batchFilter !== 'all') {
        requestBody.batch_id = parseInt(batchFilter);
      }
      
      const response = await fetch('http://localhost:8000/api/staff/reports/assessments', {
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
        
        // Log action to system logs
        await logAction('report_generated', `Generated ${reportType} assessment report for period ${dateFrom} to ${dateTo}`);
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

      if (reportType === 'pass_rate') {
        filename = `assessment_pass_rate_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Program,Batch,Total Assessments,Passed,Failed,Pass Rate\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.program}","${item.batch}",${item.total},${item.passed},${item.failed},${item.pass_rate}%\n`;
        });
      } else if (reportType === 'competency_summary') {
        filename = `competency_summary_${dateFrom}_to_${dateTo}.csv`;
        csvContent = 'Competency,Total Assessed,Competent,Not Yet Competent,Percentage\n';
        reportData.data.forEach(item => {
          csvContent += `"${item.competency}",${item.total},${item.competent},${item.not_competent},${item.percentage}%\n`;
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
      await logAction('report_exported_csv', `Exported ${reportType} assessment report to CSV (${filename})`);
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
      doc.text('TrackEd Assessment Report', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 14, 25);
      doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 30);
      
      if (programFilter !== 'all') {
        const program = programs.find(p => p.id.toString() === programFilter);
        doc.text(`Program: ${program ? program.title : programFilter}`, 14, 35);
      }
      
      if (batchFilter !== 'all') {
        const batch = batches.find(b => b.id.toString() === batchFilter);
        doc.text(`Batch: ${batch ? batch.batch_id : batchFilter}`, 14, programFilter !== 'all' ? 40 : 35);
      }

      let yPosition = programFilter !== 'all' && batchFilter !== 'all' ? 45 : 
                      (programFilter !== 'all' || batchFilter !== 'all' ? 40 : 35);

      // Generate PDF based on report type
      if (reportType === 'pass_rate') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Program', 'Batch', 'Total', 'Passed', 'Failed', 'Pass Rate']],
          body: reportData.data.map(item => [
            item.program,
            item.batch,
            item.total,
            item.passed,
            item.failed,
            `${item.pass_rate}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });

      } else if (reportType === 'competency_summary') {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Competency', 'Total Assessed', 'Competent', 'Not Yet Competent', 'Percentage']],
          body: reportData.data.map(item => [
            item.competency,
            item.total,
            item.competent,
            item.not_competent,
            `${item.percentage}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
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
      const filename = `assessment_${reportType}_${dateFrom}_to_${dateTo}.pdf`;
      doc.save(filename);
      
      toast.success('PDF exported successfully');
      
      // Log action to system logs
      await logAction('report_exported_pdf', `Exported ${reportType} assessment report to PDF (${filename})`);
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
                <h1 className="text-2xl font-bold text-gray-900">Assessment Reports</h1>
                <p className="text-sm text-gray-600">Generate and export assessment and competency reports</p>
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
                  <option value="pass_rate">Pass Rate Analysis</option>
                  <option value="competency_summary">Competency Summary</option>
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

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Filter
                </label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_id}
                    </option>
                  ))}
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
                    <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.statistics.total}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Passed</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.statistics.passed}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.statistics.failed}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.statistics.pass_rate}%</p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'pass_rate' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Batch</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Passed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Failed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Pass Rate</th>
                        </>
                      )}
                      {reportType === 'competency_summary' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Competency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Total Assessed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Competent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Not Yet Competent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Percentage</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data && reportData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {reportType === 'pass_rate' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.program}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.batch}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{row.passed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{row.failed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.pass_rate}%</td>
                          </>
                        )}
                        {reportType === 'competency_summary' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.competency}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{row.competent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{row.not_competent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.percentage}%</td>
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

export default StaffAssessmentReports;
