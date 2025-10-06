import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdVisibility,
  MdEdit,
  MdDownload,
  MdRefresh,
  MdSchool,
  MdAssignment,
  MdTrendingUp,
  MdTrendingDown,
  MdCheckCircle,
  MdWarning,
  MdPrint,
  MdAdd,
  MdStar,
  MdBarChart
} from 'react-icons/md';

const StaffAcademicRecords = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data - replace with actual API calls
  const [academicRecords, setAcademicRecords] = useState([
    {
      id: 1,
      studentId: 'STU-2025-001',
      studentName: 'Juan Dela Cruz',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-09-15',
      subjects: [
        { name: 'Basic Welding Theory', grade: 92, remarks: 'Excellent', status: 'completed' },
        { name: 'Safety and Health', grade: 95, remarks: 'Outstanding', status: 'completed' },
        { name: 'Welding Practice', grade: 90, remarks: 'Very Good', status: 'completed' },
        { name: 'Equipment Handling', grade: 88, remarks: 'Good', status: 'in_progress' }
      ],
      overallGrade: 91.25,
      attendance: 95,
      assessments: {
        written: 90,
        practical: 92,
        final: 91
      },
      status: 'passing',
      gpa: 3.8
    },
    {
      id: 2,
      studentId: 'STU-2025-002',
      studentName: 'Maria Santos',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      enrollmentDate: '2025-09-20',
      subjects: [
        { name: 'Automotive Fundamentals', grade: 88, remarks: 'Good', status: 'completed' },
        { name: 'Engine Systems', grade: 85, remarks: 'Good', status: 'completed' },
        { name: 'Electrical Systems', grade: 90, remarks: 'Very Good', status: 'in_progress' },
        { name: 'Diagnostic Procedures', grade: 87, remarks: 'Good', status: 'in_progress' }
      ],
      overallGrade: 87.5,
      attendance: 88,
      assessments: {
        written: 86,
        practical: 89,
        final: 0
      },
      status: 'passing',
      gpa: 3.5
    },
    {
      id: 3,
      studentId: 'STU-2025-003',
      studentName: 'Pedro Reyes',
      program: 'Electronics NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-10',
      subjects: [
        { name: 'Electronics Theory', grade: 96, remarks: 'Outstanding', status: 'completed' },
        { name: 'Circuit Analysis', grade: 94, remarks: 'Excellent', status: 'completed' },
        { name: 'Digital Electronics', grade: 95, remarks: 'Excellent', status: 'completed' },
        { name: 'PCB Design', grade: 97, remarks: 'Outstanding', status: 'completed' }
      ],
      overallGrade: 95.5,
      attendance: 98,
      assessments: {
        written: 95,
        practical: 96,
        final: 95
      },
      status: 'passing',
      gpa: 4.0
    },
    {
      id: 4,
      studentId: 'STU-2025-004',
      studentName: 'Ana Garcia',
      program: 'Food Processing NCII',
      batch: 'Batch 03-2025',
      enrollmentDate: '2025-09-25',
      subjects: [
        { name: 'Food Safety', grade: 0, remarks: 'Not Started', status: 'not_started' },
        { name: 'Processing Methods', grade: 0, remarks: 'Not Started', status: 'not_started' },
        { name: 'Quality Control', grade: 0, remarks: 'Not Started', status: 'not_started' },
        { name: 'Packaging', grade: 0, remarks: 'Not Started', status: 'not_started' }
      ],
      overallGrade: 0,
      attendance: 0,
      assessments: {
        written: 0,
        practical: 0,
        final: 0
      },
      status: 'not_started',
      gpa: 0
    },
    {
      id: 5,
      studentId: 'STU-2025-005',
      studentName: 'Roberto Cruz',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-15',
      subjects: [
        { name: 'Basic Welding Theory', grade: 65, remarks: 'Fair', status: 'completed' },
        { name: 'Safety and Health', grade: 70, remarks: 'Satisfactory', status: 'completed' },
        { name: 'Welding Practice', grade: 60, remarks: 'Fair', status: 'completed' },
        { name: 'Equipment Handling', grade: 58, remarks: 'Needs Improvement', status: 'in_progress' }
      ],
      overallGrade: 63.25,
      attendance: 45,
      assessments: {
        written: 65,
        practical: 60,
        final: 0
      },
      status: 'at_risk',
      gpa: 2.0
    }
  ]);

  const programs = [
    'Welding NCII',
    'Automotive Servicing NCII',
    'Electronics NCII',
    'Food Processing NCII',
    'Plumbing NCII',
    'Carpentry NCII'
  ];

  const batches = [
    'Batch 01-2025',
    'Batch 02-2025',
    'Batch 03-2025',
    'Batch 04-2025'
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      passing: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Passing'
      },
      at_risk: {
        className: 'bg-red-100 text-red-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'At Risk'
      },
      not_started: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdAssignment className="h-4 w-4" />,
        label: 'Not Started'
      }
    };

    const config = statusConfig[status] || statusConfig.not_started;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 75) return 'text-yellow-600';
    if (grade > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getGradeLabel = (grade) => {
    if (grade >= 90) return 'Excellent';
    if (grade >= 80) return 'Very Good';
    if (grade >= 75) return 'Good';
    if (grade > 0) return 'Needs Improvement';
    return 'No Grade';
  };

  const getSubjectStatusBadge = (status) => {
    const statusConfig = {
      completed: { className: 'bg-green-100 text-green-700', label: 'Completed' },
      in_progress: { className: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      not_started: { className: 'bg-gray-100 text-gray-700', label: 'Not Started' }
    };

    const config = statusConfig[status] || statusConfig.not_started;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredRecords = academicRecords
    .filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || record.program === programFilter;
      const matchesBatch = batchFilter === 'all' || record.batch === batchFilter;
      const matchesPerformance = performanceFilter === 'all' || record.status === performanceFilter;
      return matchesSearch && matchesProgram && matchesBatch && matchesPerformance;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      } else if (sortBy === 'grade_high') {
        return b.overallGrade - a.overallGrade;
      } else if (sortBy === 'grade_low') {
        return a.overallGrade - b.overallGrade;
      }
      return 0;
    });

  const stats = {
    total: academicRecords.length,
    passing: academicRecords.filter(r => r.status === 'passing').length,
    atRisk: academicRecords.filter(r => r.status === 'at_risk').length,
    averageGrade: (academicRecords.reduce((sum, r) => sum + r.overallGrade, 0) / academicRecords.length).toFixed(2)
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
                <h1 className="text-xl font-bold">Academic Records</h1>
                <p className="text-sm text-blue-100">Track student grades and performance</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Add Grade</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Passing</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.passing}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.atRisk}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Average Grade</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.averageGrade}%</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
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
                    <option key={program} value={program}>{program}</option>
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
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Performance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance</label>
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Students</option>
                  <option value="passing">Passing</option>
                  <option value="at_risk">At Risk</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                <option value="name">Name (A-Z)</option>
                <option value="grade_high">Highest Grade</option>
                <option value="grade_low">Lowest Grade</option>
              </select>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <MdDownload className="h-5 w-5" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <MdPrint className="h-5 w-5" />
                Print
              </button>
            </div>
          </div>

          {/* Academic Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
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
                          <div className={`text-2xl font-bold ${getGradeColor(record.overallGrade)}`}>
                            {record.overallGrade > 0 ? `${record.overallGrade.toFixed(2)}%` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">{getGradeLabel(record.overallGrade)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MdStar className="h-5 w-5 text-yellow-500" />
                            <span className="text-lg font-semibold text-gray-800">
                              {record.gpa > 0 ? record.gpa.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-semibold ${getGradeColor(record.attendance)}`}>
                            {record.attendance}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
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
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit Grades"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-700"
                              title="View Report"
                            >
                              <MdBarChart className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No academic records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRecords.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredRecords.length}</span> of{' '}
                  <span className="font-medium">{academicRecords.length}</span> records
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.studentName}</h2>
                  <p className="text-blue-100">{selectedStudent.studentId} • {selectedStudent.program}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedStudent.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Overall Grade</p>
                  <p className={`text-3xl font-bold mt-2 ${getGradeColor(selectedStudent.overallGrade)}`}>
                    {selectedStudent.overallGrade > 0 ? `${selectedStudent.overallGrade.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-600 font-medium">GPA</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {selectedStudent.gpa > 0 ? selectedStudent.gpa.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Attendance</p>
                  <p className={`text-3xl font-bold mt-2 ${getGradeColor(selectedStudent.attendance)}`}>
                    {selectedStudent.attendance}%
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-600 font-medium">Subjects</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {selectedStudent.subjects.length}
                  </p>
                </div>
              </div>

              {/* Assessment Scores */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assessment Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Written Exam</span>
                      <span className={`text-xl font-bold ${getGradeColor(selectedStudent.assessments.written)}`}>
                        {selectedStudent.assessments.written > 0 ? `${selectedStudent.assessments.written}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${selectedStudent.assessments.written >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${selectedStudent.assessments.written}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Practical Exam</span>
                      <span className={`text-xl font-bold ${getGradeColor(selectedStudent.assessments.practical)}`}>
                        {selectedStudent.assessments.practical > 0 ? `${selectedStudent.assessments.practical}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${selectedStudent.assessments.practical >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${selectedStudent.assessments.practical}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Final Assessment</span>
                      <span className={`text-xl font-bold ${getGradeColor(selectedStudent.assessments.final)}`}>
                        {selectedStudent.assessments.final > 0 ? `${selectedStudent.assessments.final}%` : 'Pending'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${selectedStudent.assessments.final >= 75 ? 'bg-green-500' : 'bg-gray-300'}`}
                        style={{ width: `${selectedStudent.assessments.final}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Grades */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Subject Grades</h3>
                <div className="space-y-3">
                  {selectedStudent.subjects.map((subject, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getSubjectStatusBadge(subject.status)}
                            <span className="text-xs text-gray-500">{subject.remarks}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-bold ${getGradeColor(subject.grade)}`}>
                            {subject.grade > 0 ? `${subject.grade}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {subject.grade > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${subject.grade >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${subject.grade}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Grades
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Report Card
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Download Transcript
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="ml-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAcademicRecords;
