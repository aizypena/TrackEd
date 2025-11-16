import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSearch,
  MdFileDownload,
  MdPrint,
  MdRefresh,
  MdAssessment,
  MdCheckCircle,
  MdPeople,
  MdTrendingUp,
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

const AdminAssessmentResults = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // State for actual data
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAssessments: 0,
    passRate: 0,
    averageScore: 0,
    pendingAssessments: 0,
  });
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/public/programs', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrograms(data.data.map(p => ({ id: p.id, name: p.title })));
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/staff/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBatches(data.data.map(b => ({ id: b.id, name: b.batch_id })));
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch assessment results from backend
  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/assessment-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssessmentResults(data.data || []);
          setStatistics(data.statistics || {});
        } else {
          toast.error('Failed to load assessment results');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to load data (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      toast.error('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchBatches();
    fetchAssessmentResults();
  }, []);

  const handleExport = () => {
    try {
      // Get filtered results
      const filteredResults = assessmentResults.filter(result => {
        const matchesProgram = selectedProgram === 'all' || result.program_id === parseInt(selectedProgram);
        const matchesBatch = selectedBatch === 'all' || result.batch_id === parseInt(selectedBatch);
        const matchesSearch = searchQuery === '' || 
          result.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesProgram && matchesBatch && matchesSearch;
      });

      if (filteredResults.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Create CSV header
      const headers = ['Student Name', 'Student ID', 'Program', 'Batch', 'TESDA Assessor', 'Result', 'Assessment Date', 'Remarks'];
      
      // Create CSV rows
      const csvRows = filteredResults.map(result => {
        const row = [
          result.student_name 
            ? result.student_name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ')
            : 'N/A',
          result.student_id || 'N/A',
          result.program_name || result.program?.title || 'N/A',
          result.batch_name || result.batch?.name || 'N/A',
          result.tesda_assessor || 'N/A',
          result.result 
            ? result.result.replace(/_/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ')
            : 'Pending',
          result.assessment_date ? new Date(result.assessment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A',
          result.remarks || '-'
        ];
        
        // Escape commas and quotes in CSV
        return row.map(field => {
          const stringField = String(field);
          if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        }).join(',');
      });

      // Combine header and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `TESDA_Assessment_Results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${filteredResults.length} records to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    fetchAssessmentResults();
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
                <h1 className="text-2xl font-semibold text-gray-900">Assessment Results</h1>
                <p className="text-sm text-gray-500">View and analyze student performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Report Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">TESDA Assessment Results Report</h2>
                <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Assessments</p>
                  <p className="text-xl font-bold text-gray-900">
                    {loading ? '...' : statistics.totalAssessments}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Pass Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {loading ? '...' : `${statistics.passRate.toFixed(1)}%`}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Average Score</p>
                  <p className="text-xl font-bold text-blue-600">
                    {loading ? '...' : `${statistics.averageScore.toFixed(1)}%`}
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-xl font-bold text-amber-600">
                    {loading ? '...' : statistics.pendingAssessments}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Results</h3>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="all">All Programs</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="all">All Batches</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter student name..."
                        className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdSearch className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:mt-6">
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    title="Refresh data"
                  >
                    <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Assessment Results Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Assessment Results</h3>
              </div>
<div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Student Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Student ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Program
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Batch
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        TESDA Assessor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Result
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Assessment Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                          Loading assessment results...
                        </td>
                      </tr>
                    ) : assessmentResults.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                          No assessment results found
                        </td>
                      </tr>
                    ) : (
                      assessmentResults
                        .filter(result => {
                          const matchesProgram = selectedProgram === 'all' || result.program_id === parseInt(selectedProgram);
                          const matchesBatch = selectedBatch === 'all' || result.batch_id === parseInt(selectedBatch);
                          const matchesSearch = searchQuery === '' || 
                            result.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesProgram && matchesBatch && matchesSearch;
                        })
                        .map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.student_name 
                                ? result.student_name.split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  ).join(' ')
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.student_id || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.program_name || result.program?.title || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.batch_name || result.batch?.name || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.tesda_assessor || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              result.result?.toLowerCase() === 'competent' 
                                ? 'bg-green-100 text-green-800' 
                                : result.result?.toLowerCase().includes('not') || result.result?.toLowerCase().includes('competent')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {result.result 
                                ? result.result.replace(/_/g, ' ').split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  ).join(' ')
                                : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.assessment_date ? new Date(result.assessment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={result.remarks}>
                              {result.remarks || '-'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Showing {assessmentResults.filter(result => {
                      const matchesProgram = selectedProgram === 'all' || result.program_id === parseInt(selectedProgram);
                      const matchesBatch = selectedBatch === 'all' || result.batch_id === parseInt(selectedBatch);
                      const matchesSearch = searchQuery === '' || 
                        result.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        result.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesProgram && matchesBatch && matchesSearch;
                    }).length} of {assessmentResults.length} entries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminAssessmentResults;
