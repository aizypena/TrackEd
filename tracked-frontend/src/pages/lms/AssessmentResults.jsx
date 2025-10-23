import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdGrade, 
  MdCalendarToday, 
  MdTimer, 
  MdQuiz, 
  MdCheckCircle, 
  MdCancel,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdDownload,
  MdPrint,
  MdSearch,
  MdChevronRight,
  MdStars,
  MdSchool,
  MdAssessment,
  MdBarChart,
  MdPieChart,
  MdShowChart
} from 'react-icons/md';

const AssessmentResults = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Mock assessment results data
  const assessmentResults = [
    {
      id: 1,
      title: 'Basic Knife Skills Assessment',
      course: 'Cookery NC II',
      courseCode: 'CK101',
      type: 'Practical Exam',
      dateTaken: '2024-09-15',
      duration: 120,
      totalMarks: 100,
      obtainedMarks: 88,
      passingMarks: 75,
      status: 'passed',
      grade: 'A',
      attempt: 1,
      maxAttempts: 2,
      instructor: 'Chef Roberto Martinez',
      feedback: 'Excellent knife handling techniques. Good mise en place organization. Continue practicing julienne cuts for consistency.',
      breakdown: {
        practical: { obtained: 50, total: 60 },
        theory: { obtained: 25, total: 25 },
        safety: { obtained: 13, total: 15 }
      },
      semester: 'First Semester 2024-2025'
    },
    {
      id: 2,
      title: 'Food Safety and Sanitation Quiz',
      course: 'Cookery NC II',
      courseCode: 'CK101',
      type: 'Online Quiz',
      dateTaken: '2024-09-10',
      duration: 45,
      totalMarks: 50,
      obtainedMarks: 47,
      passingMarks: 35,
      status: 'passed',
      grade: 'A+',
      attempt: 1,
      maxAttempts: 3,
      instructor: 'Ms. Anna Cruz',
      feedback: 'Outstanding performance in food safety protocols. Perfect understanding of HACCP principles.',
      breakdown: {
        identification: { obtained: 20, total: 20 },
        procedures: { obtained: 15, total: 15 },
        regulations: { obtained: 12, total: 15 }
      },
      semester: 'First Semester 2024-2025'
    },
    {
      id: 3,
      title: 'Cocktail Preparation Practical',
      course: 'Bartending NC II',
      courseCode: 'BT201',
      type: 'Practical Exam',
      dateTaken: '2024-09-08',
      duration: 90,
      totalMarks: 100,
      obtainedMarks: 72,
      passingMarks: 75,
      status: 'failed',
      grade: 'C',
      attempt: 1,
      maxAttempts: 2,
      instructor: 'Mr. David Tan',
      feedback: 'Good technique but needs improvement in garnish presentation and timing. Retake available.',
      breakdown: {
        preparation: { obtained: 35, total: 40 },
        presentation: { obtained: 20, total: 30 },
        timing: { obtained: 17, total: 30 }
      },
      semester: 'First Semester 2024-2025'
    },
    {
      id: 4,
      title: 'Bread Making Fundamentals',
      course: 'Bread and Pastry Production NC II',
      courseCode: 'BP301',
      type: 'Practical Exam',
      dateTaken: '2024-09-05',
      duration: 180,
      totalMarks: 100,
      obtainedMarks: 91,
      passingMarks: 75,
      status: 'passed',
      grade: 'A+',
      attempt: 1,
      maxAttempts: 2,
      instructor: 'Chef Maria Gonzales',
      feedback: 'Exceptional bread texture and flavor. Professional presentation. Keep up the excellent work!',
      breakdown: {
        technique: { obtained: 35, total: 35 },
        final_product: { obtained: 30, total: 30 },
        cleanliness: { obtained: 26, total: 35 }
      },
      semester: 'First Semester 2024-2025'
    }
  ];

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'CK101', name: 'Cookery NC II' },
    { id: 'BT201', name: 'Bartending NC II' },
    { id: 'BP301', name: 'Bread and Pastry Production NC II' },
    { id: 'FBS401', name: 'Food & Beverage Services NC II' }
  ];

  const semesters = [
    { id: 'current', name: 'Current Semester' },
    { id: '2024-1', name: 'First Semester 2024-2025' },
    { id: '2023-2', name: 'Second Semester 2023-2024' },
    { id: '2023-1', name: 'First Semester 2023-2024' }
  ];

  // Filter results based on selected filters
  const filteredResults = assessmentResults.filter(result => {
    const matchesCourse = selectedCourse === 'all' || result.courseCode === selectedCourse;
    const matchesStatus = selectedStatus === 'all' || result.status === selectedStatus;
    const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalAssessments = filteredResults.length;
  const passedAssessments = filteredResults.filter(r => r.status === 'passed').length;
  const failedAssessments = filteredResults.filter(r => r.status === 'failed').length;
  const averageScore = totalAssessments > 0 
    ? (filteredResults.reduce((sum, r) => sum + ((r.obtainedMarks / r.totalMarks) * 100), 0) / totalAssessments).toFixed(1)
    : 0;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getGradeColor = (status, grade) => {
    if (status === 'passed') {
      if (grade === 'A+' || grade === 'A') return 'text-green-700 bg-green-100 border-green-200';
      if (grade === 'B+' || grade === 'B') return 'text-blue-700 bg-blue-100 border-blue-200';
      return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    }
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getStatusIcon = (status) => {
    return status === 'passed' 
      ? <MdCheckCircle className="h-5 w-5 text-green-600" />
      : <MdCancel className="h-5 w-5 text-red-600" />;
  };

  const exportResults = () => {
    console.log('Exporting results...');
  };

  const printResults = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <MdFilterList className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdStars className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
                    <p className="text-sm text-gray-600">Track your academic performance and progress</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{totalAssessments} Total Results</div>
                <div className="text-xs text-gray-500">{passedAssessments} Passed • {failedAssessments} Failed</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportResults}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <MdDownload className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={printResults}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <MdPrint className="h-4 w-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">{totalAssessments}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdQuiz className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <MdTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">12% increase</span>
                  <span className="text-gray-500 ml-1">from last semester</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-3xl font-bold text-green-600">{passedAssessments}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MdCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">
                    {totalAssessments > 0 ? ((passedAssessments / totalAssessments) * 100).toFixed(1) : 0}% pass rate
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-3xl font-bold text-red-600">{failedAssessments}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <MdCancel className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Retake available</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <MdBarChart className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {averageScore >= 85 ? (
                    <>
                      <MdTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">Excellent performance</span>
                    </>
                  ) : (
                    <>
                      <MdTrendingDown className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-yellow-600 font-medium">Room for improvement</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <MdFilterList className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {semesters.map(semester => (
                      <option key={semester.id} value={semester.id}>{semester.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-6">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                    {/* Result Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">{result.title}</h3>
                              <p className="text-sm text-gray-600">{result.course} • {result.courseCode}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MdCalendarToday className="h-4 w-4" />
                              <span>{formatDate(result.dateTaken)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MdTimer className="h-4 w-4" />
                              <span>{result.duration} minutes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MdSchool className="h-4 w-4" />
                              <span>{result.instructor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex flex-col items-end space-y-3">
                          <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getGradeColor(result.status, result.grade)}`}>
                            {result.grade}
                          </span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.obtainedMarks}/{result.totalMarks}
                            </div>
                            <div className="text-sm text-gray-500">
                              {((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="p-6 bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(result.breakdown).map(([category, scores]) => (
                          <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {category.replace('_', ' ')}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {scores.obtained}/{scores.total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (scores.obtained / scores.total) >= 0.8 ? 'bg-green-500' :
                                  (scores.obtained / scores.total) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(scores.obtained / scores.total) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {((scores.obtained / scores.total) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {result.feedback && (
                      <div className="p-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructor Feedback</h4>
                        <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
                          {result.feedback}
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Attempt {result.attempt} of {result.maxAttempts}</span>
                          {result.status === 'failed' && result.attempt < result.maxAttempts && (
                            <span className="text-blue-600 font-medium">Retake Available</span>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                            <MdDownload className="h-4 w-4 mr-2" />
                            Download Certificate
                          </button>
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                            <MdAssessment className="h-4 w-4 mr-2" />
                            View Details
                            <MdChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MdStars className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No assessment results match your current filter criteria. Try adjusting your filters or check back later for new results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentResults;
