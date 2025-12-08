import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { MdArrowBack } from 'react-icons/md';

const ExamResultDetail = () => {
  const { id } = useParams();
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
  }, [id]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem('studentToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://api.smitracked.cloud/api/student/quiz-results/${id}`, {
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
                onClick={() => navigate('/smi-lms/exam-results')}
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
                onClick={() => navigate('/smi-lms/exam-results')}
                className="flex items-center hover:cursor-pointer text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title='Back to Results'
              >
                <MdArrowBack className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Back to Results</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Exam Details</h1>
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
            
            {/* Exam Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>{course.title}</span>
                      <span>•</span>
                      <span>
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>{Math.floor(attempt.time_taken / 60)} minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Summary */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Score</p>
                    <p className="text-2xl font-bold text-gray-900">{attempt.score}/{attempt.total_points}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Percentage</p>
                    <p className="text-2xl font-bold text-gray-900">{attempt.percentage.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Correct</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.correct_answers}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Incorrect</p>
                    <p className="text-2xl font-bold text-red-600">{statistics.incorrect_answers}</p>
                  </div>
                </div>

                {/* Pass/Fail Status */}
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-semibold ${passed ? 'text-green-900' : 'text-red-900'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </p>
                      <p className={`text-sm ${passed ? 'text-green-700' : 'text-red-700'}`}>
                        Passing score: {quiz.passing_score}%
                      </p>
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
                        <div className="flex items-start flex-1">
                          <span className={`flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full mr-3 font-semibold ${
                            isCorrect 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium mb-2">{question.question_text}</p>
                            <span className="text-xs text-gray-500">
                              {getQuestionTypeLabel(question.question_type)} • {question.points_earned}/{question.points} pts
                            </span>
                          </div>
                        </div>
                        <span className={`ml-4 text-sm font-semibold ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      </div>

                      {/* Answer Section */}
                      <div className="ml-11 space-y-3">
                        {/* Student Answer */}
                        <div className={`p-3 rounded-lg border-2 ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <p className={`text-xs font-semibold mb-1 ${
                            isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Your Answer:
                          </p>
                          <p className={`text-sm ${
                            isCorrect ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {question.student_answer 
                              ? (typeof question.student_answer === 'object'
                                  ? (question.student_answer.answer_text || 
                                     options.find(opt => opt.id === question.student_answer.option_id)?.text ||
                                     'Answer not found')
                                  : question.student_answer)
                              : 'No answer provided'}
                          </p>
                        </div>

                        {/* Correct Answer (only show if student got it wrong) */}
                        {!isCorrect && (
                          <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1">
                              Correct Answer:
                            </p>
                            <p className="text-sm text-green-900">
                              {options.find(opt => opt.id === question.correct_option_id)?.text || 
                               options.find(opt => opt.is_correct)?.text || 
                               'Correct answer not available'}
                            </p>
                          </div>
                        )}

                        {/* All Options (for reference) */}
                        {options.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">All Options:</p>
                            <div className="space-y-1">
                              {options.map((option, optIndex) => (
                                <div 
                                  key={option.id} 
                                  className={`text-sm px-3 py-2 rounded ${
                                    option.is_correct 
                                      ? 'bg-green-100 text-green-900 font-medium' 
                                      : 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                  {option.text}
                                  {option.is_correct && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                </div>
                              ))}
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

export default ExamResultDetail;
