import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdCalendarToday, 
  MdTimer, 
  MdCheckCircle, 
  MdCancel,
  MdFilterList,
  MdChevronRight,
  MdStars,
  MdSchool,
  MdAssessment,
  MdVerified,
  MdError
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
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const capitalizeWords = (str) => {
    if (!str || str === 'N/A') return str;
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
      const response = await fetch('https://api.smitracked.cloud/api/student/quiz-results', {
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
            title: result.course_title + ' - Competency Assessment',
            course: result.course_title,
            courseCode: result.course_code,
            type: getTypeLabel(result.quiz_type),
            dateTaken: result.date_taken,
            duration: result.time_taken || 0,
            totalMarks: result.total_marks,
            obtainedMarks: result.obtained_marks,
            passingMarks: result.passing_marks,
            percentage: result.percentage,
            status: result.status,
            competency: result.status === 'passed' ? 'Competent' : 'Not Yet Competent',
            grade: calculateGrade(result.percentage),
            attempt: result.attempt_number,
            maxAttempts: result.max_attempts,
            totalQuestions: result.total_questions,
            correctAnswers: result.correct_answers,
            tesdaAssessor: capitalizeWords(result.tesda_assessor) || 'N/A',
            batchName: result.batch_name || 'N/A',
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
      written: 'Written Assessment',
      oral: 'Oral Examination',
      demonstration: 'Practical Demonstration',
      observation: 'Performance Observation',
    };
    return types[type] || 'Competency Assessment';
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
  const competentAssessments = assessmentResults.filter(r => r.competency === 'Competent').length;
  const notYetCompetentAssessments = assessmentResults.filter(r => r.competency === 'Not Yet Competent').length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
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
                    <h1 className="text-2xl font-bold text-gray-900">TESDA Assessment Results</h1>
                    <p className="text-sm text-gray-600">View your competency-based assessment outcomes</p>
                  </div>
                </div>
              </div>
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
            {/* Results List */}
            <div className="space-y-4">
              {assessmentResults.length > 0 ? (
                assessmentResults.map((result) => (
                  <div key={result.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{result.course}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.competency === 'Competent' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {result.competency}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatDate(result.dateTaken)}</span>
                          <span>•</span>
                          <span>Assessor: {result.tesdaAssessor}</span>
                          <span>•</span>
                          <span>Batch: {result.batchName}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleViewDetails(result)}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <MdAssessment className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
                  <p className="text-gray-500">
                    Check back after your trainer conducts the assessments.
                  </p>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedResult && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedResult.course}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Assessment Result */}
              <div className="text-center py-6">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold ${
                  selectedResult.competency === 'Competent' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedResult.competency === 'Competent' ? (
                    <MdCheckCircle className="h-6 w-6" />
                  ) : (
                    <MdCancel className="h-6 w-6" />
                  )}
                  {selectedResult.competency}
                </div>
                <p className="text-sm text-gray-600 mt-3">TESDA Competency Status</p>
              </div>

              {/* Assessment Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Assessment Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(selectedResult.dateTaken)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Assessor</span>
                  <span className="text-sm font-medium text-gray-900">{selectedResult.tesdaAssessor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Batch</span>
                  <span className="text-sm font-medium text-gray-900">{selectedResult.batchName}</span>
                </div>
              </div>

              {/* Note */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  This assessment evaluates your practical skills and theoretical knowledge based on TESDA competency standards. 
                  A "Competent" result indicates you have successfully demonstrated the required competencies for this qualification.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentResults;
