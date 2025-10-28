import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdCalendarToday, 
  MdTimer, 
  MdQuiz, 
  MdCheckCircle, 
  MdCancel,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdChevronRight,
  MdStars,
  MdSchool,
  MdAssessment,
  MdBarChart
} from 'react-icons/md';

const AssessmentResults = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/student/quiz-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Transform backend data to match frontend structure
        const transformedResults = data.data.map(result => ({
          id: result.id,
          quizId: result.quiz_id,
          title: result.quiz_title,
          course: result.course_title,
          courseCode: result.course_code,
          type: getTypeLabel(result.quiz_type),
          dateTaken: result.date_taken,
          duration: Math.floor(result.time_taken / 60), // Convert seconds to minutes
          totalMarks: result.total_marks,
          obtainedMarks: result.obtained_marks,
          passingMarks: result.passing_marks,
          percentage: result.percentage,
          status: result.status,
          grade: calculateGrade(result.percentage),
          attempt: result.attempt_number,
          maxAttempts: result.max_attempts,
          totalQuestions: result.total_questions,
          correctAnswers: result.correct_answers,
        }));

        // Group results by quiz_id and keep only the highest scoring attempt for each quiz
        const quizMap = new Map();
        transformedResults.forEach(result => {
          const existingResult = quizMap.get(result.quizId);
          if (!existingResult || result.percentage > existingResult.percentage) {
            quizMap.set(result.quizId, result);
          }
        });

        // Convert map back to array and sort by date (most recent first)
        const highestScoreResults = Array.from(quizMap.values())
          .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));

        setAssessmentResults(highestScoreResults);
      } else {
        setError(data.message || 'Failed to load results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      written: 'Written Test',
      oral: 'Oral Examination',
      demonstration: 'Demonstration',
      observation: 'Observation',
    };
    return types[type] || type;
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  // Calculate statistics
  const totalAssessments = assessmentResults.length;
  const passedAssessments = assessmentResults.filter(r => r.status === 'passed').length;
  const failedAssessments = assessmentResults.filter(r => r.status === 'failed').length;
  const averageScore = totalAssessments > 0 
    ? (assessmentResults.reduce((sum, r) => sum + ((r.obtainedMarks / r.totalMarks) * 100), 0) / totalAssessments).toFixed(1)
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sidebarOpen={sidebarCollapsed}
        setSidebarOpen={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
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
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
                    <p className="text-sm text-gray-600">Track your academic performance and progress</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{totalAssessments} Total Results</div>
              <div className="text-xs text-gray-500">{passedAssessments} Passed • {failedAssessments} Failed</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 w-full mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading results...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <MdCancel className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
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

            {/* Results List */}
            <div className="space-y-6">
              {assessmentResults.length > 0 ? (
                assessmentResults.map((result) => (
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

                    {/* Action Bar */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Attempt {result.attempt} of {result.maxAttempts}</span>
                          <span>•</span>
                          <span>Correct Answers: {result.correctAnswers} / {result.totalQuestions}</span>
                          {result.status === 'failed' && result.attempt < result.maxAttempts && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">Retake Available</span>
                            </>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => navigate(`/smi-lms/assessment-result-detail/${result.id}`)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentResults;
