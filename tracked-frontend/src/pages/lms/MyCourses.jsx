import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdSchool, 
  MdSchedule, 
  MdPerson, 
  MdDownload, 
  MdPlayArrow, 
  MdFilePresent,
  MdVideoLibrary,
  MdPictureAsPdf,
  MdAssignment,
  MdCheckCircle,
  MdPending,
  MdError,
  MdWorkspacePremium,
  MdCalendarToday,
  MdAccessTime,
  MdLocationOn,
  MdTrendingUp,
  MdBook,
  MdQuiz,
  MdGrade,
  MdDescription,
  MdMenu
} from 'react-icons/md';

const MyCourses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Sample course data - in real app this would come from API
  const enrolledCourses = [
    {
      id: 1,
      title: 'Food and Beverage Services NC II',
      code: 'FBS-NC2-2025',
      instructor: 'Chef Maria Santos',
      progress: 75,
      status: 'In Progress',
      startDate: '2025-01-15',
      endDate: '2025-04-15',
      schedule: {
        days: 'Monday, Wednesday, Friday',
        time: '8:00 AM - 12:00 PM',
        location: 'Kitchen Laboratory A'
      },
      nextClass: '2025-09-22T08:00:00',
      totalHours: 320,
      completedHours: 240,
      attendance: {
        present: 28,
        absent: 2,
        total: 30,
        percentage: 93.3
      },
      materials: [
        { id: 1, name: 'Service Standards Manual', type: 'pdf', size: '2.5 MB', downloadUrl: '#' },
        { id: 2, name: 'Wine Service Techniques', type: 'video', duration: '45 min', downloadUrl: '#' },
        { id: 3, name: 'Menu Knowledge Guide', type: 'pdf', size: '1.8 MB', downloadUrl: '#' },
        { id: 4, name: 'Customer Service Excellence', type: 'presentation', size: '3.2 MB', downloadUrl: '#' }
      ],
      assessments: [
        { id: 1, name: 'Table Service Assessment', status: 'completed', score: 88, maxScore: 100, date: '2025-09-15' },
        { id: 2, name: 'Wine Service Practical', status: 'pending', dueDate: '2025-09-25' },
        { id: 3, name: 'Customer Service Simulation', status: 'upcoming', dueDate: '2025-10-05' }
      ],
      certificates: [
        { id: 1, name: 'Food Safety Certificate', status: 'approved', issueDate: '2025-09-10' }
      ]
    },
    {
      id: 2,
      title: 'Cookery NC II',
      code: 'COOK-NC2-2025',
      instructor: 'Chef Roberto Cruz',
      progress: 45,
      status: 'In Progress',
      startDate: '2025-02-01',
      endDate: '2025-06-30',
      schedule: {
        days: 'Tuesday, Thursday',
        time: '1:00 PM - 6:00 PM',
        location: 'Main Kitchen'
      },
      nextClass: '2025-09-21T13:00:00',
      totalHours: 280,
      completedHours: 126,
      attendance: {
        present: 15,
        absent: 1,
        total: 16,
        percentage: 93.8
      },
      materials: [
        { id: 5, name: 'Basic Cooking Techniques', type: 'pdf', size: '4.1 MB', downloadUrl: '#' },
        { id: 6, name: 'Knife Skills Demonstration', type: 'video', duration: '30 min', downloadUrl: '#' },
        { id: 7, name: 'Recipe Collection Volume 1', type: 'pdf', size: '5.2 MB', downloadUrl: '#' }
      ],
      assessments: [
        { id: 4, name: 'Basic Cuts Assessment', status: 'completed', score: 92, maxScore: 100, date: '2025-09-10' },
        { id: 5, name: 'Soup Preparation', status: 'in-progress', dueDate: '2025-09-28' }
      ],
      certificates: []
    },
    {
      id: 3,
      title: 'Bread and Pastry Production NC II',
      code: 'BPP-NC2-2025',
      instructor: 'Chef Anna Reyes',
      progress: 20,
      status: 'In Progress',
      startDate: '2025-08-15',
      endDate: '2025-12-15',
      schedule: {
        days: 'Saturday',
        time: '7:00 AM - 5:00 PM',
        location: 'Bakery Laboratory'
      },
      nextClass: '2025-09-23T07:00:00',
      totalHours: 240,
      completedHours: 48,
      attendance: {
        present: 4,
        absent: 0,
        total: 4,
        percentage: 100
      },
      materials: [
        { id: 8, name: 'Baking Fundamentals', type: 'pdf', size: '3.8 MB', downloadUrl: '#' },
        { id: 9, name: 'Bread Making Process', type: 'video', duration: '60 min', downloadUrl: '#' }
      ],
      assessments: [
        { id: 6, name: 'Basic Dough Preparation', status: 'upcoming', dueDate: '2025-10-15' }
      ],
      certificates: []
    }
  ];

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'upcoming': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <MdPictureAsPdf className="h-5 w-5 text-red-500" />;
      case 'video': return <MdVideoLibrary className="h-5 w-5 text-purple-500" />;
      case 'presentation': return <MdFilePresent className="h-5 w-5 text-orange-500" />;
      default: return <MdDescription className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatNextClass = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Past due';
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
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">My Courses</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">Track your learning progress and access course materials</p>
        </div>

        {!selectedCourse ? (
          /* Course List View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="p-6">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <MdPerson className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{course.instructor}</span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Next Class */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MdSchedule className="h-4 w-4 mr-2" />
                    <span>Next class: {formatNextClass(course.nextClass)}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{course.attendance.percentage}%</div>
                      <div className="text-xs text-gray-500">Attendance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{course.completedHours}h</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Course Detail View */
          <div className="bg-white rounded-lg shadow-lg">
            {/* Course Header */}
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="mb-4 text-blue-200 hover:text-white transition-colors"
              >
                ← Back to Courses
              </button>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{selectedCourse.title}</h1>
                  <p className="text-blue-200 mb-2">{selectedCourse.code}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <MdPerson className="h-4 w-4 mr-1" />
                      {selectedCourse.instructor}
                    </span>
                    <span className="flex items-center">
                      <MdCalendarToday className="h-4 w-4 mr-1" />
                      {selectedCourse.schedule.days}
                    </span>
                    <span className="flex items-center">
                      <MdAccessTime className="h-4 w-4 mr-1" />
                      {selectedCourse.schedule.time}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedCourse.progress}%</div>
                  <div className="text-blue-200 text-sm">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div 
                    className="bg-blue-300 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedCourse.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['overview', 'materials', 'schedule', 'assessments', 'certificates'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Course Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Hours</p>
                            <p className="text-2xl font-bold">{selectedCourse.totalHours}h</p>
                          </div>
                          <MdBook className="h-8 w-8 text-blue-200" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Completed</p>
                            <p className="text-2xl font-bold">{selectedCourse.completedHours}h</p>
                          </div>
                          <MdCheckCircle className="h-8 w-8 text-green-200" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Attendance</p>
                            <p className="text-2xl font-bold">{selectedCourse.attendance.percentage}%</p>
                          </div>
                          <MdTrendingUp className="h-8 w-8 text-purple-200" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm">Assessments</p>
                            <p className="text-2xl font-bold">{selectedCourse.assessments.length}</p>
                          </div>
                          <MdQuiz className="h-8 w-8 text-orange-200" />
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Completed "Table Service Assessment" - Score: 88/100</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Downloaded "Service Standards Manual"</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Attended class on September 18, 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Class Info */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Class</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-700">
                          <MdCalendarToday className="h-4 w-4 mr-2" />
                          {formatNextClass(selectedCourse.nextClass)}
                        </div>
                        <div className="flex items-center text-blue-700">
                          <MdAccessTime className="h-4 w-4 mr-2" />
                          {selectedCourse.schedule.time}
                        </div>
                        <div className="flex items-center text-blue-700">
                          <MdLocationOn className="h-4 w-4 mr-2" />
                          {selectedCourse.schedule.location}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Pending Tasks</h3>
                      <div className="space-y-2">
                        {selectedCourse.assessments
                          .filter(assessment => assessment.status === 'pending' || assessment.status === 'upcoming')
                          .map(assessment => (
                            <div key={assessment.id} className="text-sm text-yellow-700">
                              • {assessment.name} - Due: {new Date(assessment.dueDate).toLocaleDateString()}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'materials' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Materials</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedCourse.materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(material.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{material.name}</h4>
                            <p className="text-sm text-gray-500">
                              {material.size && `${material.size} • `}
                              {material.duration && `${material.duration} • `}
                              {material.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {material.type === 'video' && (
                            <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">
                              <MdPlayArrow className="h-4 w-4 mr-1" />
                              Play
                            </button>
                          )}
                          <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">
                            <MdDownload className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Class Schedule</h3>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Schedule</h4>
                        <p className="text-blue-700">{selectedCourse.schedule.days}</p>
                        <p className="text-blue-700">{selectedCourse.schedule.time}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Location</h4>
                        <p className="text-blue-700">{selectedCourse.schedule.location}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Duration</h4>
                        <p className="text-blue-700">{selectedCourse.startDate} - {selectedCourse.endDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Attendance Record</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{selectedCourse.attendance.present}</div>
                        <div className="text-sm text-green-700">Present</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{selectedCourse.attendance.absent}</div>
                        <div className="text-sm text-red-700">Absent</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{selectedCourse.attendance.total}</div>
                        <div className="text-sm text-blue-700">Total Classes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assessments' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Assessments & Results</h3>
                  <div className="space-y-4">
                    {selectedCourse.assessments.map((assessment) => (
                      <div key={assessment.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{assessment.name}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                                {assessment.status}
                              </span>
                              {assessment.score && (
                                <span className="text-green-600 font-medium">
                                  Score: {assessment.score}/{assessment.maxScore}
                                </span>
                              )}
                              {assessment.dueDate && (
                                <span>
                                  Due: {new Date(assessment.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {assessment.date && (
                                <span>
                                  Completed: {new Date(assessment.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {assessment.status === 'completed' && (
                              <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">
                                <MdGrade className="h-4 w-4 mr-1" />
                                View Results
                              </button>
                            )}
                            {assessment.status === 'pending' && (
                              <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                <MdQuiz className="h-4 w-4 mr-1" />
                                Take Assessment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Certificates</h3>
                  {selectedCourse.certificates.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCourse.certificates.map((certificate) => (
                        <div key={certificate.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <MdWorkspacePremium className="h-8 w-8 text-green-600" />
                              <div>
                                <h4 className="font-medium text-green-900">{certificate.name}</h4>
                                <p className="text-sm text-green-700">
                                  Issued: {new Date(certificate.issueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-md hover:bg-green-50">
                                <MdDownload className="h-4 w-4 mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MdWorkspacePremium className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No certificates available yet</p>
                      <p className="text-sm text-gray-400 mt-2">Complete your course to earn certificates</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
