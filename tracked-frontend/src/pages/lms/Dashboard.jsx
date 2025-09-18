import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { 
  MdSchool, 
  MdFolder, 
  MdFactCheck, 
  MdQuiz, 
  MdWorkspacePremium,
  MdMenu,
  MdPictureAsPdf,
  MdPlayCircleOutline,
  MdDescription
} from 'react-icons/md';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    enrolledCourses: 4,
    totalMaterials: 28,
    attendanceRate: 92,
    pendingAssessments: 3,
    certificatesEarned: 2
  });

  useEffect(() => {
    // Get user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const recentCourses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      schedule: "Mon, Wed, Fri - 9:00 AM",
      instructor: "Prof. Maria Santos",
      materials: 12,
      nextClass: "September 20, 2025",
      attendance: "18/20 sessions"
    },
    {
      id: 2,
      title: "Digital Marketing Essentials",
      schedule: "Tue, Thu - 2:00 PM",
      instructor: "Prof. Juan Cruz",
      materials: 8,
      nextClass: "September 19, 2025",
      attendance: "15/16 sessions"
    },
    {
      id: 3,
      title: "Data Analysis with Excel",
      schedule: "Sat - 10:00 AM",
      instructor: "Prof. Ana Rodriguez",
      materials: 6,
      nextClass: "September 21, 2025",
      attendance: "7/8 sessions"
    },
    {
      id: 4,
      title: "Project Management Basics",
      schedule: "Wed - 3:00 PM",
      instructor: "Prof. Carlos Mendez",
      materials: 10,
      nextClass: "September 25, 2025",
      attendance: "12/14 sessions"
    }
  ];

  const pendingAssessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      course: "Web Development Fundamentals",
      type: "Online Quiz",
      dueDate: "September 22, 2025",
      duration: "45 minutes",
      status: "pending"
    },
    {
      id: 2,
      title: "Marketing Strategy Project",
      course: "Digital Marketing Essentials", 
      type: "Project Submission",
      dueDate: "September 25, 2025",
      duration: "N/A",
      status: "in-progress"
    },
    {
      id: 3,
      title: "Excel Data Analysis Case Study",
      course: "Data Analysis with Excel",
      type: "Practical Assessment",
      dueDate: "September 28, 2025",
      duration: "2 hours",
      status: "pending"
    }
  ];

  const recentMaterials = [
    {
      id: 1,
      title: "JavaScript ES6 Features.pdf",
      course: "Web Development Fundamentals",
      type: "PDF",
      uploadDate: "September 15, 2025",
      size: "2.3 MB"
    },
    {
      id: 2,
      title: "Social Media Marketing Trends 2025.pptx",
      course: "Digital Marketing Essentials",
      type: "Presentation",
      uploadDate: "September 14, 2025",
      size: "5.1 MB"
    },
    {
      id: 3,
      title: "Advanced Excel Functions Tutorial.mp4",
      course: "Data Analysis with Excel",
      type: "Video",
      uploadDate: "September 13, 2025",
      size: "45.7 MB"
    }
  ];

  const certificates = [
    {
      id: 1,
      title: "Basic Computer Literacy",
      issueDate: "August 15, 2025",
      status: "approved",
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Digital Literacy Fundamentals",
      issueDate: "July 20, 2025",
      status: "approved", 
      downloadUrl: "#"
    }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: "JavaScript Project",
      course: "Web Development",
      dueDate: "2025-09-20",
      status: "pending"
    },
    {
      id: 2,
      title: "Marketing Campaign Analysis",
      course: "Digital Marketing",
      dueDate: "2025-09-22",
      status: "draft"
    },
    {
      id: 3,
      title: "Data Visualization Report",
      course: "Data Analysis",
      dueDate: "2025-09-25",
      status: "pending"
    }
  ];

  const recentGrades = [
    { course: "Web Development", assignment: "HTML/CSS Quiz", grade: 92, date: "2025-09-15" },
    { course: "Digital Marketing", assignment: "SEO Assignment", grade: 88, date: "2025-09-12" },
    { course: "Data Analysis", assignment: "Excel Functions Test", grade: 95, date: "2025-09-10" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                  <MdMenu className="h-6 w-6" />
                </button>
                <img 
                  src="/smi-logo.jpg" 
                  alt="SMI Logo" 
                  className="h-8 w-auto ml-2"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'S'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.first_name || 'Student'}!
                </h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your courses today.</p>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Student
                  </span>
                </div>
              </div>
            </div>
          </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdSchool className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.enrolledCourses}</p>
                <p className="text-sm text-gray-600">Enrolled Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdFolder className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMaterials}</p>
                <p className="text-sm text-gray-600">Course Materials</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MdFactCheck className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <MdQuiz className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingAssessments}</p>
                <p className="text-sm text-gray-600">Pending Assessments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MdWorkspacePremium className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.certificatesEarned}</p>
                <p className="text-sm text-gray-600">Certificates Earned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Schedule & Attendance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Course Schedule & Attendance</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                          <p className="text-sm text-blue-600 font-medium">{course.schedule}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {course.attendance}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Course Materials</p>
                          <p className="text-sm font-medium text-gray-900">{course.materials} files</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Class</p>
                          <p className="text-sm font-medium text-gray-900">{course.nextClass}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                            View Materials
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
                            View Schedule
                          </button>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Attendance History →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Assessments */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pending Assessments</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingAssessments.map((assessment) => (
                    <div key={assessment.id} className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                      <p className="text-sm text-gray-600">{assessment.course}</p>
                      <p className="text-xs text-gray-500">Type: {assessment.type}</p>
                      <p className="text-xs text-gray-500">Due: {assessment.dueDate}</p>
                      <p className="text-xs text-gray-500">Duration: {assessment.duration}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                        assessment.status === 'pending' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                  View All Assessments
                </button>
              </div>
            </div>

            {/* Recent Course Materials */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Materials</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentMaterials.map((material) => (
                    <div key={material.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${
                            material.type === 'PDF' ? 'bg-red-100 text-red-600' :
                            material.type === 'Video' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {material.type === 'PDF' ? (
                              <MdPictureAsPdf className="h-4 w-4" />
                            ) : material.type === 'Video' ? (
                              <MdPlayCircleOutline className="h-4 w-4" />
                            ) : (
                              <MdDescription className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                            <p className="text-xs text-gray-500">{material.course}</p>
                            <p className="text-xs text-gray-400">{material.size} • {material.uploadDate}</p>
                          </div>
                        </div>
                      </div>
                      <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                  Browse All Materials
                </button>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Certificates</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{certificate.title}</p>
                        <p className="text-xs text-gray-500">Issued: {certificate.issueDate}</p>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded mt-1">
                          {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                        </span>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                  View All Certificates
                </button>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
