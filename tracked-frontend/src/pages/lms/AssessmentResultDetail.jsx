import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdArrowBack,
  MdCheckCircle, 
  MdCancel,
  MdGrade,
  MdTimer,
  MdCalendarToday,
  MdQuiz,
  MdBarChart
} from 'react-icons/md';

const AssessmentResultDetail = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchResultDetail();
  }, [attemptId]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem('studentToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/student/quiz-results/${attemptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch result details');
      }

      const data = await response.json();
      if (data.success) {
        setResultData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load result details');
      }
    } catch (err) {
      console.error('Error fetching result details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'multiple_choice': 'Multiple Choice',
      'true_false': 'True/False',
      'short_answer': 'Short Answer',
      'essay': 'Essay'
    };
    return types[type] || type;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarOpen={sidebarCollapsed}
          setSidebarOpen={setSidebarCollapsed}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading result details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarOpen={sidebarCollapsed}
          setSidebarOpen={setSidebarCollapsed}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-semibold">Error Loading Details</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => navigate('/smi-lms/assessment-results')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  const { attempt, quiz, course, questions, statistics } = resultData;
  const grade = calculateGrade(attempt.percentage);
  const passed = statistics.passed;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sidebarOpen={sidebarCollapsed}
        setSidebarOpen={setSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/smi-lms/assessment-results')}
                className="flex items-center hover:cursor-pointer text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title='Back to Results'
              >
                <MdArrowBack className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Back to Results</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Assessment Details</h1>
            </div>
            {user && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full mx-auto space-y-6">
            
            {/* Assessment Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center text-gray-600">
                        <MdQuiz className="h-4 w-4 mr-1" />
                        {course.title}
                      </span>
                      <span className="flex items-center text-gray-600">
                        <MdCalendarToday className="h-4 w-4 mr-1" />
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center text-gray-600">
                        <MdTimer className="h-4 w-4 mr-1" />
                        {Math.floor(attempt.time_taken / 60)} minutes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Summary */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-2xl font-bold text-gray-900">{attempt.score}/{attempt.total_points}</p>
                      </div>
                      <MdGrade className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Percentage</p>
                        <p className="text-2xl font-bold text-gray-900">{attempt.percentage.toFixed(1)}%</p>
                      </div>
                      <MdBarChart className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Correct</p>
                        <p className="text-2xl font-bold text-green-600">{statistics.correct_answers}</p>
                      </div>
                      <MdCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Incorrect</p>
                        <p className="text-2xl font-bold text-red-600">{statistics.incorrect_answers}</p>
                      </div>
                      <MdCancel className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Pass/Fail Status */}
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {passed ? (
                        <MdCheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      ) : (
                        <MdCancel className="h-6 w-6 text-red-600 mr-3" />
                      )}
                      <div>
                        <p className={`font-semibold ${passed ? 'text-green-900' : 'text-red-900'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </p>
                        <p className={`text-sm ${passed ? 'text-green-700' : 'text-red-700'}`}>
                          Passing score: {quiz.passing_score}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Attempt {attempt.attempt_number} of {quiz.retake_limit}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question-by-Question Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Question-by-Question Review</h3>
                <p className="text-sm text-gray-600 mt-1">Review each question with your answer and the correct answer</p>
              </div>

              <div className="divide-y divide-gray-200">
                {questions.map((question, index) => {
                  const isCorrect = question.is_correct;
                  const options = question.options || [];

                  return (
                    <div 
                      key={question.question_id} 
                      className={`p-6 ${isCorrect ? 'bg-green-50/30' : 'bg-red-50/30'}`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 font-semibold rounded-full text-sm">
                              {index + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {getQuestionTypeLabel(question.question_type)}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium ml-11">{question.question_text}</p>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Points</p>
                            <p className={`text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {question.points_earned}/{question.points}
                            </p>
                          </div>
                          {isCorrect ? (
                            <MdCheckCircle className="h-8 w-8 text-green-500" />
                          ) : (
                            <MdCancel className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                      </div>

                      {/* Answer Section */}
                      <div className="ml-11 space-y-3">
                        {/* Student Answer */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                          {question.student_answer ? (
                            <div className={`p-3 rounded-lg border-2 ${
                              isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <p className={`${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                                {question.student_answer.answer_text || 
                                  options.find(opt => opt.id === question.student_answer.option_id)?.text || 
                                  'No answer provided'}
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border-2 bg-gray-50 border-gray-200">
                              <p className="text-gray-500 italic">No answer provided</p>
                            </div>
                          )}
                        </div>

                        {/* Correct Answer */}
                        {!isCorrect && question.correct_option_id && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Correct Answer:</p>
                            <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200">
                              <p className="text-green-900">
                                {options.find(opt => opt.id === question.correct_option_id)?.text || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultDetail;
