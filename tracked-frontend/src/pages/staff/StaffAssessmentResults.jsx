import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdPrint,
  MdCheckCircle,
  MdWarning,
  MdCancel,
  MdClose,
  MdAssignment,
  MdGrade,
  MdTrendingUp,
  MdTrendingDown,
  MdPeople,
  MdCalendarToday,
  MdBarChart,
  MdAssessment,
  MdStar,
  MdFilterList,
  MdPending
} from 'react-icons/md';

const StaffAssessmentResults = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Fetch assessment results on mount and when filters change
  useEffect(() => {
    fetchAssessmentResults();
  }, []);

  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const params = new URLSearchParams();
      
      if (programFilter !== 'all') params.append('program_id', programFilter);
      if (batchFilter !== 'all') params.append('batch_id', batchFilter);
      if (assessmentTypeFilter !== 'all') params.append('assessment_type', assessmentTypeFilter.toLowerCase());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
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
        setPrograms(data.programs || []);
        setBatches(data.batches || []);
      } else {
        toast.error('Failed to load assessment results');
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      toast.error('Failed to load assessment results: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Completed'
      },
      ongoing: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdAssessment className="h-4 w-4" />,
        label: 'Ongoing'
      },
      scheduled: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdCalendarToday className="h-4 w-4" />,
        label: 'Scheduled'
      },
      cancelled: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getResultBadge = (result) => {
    return result === 'Passed' ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <MdCheckCircle className="h-3 w-3" />
        Passed
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <MdCancel className="h-3 w-3" />
        Failed
      </span>
    );
  };

  const getScoreColor = (score, passingScore) => {
    if (score === 0) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= passingScore) return 'text-blue-600';
    return 'text-red-600';
  };

  const getTypeBadge = (type) => {
    return type === 'Practical' ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Practical
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Written
      </span>
    );
  };

  const filteredAssessments = assessments
    .filter(assessment => {
      const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.assessmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.assessor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || assessment.program === programFilter;
      const matchesBatch = batchFilter === 'all' || assessment.batch === batchFilter;
      const matchesType = assessmentTypeFilter === 'all' || assessment.assessmentType === assessmentTypeFilter;
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      return matchesSearch && matchesProgram && matchesBatch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'passRate') {
        return b.passRate - a.passRate;
      }
      return 0;
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
                <h1 className="text-xl font-bold">Assessment Results</h1>
                <p className="text-sm text-blue-100">Track and manage student assessment outcomes</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">New Assessment</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdAssignment className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Assessments</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalAssessments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-xl font-bold text-green-600">{stats.completedAssessments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdBarChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Avg Pass Rate</p>
                  <p className="text-xl font-bold text-purple-600">{stats.averagePassRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <MdPending className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pendingAssessments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
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
                    <option key={program.id} value={program.id}>{program.title}</option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.batch_id}>{batch.batch_id}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={assessmentTypeFilter}
                  onChange={(e) => setAssessmentTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Types</option>
                  <option value="Written">Written</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={fetchAssessmentResults}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Export
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="passRate">Pass Rate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assessments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Assessor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pass Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <MdRefresh className="h-6 w-6 animate-spin mr-2" />
                          Loading assessment results...
                        </div>
                      </td>
                    </tr>
                  ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                          <div className="text-xs text-gray-500">{assessment.assessmentCode}</div>
                          <div className="flex gap-2 mt-1">
                            {getTypeBadge(assessment.assessmentType)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{assessment.program}</div>
                          <div className="text-xs text-gray-500">{assessment.batch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{assessment.date}</div>
                          <div className="text-xs text-gray-500">{assessment.assessor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assessment.assessed}/{assessment.totalStudents}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                assessment.assessed === assessment.totalStudents
                                  ? 'bg-green-600'
                                  : assessment.assessed > 0
                                    ? 'bg-blue-600'
                                    : 'bg-gray-400'
                              }`}
                              style={{ width: `${(assessment.assessed / assessment.totalStudents) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold ${getScoreColor(assessment.averageScore, assessment.passingScore)}`}>
                            {assessment.averageScore > 0 ? `${assessment.averageScore.toFixed(1)}%` : '-'}
                          </div>
                          {assessment.averageScore > 0 && (
                            <div className="text-xs text-gray-500">
                              Passing: {assessment.passingScore}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assessment.passRate > 0 ? (
                            <>
                              <div className={`text-lg font-bold ${
                                assessment.passRate >= 90 ? 'text-green-600' :
                                assessment.passRate >= 75 ? 'text-blue-600' :
                                'text-red-600'
                              }`}>
                                {assessment.passRate.toFixed(1)}%
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                {assessment.passRate >= 75 ? (
                                  <MdTrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <MdTrendingDown className="h-3 w-3 text-red-600" />
                                )}
                                {Math.round((assessment.passRate / 100) * assessment.assessed)} passed
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(assessment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedAssessment(assessment)}
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit Assessment"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-700"
                              title="Enter Scores"
                            >
                              <MdGrade className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No assessment results found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAssessments.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredAssessments.length}</span> of{' '}
                  <span className="font-medium">{assessments.length}</span> assessments
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

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedAssessment.title}</h2>
                  <p className="text-blue-100">{selectedAssessment.assessmentCode}</p>
                  <p className="text-blue-100 mt-1">{selectedAssessment.program} • {selectedAssessment.batch}</p>
                  <div className="flex gap-2 mt-3">
                    {getStatusBadge(selectedAssessment.status)}
                    {getTypeBadge(selectedAssessment.assessmentType)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Assessment Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-lg font-bold text-gray-800">{selectedAssessment.date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Assessor</p>
                  <p className="text-lg font-bold text-gray-800 truncate">{selectedAssessment.assessor}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-lg font-bold text-gray-800">{selectedAssessment.totalStudents}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Passing Score</p>
                  <p className="text-lg font-bold text-gray-800">{selectedAssessment.passingScore}%</p>
                </div>
              </div>

              {/* Statistics */}
              {selectedAssessment.status !== 'scheduled' && selectedAssessment.averageScore > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdBarChart className="h-5 w-5 text-tracked-primary" />
                    Assessment Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${getScoreColor(selectedAssessment.averageScore, selectedAssessment.passingScore)}`}>
                        {selectedAssessment.averageScore.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Average Score</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${
                        selectedAssessment.passRate >= 90 ? 'text-green-600' :
                        selectedAssessment.passRate >= 75 ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {selectedAssessment.passRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Pass Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{selectedAssessment.highestScore}%</p>
                      <p className="text-sm text-gray-600 mt-1">Highest Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{selectedAssessment.lowestScore}%</p>
                      <p className="text-sm text-gray-600 mt-1">Lowest Score</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Results */}
              {selectedAssessment.results.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdPeople className="h-5 w-5 text-tracked-primary" />
                    Student Results ({selectedAssessment.results.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedAssessment.results.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{result.studentId}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.studentName}</td>
                            <td className="px-4 py-3">
                              <span className={`text-lg font-bold ${getScoreColor(result.score, selectedAssessment.passingScore)}`}>
                                {result.score}%
                              </span>
                            </td>
                            <td className="px-4 py-3">{getResultBadge(result.result)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{result.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <MdAssignment className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg">No student results recorded yet.</p>
                  <p className="text-sm mt-2">Results will appear here once the assessment is completed.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                {selectedAssessment.status !== 'completed' && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                    <MdGrade className="h-5 w-5" />
                    Enter Scores
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Assessment
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Results
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Export
                </button>
                <button 
                  onClick={() => setSelectedAssessment(null)}
                  className="ml-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
