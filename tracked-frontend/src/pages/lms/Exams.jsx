import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdCalendarToday, 
  MdAccessTime, 
  MdLocationOn, 
  MdDescription, 
  MdSchool, 
  MdAssignment, 
  MdMenu,
  MdPlayArrow,
  MdPending,
  MdCheckCircle,
  MdWarning,
  MdGrade,
  MdBook,
  MdBarChart,
  MdQuiz,
  MdTimer
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';

const Exams = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/student/exams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        // Transform backend data to match frontend structure
        const transformedExams = data.data.map(exam => {
          // Determine status based on attempts
          let status = 'available';
          
          if (exam.attempts_taken > 0) {
            status = 'completed';
          } else if (exam.status === 'active') {
            status = 'available';
          }

          return {
            id: exam.id,
            title: exam.title,
            description: exam.description || 'No description available',
            courseTitle: exam.course_title || exam.batch_id || 'General',
            type: 'written',
            totalMarks: exam.total_questions * 10, // Assuming 10 points per question
            passingMarks: exam.passing_score || 50,
            timeLimit: exam.time_limit,
            dueDate: exam.date,
            status: status,
            score: exam.highest_percentage, // Use highest_percentage from backend
            completedDate: exam.updated_at, // Use updated_at as completed date
            attempts: exam.attempts_taken || 0,
            maxAttempts: exam.retake_limit || 1,
            attemptsRemaining: exam.attempts_remaining || 0,
            isOverdue: false,
            feedback: null,
            startedDate: null,
            total_questions: exam.total_questions,
            passing_percentage: exam.passing_score
          };
        });
        
        setExams(transformedExams);
      } else {
        setError(data.message || 'Failed to load exams');
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'available': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'upcoming': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'in-progress': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'overdue': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    return <MdQuiz className="h-5 w-5 text-blue-600" />;
  };

  const calculateStats = () => {
    const total = exams.length;
    const completed = exams.filter(a => a.status === 'completed').length;
    const inProgress = exams.filter(a => a.status === 'in-progress').length;
    const overdue = exams.filter(a => a.status === 'overdue').length;
    const available = exams.filter(a => a.status === 'available').length;
    
    const completedExams = exams.filter(a => a.status === 'completed' && a.score);
    const averageScore = completedExams.length > 0 
      ? (completedExams.reduce((sum, a) => sum + a.score, 0) / completedExams.length).toFixed(1)
      : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      available,
      averageScore,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days remaining`;
  };

  const stats = calculateStats();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sidebarOpen={sidebarCollapsed}
        setSidebarOpen={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:cursor-pointer hover:text-gray-500 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Exams</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
                <p className="mt-2 text-gray-600">Track your written exams and monitor your performance</p>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stats.completed} of {stats.total}</div>
                  <div className="text-xs text-gray-500">Exams Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading exams...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <MdWarning className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Exams List */}
              <div className="space-y-6">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                      {/* Exam Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getTypeIcon(exam.type)}
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{exam.title}</h3>
                                <p className="text-sm text-gray-600">{exam.courseTitle}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{exam.description}</p>
                          </div>
                          <div className="ml-6 flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(exam.status)}`}>
                              {exam.status.replace('-', ' ')}
                            </span>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{exam.totalMarks} pts</div>
                              <div className="text-xs text-gray-500">Total Points</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exam Details */}
                      <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <MdCalendarToday className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Exam Date</div>
                              <div className="text-gray-600">{formatDate(exam.dueDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdTimer className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Duration</div>
                              <div className="text-gray-600">{exam.timeLimit} minutes</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdGrade className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Passing Score</div>
                              <div className="text-gray-600">{exam.passingMarks}%</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdBook className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Questions</div>
                              <div className="text-gray-600">{exam.total_questions}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exam Results */}
                      {exam.status === 'completed' && (
                        <div className={`p-6 border-t ${
                          exam.score >= exam.passingMarks 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' 
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                {exam.score >= exam.passingMarks ? (
                                  <MdCheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <MdWarning className="h-5 w-5 text-red-600" />
                                )}
                                <span className={`font-semibold ${
                                  exam.score >= exam.passingMarks ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  Exam Completed
                                </span>
                              </div>
                              <div className={`text-sm ${
                                exam.score >= exam.passingMarks ? 'text-green-700' : 'text-red-700'
                              }`}>
                                Completed on {formatDate(exam.completedDate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                exam.score >= exam.passingMarks ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {exam.score !== null && exam.score !== undefined ? `${exam.score}%` : 'N/A'}
                              </div>
                              <div className={`text-sm ${
                                exam.score >= exam.passingMarks ? 'text-green-700' : 'text-red-700'
                              }`}>
                                <span className="font-medium">
                                  {exam.score >= exam.passingMarks ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {exam.feedback && (
                            <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
                              <div className={`text-sm font-medium mb-1 ${
                                exam.score >= exam.passingMarks ? 'text-green-900' : 'text-red-900'
                              }`}>
                                Instructor Feedback
                              </div>
                              <p className={`text-sm ${
                                exam.score >= exam.passingMarks ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {exam.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Overdue Warning */}
                      {exam.isOverdue && (
                        <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-t border-red-100">
                          <div className="flex items-start space-x-3">
                            <MdWarning className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <div className="text-red-800 font-semibold mb-1">Exam Overdue</div>
                              <p className="text-red-700 text-sm">
                                This exam is past its due date. Please contact your instructor immediately to discuss makeup options.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {exam.status === 'upcoming' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-purple-700 font-medium">{getTimeRemaining(exam.dueDate)}</span>
                              </div>
                            )}
                            {exam.status === 'available' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-blue-700 font-medium">Ready to begin</span>
                              </div>
                            )}
                            {exam.status === 'completed' && exam.attemptsRemaining > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-orange-700 font-medium">
                                  {exam.attemptsRemaining} attempt{exam.attemptsRemaining !== 1 ? 's' : ''} remaining
                                </span>
                              </div>
                            )}
                            {exam.status === 'in-progress' && exam.startedDate && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-yellow-700 font-medium">
                                  In progress since {formatDate(exam.startedDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            {exam.status === 'available' && (
                              <button 
                                onClick={() => navigate(`/smi-lms/take-assessment/${exam.id}`, { state: { source: 'exams' } })}
                                className="flex items-center hover:cursor-pointer px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                              >
                                <MdPlayArrow className="h-4 w-4 mr-2" />
                                Begin Exam
                              </button>
                            )}
                            {exam.status === 'completed' && exam.attemptsRemaining > 0 && (
                              <button 
                                onClick={() => navigate(`/smi-lms/take-assessment/${exam.id}`, { state: { source: 'exams' } })}
                                className="flex items-center hover:cursor-pointer px-6 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                              >
                                <MdPlayArrow className="h-4 w-4 mr-2" />
                                Retake Exam
                              </button>
                            )}
                            {exam.status === 'in-progress' && (
                              <button 
                                onClick={() => navigate(`/smi-lms/take-assessment/${exam.id}`, { state: { source: 'exams' } })}
                                className="flex items-center hover:cursor-pointer px-6 py-2.5 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                              >
                                <MdPending className="h-4 w-4 mr-2" />
                                Continue Exam
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MdQuiz className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are no exams available at this time. Check back later for new exams.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdBarChart className="h-5 w-5 mr-2 text-blue-600" />
                    Quick Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Exams</span>
                      <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm font-medium text-green-600">{stats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="text-sm font-medium text-yellow-600">{stats.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="text-sm font-medium text-blue-600">{stats.available}</span>
                    </div>
                    {stats.overdue > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overdue</span>
                        <span className="text-sm font-medium text-red-600">{stats.overdue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams;
