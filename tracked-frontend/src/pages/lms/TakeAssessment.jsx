import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import {
  MdTimer,
  MdWarning,
  MdCheckCircle,
  MdMenu,
  MdNavigateBefore,
  MdNavigateNext,
  MdFlag,
} from 'react-icons/md';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchQuizAndStartAttempt();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchQuizAndStartAttempt = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('studentToken');

      // Fetch quiz details with questions
      const quizResponse = await fetch(`http://localhost:8000/api/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const quizData = await quizResponse.json();

      if (quizData.success) {
        setQuiz(quizData.data);
        setQuestions(quizData.data.questions || []);
        
        // Set timer if time limit exists
        if (quizData.data.time_limit) {
          setTimeRemaining(quizData.data.time_limit * 60); // Convert minutes to seconds
        }

        // Start a new attempt
        await startAttempt(quizData.data.id);
      } else {
        setError(quizData.message || 'Failed to load quiz');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async (quizId) => {
    try {
      const token = sessionStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/quiz-attempts/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz_id: quizId }),
      });

      const data = await response.json();

      if (data.success) {
        setAttemptId(data.data.id);
      } else {
        setError(data.message || 'Failed to start attempt');
      }
    } catch (err) {
      console.error('Error starting attempt:', err);
      setError('Failed to start attempt. Please try again.');
    }
  };

  const handleAnswerChange = (questionId, optionId, answerText = null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        option_id: optionId,
        answer_text: answerText,
      },
    }));
  };

  const handleAutoSubmit = async () => {
    await submitQuiz(true);
  };

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const submitQuiz = async (isAutoSubmit = false) => {
    try {
      const token = sessionStorage.getItem('studentToken');
      
      // Prepare answers in the format expected by backend
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId),
        option_id: answers[questionId].option_id,
        answer_text: answers[questionId].answer_text,
      }));

      const response = await fetch(`http://localhost:8000/api/quiz-attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on source or quiz type
        const source = location.state?.source;
        const redirectRoute = source === 'exams' || quiz?.type === 'exam' 
          ? '/smi-lms/exams' 
          : '/smi-lms/assessments';
        
        navigate(redirectRoute, {
          state: { message: isAutoSubmit ? 'Time expired - Quiz auto-submitted' : 'Quiz submitted successfully!' }
        });
      } else {
        setError(data.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Determine the correct back route based on source or quiz type
    const source = location.state?.source;
    const backRoute = source === 'exams' || quiz?.type === 'exam' 
      ? '/smi-lms/exams' 
      : '/smi-lms/assessments';
    const backText = source === 'exams' || quiz?.type === 'exam' 
      ? 'Back to Exams' 
      : 'Back to Assessments';

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md">
            <MdWarning className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Error Loading Quiz</h2>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button
              onClick={() => navigate(backRoute)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {backText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Assessment</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quiz?.title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <MdTimer className="h-5 w-5" />
                  <span className="font-semibold">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Question {currentQuestionIndex + 1}
                    </h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {currentQuestion?.points} {currentQuestion?.points === 1 ? 'point' : 'points'}
                    </span>
                  </div>
                  <p className="text-gray-800 text-lg leading-relaxed">{currentQuestion?.question}</p>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion?.type === 'multiple_choice' || currentQuestion?.type === 'true_false' ? (
                    currentQuestion.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          answers[currentQuestion.id]?.option_id === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option.id}
                          checked={answers[currentQuestion.id]?.option_id === option.id}
                          onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                          className="mt-1 h-4 w-4 text-blue-600"
                        />
                        <span className="ml-3 text-gray-700">{option.option_text}</span>
                      </label>
                    ))
                  ) : currentQuestion?.type === 'short_answer' ? (
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id]?.answer_text || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, null, e.target.value)}
                    />
                  ) : null}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    title='Previous'
                    className="flex hover:cursor-pointer items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdNavigateBefore className="h-5 w-5 mr-1" />
                    Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      title='Next'
                      className="flex hover:cursor-pointer items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Next
                      <MdNavigateNext className="h-5 w-5 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitClick}
                      className="flex hover:cursor-pointer items-center px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <MdCheckCircle className="h-5 w-5 mr-2" />
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Question Navigator */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : answers[question.id]
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-semibold text-gray-900">
                      {getAnsweredCount()} / {questions.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitClick}
                title='Submit Quiz'
                className="w-full flex hover:cursor-pointer items-center justify-center px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium"
              >
                <MdFlag className="h-5 w-5 mr-2" />
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-2">
              You have answered {getAnsweredCount()} out of {questions.length} questions.
            </p>
            {getAnsweredCount() < questions.length && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <MdWarning className="inline h-4 w-4 mr-1" />
                  You have unanswered questions. They will be marked as incorrect.
                </p>
              </div>
            )}
            <p className="text-gray-600 mb-6">Are you sure you want to submit your quiz?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                title='Cancel'
                className="flex-1 hover:cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => submitQuiz(false)}
                title='Submit'
                className="flex-1 hover:cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAssessment;
