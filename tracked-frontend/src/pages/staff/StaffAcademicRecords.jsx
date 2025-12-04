import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
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
  MdBarChart,
  MdClose
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
  const [academicRecords, setAcademicRecords] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const gradeCategories = [
    { id: 'written', label: 'Written Test', weight: 0.2 },
    { id: 'oral', label: 'Oral Questioning', weight: 0.2 },
    { id: 'demonstration', label: 'Demonstration', weight: 0.4 },
    { id: 'observation', label: 'Observation', weight: 0.2 },
  ];

  useEffect(() => {
    fetchAcademicRecords();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      // Fetch all students from enrollments endpoint
      const studentsResponse = await fetch('http://localhost:8000/api/staff/enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsResponse.json();
      const students = studentsData.data || studentsData.enrollments || studentsData || [];

      // Fetch all grades
      const gradesResponse = await fetch('http://localhost:8000/api/staff/grades', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!gradesResponse.ok) {
        throw new Error('Failed to fetch grades');
      }

      const gradesData = await gradesResponse.json();
      const grades = gradesData.data || gradesData.grades || gradesData || [];
      
      // Set programs and batches for filters
      if (gradesData.programs) {
        setPrograms(gradesData.programs);
      }
      if (gradesData.batches) {
        setBatches(gradesData.batches);
      }

      // Group grades by user
      const userGradesMap = {};
      grades.forEach(grade => {
        const userId = grade.user_id;
        if (!userGradesMap[userId]) {
          userGradesMap[userId] = [];
        }
        userGradesMap[userId].push(grade);
      });

      // Create records for all students
      const records = [];
      students.forEach(student => {
        const userGrades = userGradesMap[student.id] || [];

        // Organize grades by assessment type
        const gradesByType = {
          written: null,
          oral: null,
          demonstration: null,
          observation: null
        };

        userGrades.forEach(grade => {
          const type = grade.assessment_type;
          if (gradesByType.hasOwnProperty(type)) {
            gradesByType[type] = parseFloat(grade.percentage || 0);
          }
        });

        // Calculate weighted average only if all grades are present
        let averagePercentage = 0;
        const allGradesPresent = gradeCategories.every(category => {
          const grade = gradesByType[category.id];
          return grade !== null && grade !== undefined;
        });

        if (allGradesPresent) {
          let weightedSum = 0;
          gradeCategories.forEach(category => {
            const grade = gradesByType[category.id];
            weightedSum += grade * category.weight;
          });
          averagePercentage = weightedSum.toFixed(2);
        }

        // Calculate overall statistics
        const passedCount = userGrades.filter(g => g.status === 'passed').length;
        const failedCount = userGrades.filter(g => g.status === 'failed').length;

        // Determine overall status
        let status = 'pending';
        if (userGrades.length > 0) {
          if (failedCount === 0 && passedCount > 0) {
            status = 'competent';
          } else if (failedCount > 0) {
            status = 'not_competent';
          }
        }

        records.push({
          id: student.id,
          studentId: student.student_id || 'N/A',
          studentName: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          program: student.program || 'N/A',
          batch: student.batch || 'N/A',
          enrollmentDate: student.enrollment_date || 'N/A',
          assessmentDate: userGrades[0]?.graded_at || userGrades[0]?.created_at || 'N/A',
          totalAssessments: userGrades.length,
          passedAssessments: passedCount,
          failedAssessments: failedCount,
          averageScore: averagePercentage,
          gradesByType: gradesByType,
          status: status,
          email: student.email || 'N/A',
          address: 'N/A',
          grades: userGrades
        });
      });

      setAcademicRecords(records);
      toast.success('Academic records loaded successfully');
    } catch (error) {
      console.error('Error fetching academic records:', error);
      toast.error('Failed to load academic records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      competent: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Competent'
      },
      not_competent: {
        className: 'bg-red-100 text-red-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Not Competent'
      },
      pending: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdAssignment className="h-4 w-4" />,
        label: 'Pending'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const handleExport = () => {
    try {
      // Prepare summary data
      const summaryData = filteredRecords.map(record => ({
        'Student ID': record.studentId,
        'Student Name': record.studentName,
        'Program': record.program,
        'Batch': record.batch,
        'Total Assessments': record.totalAssessments,
        'Average Score': record.averageScore > 0 ? `${record.averageScore}%` : 'N/A',
        'Passed': record.passedAssessments,
        'Failed': record.failedAssessments,
        'Status': record.status === 'competent' ? 'Competent' : record.status === 'not_competent' ? 'Not Competent' : 'Pending'
      }));

      // Prepare detailed grades data
      const detailedData = [];
      filteredRecords.forEach(record => {
        if (record.grades && record.grades.length > 0) {
          record.grades.forEach(grade => {
            detailedData.push({
              'Student ID': record.studentId,
              'Student Name': record.studentName,
              'Assessment Title': grade.assessment_title,
              'Assessment Type': grade.assessment_type,
              'Score': grade.score,
              'Total Points': grade.total_points,
              'Percentage': `${grade.percentage}%`,
              'Passing Score': `${grade.passing_score}%`,
              'Status': grade.status,
              'Attempt': grade.attempt_number || 1,
              'Batch': grade.batch_id || 'N/A',
              'Graded Date': grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : 'N/A',
              'Feedback': grade.feedback || 'N/A'
            });
          });
        }
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add summary sheet
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Add detailed grades sheet
      if (detailedData.length > 0) {
        const detailedWs = XLSX.utils.json_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Grades');
      }

      // Generate filename with current date
      const filename = `Academic_Records_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success('Academic records exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export academic records');
    }
  };

  const filteredRecords = academicRecords
    .filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Fix program filter comparison
      let matchesProgram = programFilter === 'all';
      if (!matchesProgram && programFilter) {
        const selectedProgram = programs.find(p => p.id === parseInt(programFilter));
        matchesProgram = selectedProgram ? record.program === selectedProgram.title : record.program === programFilter;
      }
      
      // Fix batch filter comparison
      let matchesBatch = batchFilter === 'all';
      if (!matchesBatch && batchFilter) {
        const selectedBatch = batches.find(b => b.id === parseInt(batchFilter));
        matchesBatch = selectedBatch ? record.batch === selectedBatch.batch_id : record.batch === batchFilter;
      }
      
      const matchesPerformance = performanceFilter === 'all' || record.status === performanceFilter;
      return matchesSearch && matchesProgram && matchesBatch && matchesPerformance;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      } else if (sortBy === 'score_high') {
        return b.averageScore - a.averageScore;
      } else if (sortBy === 'score_low') {
        return a.averageScore - b.averageScore;
      }
      return 0;
    });

  const stats = {
    total: academicRecords.length,
    totalAssessments: academicRecords.reduce((sum, r) => sum + r.totalAssessments, 0),
    passed: academicRecords.reduce((sum, r) => sum + r.passedAssessments, 0),
    failed: academicRecords.reduce((sum, r) => sum + r.failedAssessments, 0)
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
              <p className="text-sm text-gray-500 font-medium">Total Assessments</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalAssessments}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Passed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.passed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
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
                    <option key={batch.id} value={batch.id}>{batch.batch_id}</option>
                  ))}
                </select>
              </div>

              {/* Performance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Students</option>
                  <option value="competent">Competent</option>
                  <option value="not_competent">Not Competent</option>
                  <option value="pending">Pending</option>
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
                <option value="score_high">Highest Score</option>
                <option value="score_low">Lowest Score</option>
              </select>
              
              <button 
                onClick={fetchAcademicRecords}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
              >
                <MdRefresh className="h-5 w-5" />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <MdDownload className="h-5 w-5" />
                Export
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
                    {gradeCategories.map((category) => (
                      <th key={category.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {category.label}
                        <span className="block text-gray-400">({(category.weight * 100)}%)</span>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Grade
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
                        Loading academic records...
                      </td>
                    </tr>
                  ) : filteredRecords.length > 0 ? (
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
                        {gradeCategories.map((category) => {
                          const grade = record.gradesByType?.[category.id];
                          return (
                            <td key={category.id} className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {grade !== null && grade !== undefined
                                  ? `${grade}%`
                                  : '-'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.averageScore > 0 ? `${record.averageScore}%` : 'N/A'}
                          </div>
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
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              {/* Student Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="text-base font-medium text-gray-900">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Program</p>
                    <p className="text-base font-medium text-gray-900">{selectedStudent.program}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Batch</p>
                    <p className="text-base font-medium text-gray-900">{selectedStudent.batch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Enrollment Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Total Assessments</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedStudent.totalAssessments || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Average Score</p>
                    <p className={`text-3xl font-bold ${getGradeColor(selectedStudent.averageScore)}`}>
                      {selectedStudent.averageScore > 0 ? `${selectedStudent.averageScore}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Passed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {selectedStudent.passedAssessments || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Failed</p>
                    <p className="text-3xl font-bold text-red-600">
                      {selectedStudent.failedAssessments || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Grades */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Grades</h3>
                <div className="space-y-3">
                  {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                    selectedStudent.grades.map((grade, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{grade.assessment_title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                grade.assessment_type === 'written' ? 'bg-blue-100 text-blue-800' :
                                grade.assessment_type === 'oral' ? 'bg-purple-100 text-purple-800' :
                                grade.assessment_type === 'demonstration' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {grade.assessment_type.charAt(0).toUpperCase() + grade.assessment_type.slice(1)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                grade.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {grade.status === 'passed' ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-3xl font-bold ${getGradeColor(grade.percentage)}`}>
                              {grade.percentage}%
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {grade.score}/{grade.total_points} points
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Passing Score:</span>
                            <span className="ml-2 font-medium text-gray-900">{grade.passing_score}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Graded:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Attempt:</span>
                            <span className="ml-2 font-medium text-gray-900">#{grade.attempt_number || 1}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Batch:</span>
                            <span className="ml-2 font-medium text-gray-900">{grade.batch_id || 'N/A'}</span>
                          </div>
                        </div>
                        {grade.feedback && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-900">{grade.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No grades available for this student
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Certificate
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Download Report
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
      
      <Toaster position="top-right" />
    </div>
  );
};

export default StaffAcademicRecords;
