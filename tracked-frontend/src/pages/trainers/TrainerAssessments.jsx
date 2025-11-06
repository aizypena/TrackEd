import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdDownload,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdPendingActions,
  MdCalendarToday,
  MdDescription,
  MdBarChart,
  MdCancel
} from 'react-icons/md';

const TrainerAssessments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const assessmentTypes = [
    { value: 'written', label: 'Written Test' },
    { value: 'oral', label: 'Oral Questioning' },
    { value: 'demonstration', label: 'Demonstration' },
    { value: 'observation', label: 'Observation' },
  ];

  useEffect(() => {
    fetchAssessmentResults();
  }, []);

  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('trainerToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://api.smitracked.cloud/api/trainer/assessment-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAssessmentResults(data.data || []);
        setPrograms(data.programs || []);
        setBatches(data.batches || []);
      } else {
        setError(data.message || 'Failed to load assessment results');
      }
    } catch (err) {
      console.error('Error fetching assessment results:', err);
      setError(err.message || 'Failed to load assessment results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = assessmentResults.filter(result => {
    const matchesProgram = selectedProgram === 'all' || result.program_id === parseInt(selectedProgram);
    const matchesBatch = selectedBatch === 'all' || result.batch_id === selectedBatch;
    const matchesAssessment = selectedAssessment === 'all' || result.assessment_type === selectedAssessment;
    const matchesSearch = result.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.student_id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesBatch && matchesAssessment && matchesSearch;
  });

  const getCompetencyStatus = (percentage) => {
    if (percentage === null || percentage === undefined) return null;
    return percentage >= 85 ? 'competent' : 'not-competent';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'competent':
        return 'bg-green-100 text-green-800';
      case 'not-competent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'competent':
        return <MdCheckCircle className="w-4 h-4" />;
      case 'not-competent':
        return <MdCancel className="w-4 h-4" />;
      default:
        return <MdPendingActions className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Assessment Results</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                <MdDownload className="h-5 w-5 mr-2" />
                Export Results
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Type Filter */}
              <div className="relative">
                <select
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Assessments</option>
                  {assessmentTypes.map((assessment) => (
                    <option key={assessment.value} value={assessment.value}>
                      {assessment.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading assessment results...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MdWarning className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Assessment Results</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchAssessmentResults}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result) => {
                      const competencyStatus = getCompetencyStatus(result.percentage);
                      return (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">{result.student_name}</div>
                              <div className="text-sm text-gray-500">{result.student_id}</div>
                              <div className="text-xs text-gray-400">{result.program_name || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{result.batch_name || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{result.assessment_title}</div>
                            <div className="text-xs text-gray-500 capitalize">{result.assessment_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {competencyStatus ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(competencyStatus)}`}>
                                  {getStatusIcon(competencyStatus)}
                                  <span className="ml-1 capitalize">{competencyStatus === 'not-competent' ? 'Not Competent' : 'Competent'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {getStatusIcon(null)}
                                  <span className="ml-1">Not Assessed</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.score !== null && result.score !== undefined ? (
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium ${getScoreColor(result.percentage)}`}>
                                  {result.score}/{result.total_points}
                                </span>
                                <span className="text-xs text-gray-500">{result.percentage}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(result.graded_at)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No assessment results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerAssessments;
