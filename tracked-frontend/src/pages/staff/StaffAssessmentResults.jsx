import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdAssessment,
  MdTrendingUp,
} from 'react-icons/md';

const StaffAssessmentResults = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/public/programs', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrograms(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBatches(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch assessment results on mount and when filters change
  useEffect(() => {
    fetchPrograms();
    fetchBatches();
    fetchAssessmentResults();
  }, []);

  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const params = new URLSearchParams();
      
      if (programFilter !== 'all') params.append('program_id', programFilter);
      if (batchFilter !== 'all') params.append('batch_id', batchFilter);
      
      const response = await fetch(`http://localhost:8000/api/staff/assessment-results?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setAssessments(data.data || []);
      } else {
        toast.error('Failed to load TESDA assessment results');
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      toast.error('Failed to load TESDA assessment results: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments
    .filter(assessment => {
      // Search by student name or ID
      const matchesSearch = searchTerm === '' || 
        assessment.results?.some(r => 
          r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        assessment.assessor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by program
      const matchesProgram = programFilter === 'all' || 
        assessment.program === programs.find(p => p.id === parseInt(programFilter))?.title;
      
      // Filter by batch
      const matchesBatch = batchFilter === 'all' || 
        assessment.batch === batches.find(b => b.id === parseInt(batchFilter))?.batch_id;
      
      return matchesSearch && matchesProgram && matchesBatch;
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });

  const stats = {
    totalAssessments: assessments.length,
    completedAssessments: assessments.filter(a => a.status === 'completed').length,
    averagePassRate: assessments.filter(a => a.status === 'completed').length > 0 
      ? (assessments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.passRate, 0) / assessments.filter(a => a.status === 'completed').length).toFixed(1)
      : 0,
    pendingAssessments: assessments.filter(a => a.status === 'scheduled' || a.status === 'ongoing').length
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
                <h1 className="text-xl font-bold">TESDA Assessment Results</h1>
                <p className="text-sm text-blue-100">Track and manage TESDA competency assessments</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Report Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">TESDA Assessment Results Report</h2>
              <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdAssessment className="h-5 w-5 text-blue-600" />
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">Total</p>
                </div>
                <p className="text-xl font-bold text-blue-900">{assessments.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-xs uppercase tracking-wide text-green-600 font-medium">Competent</p>
                </div>
                <p className="text-xl font-bold text-green-900">
                  {assessments.filter(a => a.results?.[0]?.result === 'Passed').length}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdCancel className="h-5 w-5 text-red-600" />
                  <p className="text-xs uppercase tracking-wide text-red-600 font-medium">Not Competent</p>
                </div>
                <p className="text-xl font-bold text-red-900">
                  {assessments.filter(a => a.results?.[0]?.result === 'Failed').length}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdTrendingUp className="h-5 w-5 text-purple-600" />
                  <p className="text-xs uppercase tracking-wide text-purple-600 font-medium">Pass Rate</p>
                </div>
                <p className="text-xl font-bold text-purple-900">
                  {assessments.length > 0 
                    ? ((assessments.filter(a => a.results?.[0]?.result === 'Passed').length / assessments.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Program</label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.title}</option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Batch</label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.batch_id}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button 
                  onClick={fetchAssessmentResults}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <MdRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Results Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TESDA Assessor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <MdRefresh className="h-5 w-5 animate-spin" />
                          <span>Loading assessment results...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map((assessment) => (
                      assessment.results?.map((result) => (
                        <tr key={`${assessment.id}-${result.studentId}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.studentName
                                ? result.studentName.split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  ).join(' ')
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.studentId || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{assessment.program || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assessment.batch || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.assessor
                                ? assessment.assessor.split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  ).join(' ')
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              result.result === 'Passed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.result === 'Passed' ? 'Competent' : 'Not Competent'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.date ? new Date(assessment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">{result.remarks || '-'}</div>
                          </td>
                        </tr>
                      ))
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <MdAssessment className="h-12 w-12 text-gray-300" />
                          <p>No assessment results found matching your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {filteredAssessments.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredAssessments.reduce((sum, a) => sum + (a.results?.length || 0), 0)}</span> assessment records
                </div>
              </div>
            )}
          </div>
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

export default StaffAssessmentResults;
