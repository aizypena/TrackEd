import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import OnboardingTour from '../../components/trainer/OnboardingTour';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdPeople, 
  MdAssignment, 
  MdUpload, 
  MdGrade, 
  MdCheckCircle, 
  MdMenu,
  MdRefresh
} from 'react-icons/md';

const TrainerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    pendingExams: 0,
    courseMaterials: 0,
    pendingGrades: 0,
    certificationRequests: 0
  });

  // Check for first login to show onboarding tour
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('trainerOnboardingCompleted');
    if (!onboardingCompleted) {
      // Small delay to ensure sidebar is rendered
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('trainerToken');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/trainer/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          toast.error(data.message || 'Failed to load dashboard data');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Active Students',
      count: stats.activeStudents,
      description: 'Currently enrolled students',
      icon: <MdPeople className="h-8 w-8 text-blue-600" />,
      path: '/trainer-lms/students'
    },
    {
      title: 'Pending Exams',
      count: stats.pendingExams,
      description: 'Assessments to be taken by students',
      icon: <MdAssignment className="h-8 w-8 text-yellow-600" />,
      path: '/trainer-lms/assessment-management'
    },
    {
      title: 'Course Materials',
      count: stats.courseMaterials,
      description: 'Uploaded learning materials',
      icon: <MdUpload className="h-8 w-8 text-green-600" />,
      path: '/trainer-lms/course-materials'
    },
    {
      title: 'Pending Grades',
      count: stats.pendingGrades,
      description: 'Students needing grade entries',
      icon: <MdGrade className="h-8 w-8 text-purple-600" />,
      path: '/trainer-lms/grades'
    },
    {
      title: 'Certification Requests',
      count: stats.certificationRequests,
      description: 'Students ready for certification',
      icon: <MdCheckCircle className="h-8 w-8 text-red-600" />,
      path: '/trainer-lms/certification'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Onboarding Tour - Shows on first login */}
      {showOnboarding && (
        <OnboardingTour 
          onComplete={() => setShowOnboarding(false)}
          sidebarExpanded={!isCollapsed}
          setSidebarExpanded={(expanded) => setIsCollapsed(!expanded)}
        />
      )}

      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Trainer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardStats}
                disabled={loading}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                title="Refresh"
              >
                <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-sm text-gray-500">Welcome back, Trainer</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
                    <span className="text-2xl font-bold text-gray-900">{card.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                  <Link
                    to={card.path}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default TrainerDashboard;