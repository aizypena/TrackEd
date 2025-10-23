import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdQuiz, 
  MdAssignment, 
  MdCheckCircle, 
  MdPending,
  MdSchedule,
  MdAccessTime,
  MdGrade,
  MdTrendingUp,
  MdWarning,
  MdInfo,
  MdFilterList,
  MdPlayArrow,
  MdDescription,
  MdMenu,
  MdClose,
  MdCalendarToday,
  MdBook,
  MdTimer,
  MdStar,
  MdBarChart
} from 'react-icons/md';

const Assessments = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Sample assessments data
  const assessments = [
    {
      id: 1,
      title: 'Table Service Practical Assessment',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      type: 'practical',
      status: 'upcoming',
      dueDate: '2025-09-25',
      timeLimit: 120,
      totalMarks: 100,
      passingMarks: 75,
      attempts: 0,
      maxAttempts: 3,
      description: 'Practical demonstration of table service skills including table setting, order taking, and customer service.',
      instructions: [
        'Arrive 15 minutes before the scheduled time',
        'Wear proper uniform and maintain hygiene standards',
        'Demonstrate all required service techniques',
        'Complete the assessment within the time limit'
      ]
    },
    {
      id: 2,
      title: 'Wine Service Knowledge Test',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      type: 'written',
      status: 'available',
      dueDate: '2025-09-30',
      timeLimit: 60,
      totalMarks: 50,
      passingMarks: 35,
      attempts: 0,
      maxAttempts: 2,
      description: 'Written examination covering wine service procedures, wine types, and beverage knowledge.',
      instructions: [
        'Read all questions carefully before answering',
        'Select the best answer for multiple choice questions',
        'Provide detailed explanations for essay questions',
        'Submit before the time limit expires'
      ]
    },
    {
      id: 3,
      title: 'Basic Knife Skills Assessment',
      courseTitle: 'Cookery NC II',
      courseCode: 'COOK-NC2-2025',
      type: 'practical',
      status: 'completed',
      dueDate: '2025-09-15',
      completedDate: '2025-09-14',
      timeLimit: 90,
      totalMarks: 100,
      passingMarks: 70,
      score: 88,
      attempts: 1,
      maxAttempts: 3,
      description: 'Practical demonstration of basic knife skills including julienne, brunoise, and chiffonade cuts.',
      feedback: 'Excellent knife technique demonstrated. Consistent cut sizes and proper safety procedures followed.',
      instructor: 'Chef Roberto Cruz'
    },
    {
      id: 4,
      title: 'Food Safety and Hygiene Quiz',
      courseTitle: 'Cookery NC II',
      courseCode: 'COOK-NC2-2025',
      type: 'written',
      status: 'completed',
      dueDate: '2025-09-10',
      completedDate: '2025-09-09',
      timeLimit: 45,
      totalMarks: 25,
      passingMarks: 18,
      score: 23,
      attempts: 1,
      maxAttempts: 2,
      description: 'Assessment of food safety principles, HACCP procedures, and kitchen hygiene standards.',
      feedback: 'Strong understanding of food safety principles. Minor areas for improvement in HACCP documentation.',
      instructor: 'Chef Roberto Cruz'
    },
    {
      id: 5,
      title: 'Bread Production Techniques',
      courseTitle: 'Bread and Pastry Production NC II',
      courseCode: 'BPP-NC2-2025',
      type: 'practical',
      status: 'in-progress',
      dueDate: '2025-10-05',
      timeLimit: 180,
      totalMarks: 100,
      passingMarks: 75,
      attempts: 1,
      maxAttempts: 2,
      startedDate: '2025-09-19',
      description: 'Practical assessment of bread making techniques including mixing, kneading, fermentation, and baking.',
      instructions: [
        'Prepare all ingredients according to recipe specifications',
        'Demonstrate proper mixing and kneading techniques',
        'Monitor fermentation process and timing',
        'Present finished products for evaluation'
      ]
    },
    {
      id: 6,
      title: 'Customer Service Simulation',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      type: 'practical',
      status: 'overdue',
      dueDate: '2025-09-20',
      timeLimit: 90,
      totalMarks: 75,
      passingMarks: 56,
      attempts: 0,
      maxAttempts: 2,
      description: 'Role-playing assessment demonstrating customer service skills in various scenarios.',
      isOverdue: true
    }
  ];

  const courses = [
    { code: 'all', title: 'All Courses' },
    { code: 'FBS-NC2-2025', title: 'Food and Beverage Services NC II' },
    { code: 'COOK-NC2-2025', title: 'Cookery NC II' },
    { code: 'BPP-NC2-2025', title: 'Bread and Pastry Production NC II' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'available', label: 'Available' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <MdCheckCircle className="h-5 w-5 text-green-600" />;
      case 'available': return <MdPlayArrow className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <MdSchedule className="h-5 w-5 text-purple-600" />;
      case 'in-progress': return <MdPending className="h-5 w-5 text-yellow-600" />;
      case 'overdue': return <MdWarning className="h-5 w-5 text-red-600" />;
      default: return <MdInfo className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'practical': return <MdAssignment className="h-5 w-5 text-orange-600" />;
      case 'written': return <MdQuiz className="h-5 w-5 text-blue-600" />;
      default: return <MdDescription className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const courseMatch = selectedCourse === 'all' || assessment.courseCode === selectedCourse;
    const statusMatch = selectedStatus === 'all' || assessment.status === selectedStatus;
    return courseMatch && statusMatch;
  });

  const getAssessmentsByTab = (tab) => {
    switch(tab) {
      case 'upcoming':
        return filteredAssessments.filter(a => a.status === 'upcoming' || a.status === 'available');
      case 'in-progress':
        return filteredAssessments.filter(a => a.status === 'in-progress');
      case 'completed':
        return filteredAssessments.filter(a => a.status === 'completed');
      case 'overdue':
        return filteredAssessments.filter(a => a.status === 'overdue');
      default:
        return filteredAssessments;
    }
  };

  const calculateStats = () => {
    const total = assessments.length;
    const completed = assessments.filter(a => a.status === 'completed').length;
    const inProgress = assessments.filter(a => a.status === 'in-progress').length;
    const overdue = assessments.filter(a => a.status === 'overdue').length;
    const available = assessments.filter(a => a.status === 'available').length;
    
    const completedAssessments = assessments.filter(a => a.status === 'completed' && a.score);
    const averageScore = completedAssessments.length > 0 
      ? (completedAssessments.reduce((sum, a) => sum + a.score, 0) / completedAssessments.length).toFixed(1)
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
  const tabAssessments = getAssessmentsByTab(activeTab);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
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
            <h1 className="text-lg font-semibold text-gray-900">Assessments</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
                <p className="mt-2 text-gray-600">Track your academic assessments and monitor your learning progress</p>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stats.completed} of {stats.total}</div>
                  <div className="text-xs text-gray-500">Assessments Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.completionRate}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MdTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.averageScore}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MdStar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MdCheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Available</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.available}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MdQuiz className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdFilterList className="h-5 w-5 mr-2 text-blue-600" />
                    Filter Assessments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {courses.map(course => (
                          <option key={course.code} value={course.code}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {['upcoming', 'in-progress', 'completed', 'overdue'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.replace('-', ' ')}
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {getAssessmentsByTab(tab).length}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Assessments List */}
              <div className="space-y-6">
                {tabAssessments.length > 0 ? (
                  tabAssessments.map((assessment) => (
                    <div key={assessment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                      {/* Assessment Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              {getTypeIcon(assessment.type)}
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{assessment.title}</h3>
                                <p className="text-sm text-gray-600">{assessment.courseTitle}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
                          </div>
                          <div className="ml-6 flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(assessment.status)}`}>
                              {assessment.status.replace('-', ' ')}
                            </span>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{assessment.totalMarks} pts</div>
                              <div className="text-xs text-gray-500">Total Points</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Details */}
                      <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <MdCalendarToday className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Due Date</div>
                              <div className="text-gray-600">{formatDate(assessment.dueDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdTimer className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Duration</div>
                              <div className="text-gray-600">{assessment.timeLimit} minutes</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdGrade className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Passing Score</div>
                              <div className="text-gray-600">{assessment.passingMarks} pts</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdBook className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">Attempts</div>
                              <div className="text-gray-600">{assessment.attempts}/{assessment.maxAttempts}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Results */}
                      {assessment.status === 'completed' && assessment.score && (
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <MdCheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-green-800 font-semibold">Assessment Completed</span>
                              </div>
                              <div className="text-sm text-green-700">
                                Completed on {formatDate(assessment.completedDate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-800">
                                {assessment.score}/{assessment.totalMarks}
                              </div>
                              <div className="text-sm text-green-700">
                                {((assessment.score / assessment.totalMarks) * 100).toFixed(1)}% 
                                <span className="ml-2 font-medium">
                                  {assessment.score >= assessment.passingMarks ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {assessment.feedback && (
                            <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
                              <div className="text-sm font-medium text-green-900 mb-1">Instructor Feedback</div>
                              <p className="text-green-800 text-sm">{assessment.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Overdue Warning */}
                      {assessment.isOverdue && (
                        <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-t border-red-100">
                          <div className="flex items-start space-x-3">
                            <MdWarning className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <div className="text-red-800 font-semibold mb-1">Assessment Overdue</div>
                              <p className="text-red-700 text-sm">
                                This assessment is past its due date. Please contact your instructor immediately to discuss makeup options or alternative arrangements.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {assessment.status === 'upcoming' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-purple-700 font-medium">{getTimeRemaining(assessment.dueDate)}</span>
                              </div>
                            )}
                            {assessment.status === 'available' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-blue-700 font-medium">Ready to begin</span>
                              </div>
                            )}
                            {assessment.status === 'in-progress' && assessment.startedDate && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-yellow-700 font-medium">
                                  In progress since {formatDate(assessment.startedDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            {assessment.status === 'available' && (
                              <button className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                                <MdPlayArrow className="h-4 w-4 mr-2" />
                                Begin Assessment
                              </button>
                            )}
                            {assessment.status === 'in-progress' && (
                              <button className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors">
                                <MdPending className="h-4 w-4 mr-2" />
                                Continue Assessment
                              </button>
                            )}
                            {assessment.status === 'completed' && (
                              <button className="flex items-center px-6 py-2.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                                <MdGrade className="h-4 w-4 mr-2" />
                                View Detailed Results
                              </button>
                            )}
                            <button className="flex items-center px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                              <MdDescription className="h-4 w-4 mr-2" />
                              View Instructions
                            </button>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are no assessments matching your current filter criteria. Try adjusting your filters or check back later for new assessments.
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
                      <span className="text-sm text-gray-600">Total Assessments</span>
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

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdAccessTime className="h-5 w-5 mr-2 text-orange-600" />
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-3">
                    {assessments
                      .filter(a => a.status === 'available' || a.status === 'upcoming')
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .slice(0, 3)
                      .map(assessment => (
                        <div key={assessment.id} className="border-l-4 border-orange-500 pl-4">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {assessment.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {assessment.courseCode}
                          </div>
                          <div className="text-xs text-orange-600 mt-1">
                            {getTimeRemaining(assessment.dueDate)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{stats.averageScore}%</div>
                    <p className="text-sm text-gray-600 mb-4">Average Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${stats.averageScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;
