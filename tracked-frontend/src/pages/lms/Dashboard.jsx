import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdSchool,
  MdFolder, 
  MdFactCheck, 
  MdQuiz, 
  MdWorkspacePremium,
  MdMenu,
  MdPictureAsPdf,
  MdPlayCircleOutline,
  MdDescription,
  MdSchedule
} from 'react-icons/md';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [batchInfo, setBatchInfo] = useState(null);
  const [programInfo, setProgramInfo] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
      fetchStudentSchedule();
      fetchPendingAssessments();
    }
  }, []);

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('http://localhost:8000/api/student/schedule', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentSchedule(data.schedule || []);
        setBatchInfo(data.batch);
        setProgramInfo(data.program);
        setTrainerInfo(data.trainer);
      } else {
        console.error('Failed to fetch schedule');
        setStudentSchedule([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setStudentSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const fetchPendingAssessments = async () => {
    try {
      setLoadingAssessments(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('http://localhost:8000/api/student/pending-assessments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingAssessments(data.assessments || []);
      } else {
        console.error('Failed to fetch pending assessments');
        setPendingAssessments([]);
      }
    } catch (error) {
      console.error('Error fetching pending assessments:', error);
      setPendingAssessments([]);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const recentMaterials = [
    {
      id: 1,
      title: "Basic Knife Skills and Safety.pdf",
      course: "Cookery NC II",
      type: "PDF",
      uploadDate: "September 15, 2025",
      size: "3.2 MB"
    },
    {
      id: 2,
      title: "Professional Service Standards.pptx",
      course: "Food and Beverage Services NC II",
      type: "Presentation",
      uploadDate: "September 14, 2025",
      size: "4.8 MB"
    },
    {
      id: 3,
      title: "Bread Making Techniques Tutorial.mp4",
      course: "Bread and Pastry Production NC II",
      type: "Video",
      uploadDate: "September 13, 2025",
      size: "52.1 MB"
    }
  ];

  const certificates = [
    {
      id: 1,
      title: "Barista NC II Certificate",
      issueDate: "August 15, 2025",
      status: "approved",
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Food Safety and Sanitation Certificate",
      issueDate: "July 20, 2025",
      status: "approved", 
      downloadUrl: "#"
    }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: "Menu Planning Project",
      course: "Cookery NC II",
      dueDate: "2025-09-20",
      status: "pending"
    },
    {
      id: 2,
      title: "Service Training Portfolio",
      course: "Food and Beverage Services NC II",
      dueDate: "2025-09-22",
      status: "draft"
    },
    {
      id: 3,
      title: "Pastry Recipe Development",
      course: "Bread and Pastry Production NC II",
      dueDate: "2025-09-25",
      status: "pending"
    }
  ];

  const recentGrades = [
    { course: "Cookery NC II", assignment: "Kitchen Safety Quiz", grade: 92, date: "2025-09-15" },
    { course: "Food and Beverage Services NC II", assignment: "Service Standards Assessment", grade: 88, date: "2025-09-12" },
    { course: "Bread and Pastry Production NC II", assignment: "Basic Dough Preparation", grade: 95, date: "2025-09-10" }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Schedule & Attendance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Course Schedule & Attendance</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading schedule...</p>
                  </div>
                ) : studentSchedule.length === 0 ? (
                  <div className="text-center py-8">
                    <MdSchedule className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No schedule available yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Please contact the administration office.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{programInfo?.name || 'N/A'}</h3>
                          {trainerInfo && trainerInfo.name !== 'TBA' && (
                            <p className="text-sm text-gray-600">Instructor: {trainerInfo.name}</p>
                          )}
                          <div className="mt-2 space-y-1">
                            {studentSchedule.map((schedule, index) => (
                              <p key={index} className="text-sm text-blue-600 font-medium">
                                {daysOfWeek[schedule.dayOfWeek]} - {formatTime(schedule.startTime)} to {formatTime(schedule.endTime)}
                              </p>
                            ))}
                          </div>
                        </div>
                        {batchInfo && (
                          <div className="text-right">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {batchInfo.batch_id}
                            </span>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{batchInfo.status}</p>
                          </div>
                        )}
                      </div>
                      
                      {batchInfo && (
                        <div className="grid grid-cols-2 gap-4 mb-3 pt-3 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {batchInfo.start_date ? new Date(batchInfo.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">End Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {batchInfo.end_date ? new Date(batchInfo.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <Link to="/smi-lms/schedule" className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                          View Full Schedule
                        </Link>
                        <Link to="/smi-lms/attendance" className="text-xs text-blue-600 hover:text-blue-800">
                          Attendance History →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
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
                {loadingAssessments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assessments...</p>
                  </div>
                ) : pendingAssessments.length === 0 ? (
                  <div className="text-center py-8">
                    <MdQuiz className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending assessments</p>
                    <p className="text-gray-500 text-sm mt-2">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAssessments.map((assessment) => (
                      <div key={assessment.id} className="border-l-4 border-orange-400 pl-4">
                        <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                        <p className="text-sm text-gray-600">{assessment.program_name}</p>
                        <p className="text-xs text-gray-500">Questions: {assessment.total_questions}</p>
                        <p className="text-xs text-gray-500">Duration: {assessment.duration} minutes</p>
                        {assessment.due_date && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(assessment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                        <Link
                          to={`/smi-lms/assessments/${assessment.id}`}
                          className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                        >
                          Take Assessment
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <Link 
                  to="/smi-lms/assessments"
                  className="block w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors text-center"
                >
                  View All Assessments
                </Link>
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
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
