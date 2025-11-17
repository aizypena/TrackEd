import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken, getStaffUser } from '../../utils/staffAuth';
import { 
  MdMenu, 
  MdPeople, 
  MdSchool, 
  MdPendingActions,
  MdCheckCircle,
  MdTrendingUp,
  MdAssignment,
  MdInventory,
  MdCalendarToday,
  MdWarning
} from 'react-icons/md';

const StaffDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    pendingApplications: 0,
    activeStudents: 0,
    upcomingAssessments: 8,
    lowStockItems: 5
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    // Get user data from localStorage
    const userData = getStaffUser();
    setUser(userData);

    const fetchDashboardData = async () => {
      try {
        const token = getStaffToken();
        
        // Fetch recent applications
        const applicationsResponse = await fetch('https://api.smitracked.cloud/api/staff/recent-applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Fetch enrollments to get active students count
        const enrollmentsResponse = await fetch('https://api.smitracked.cloud/api/staff/enrollments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setRecentApplications(applicationsData.applications);
          
          // Update pending applications count
          const pendingCount = applicationsData.applications.filter(
            app => app.application_status === 'pending'
          ).length;
          
          setStats(prev => ({
            ...prev,
            pendingApplications: pendingCount
          }));
        } else {
          console.error('Failed to fetch applications');
        }

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          
          // Count active students (status 'active')
          const activeStudentsCount = enrollmentsData.enrollments.filter(
            enrollment => enrollment.status === 'active'
          ).length;
          
          setStats(prev => ({
            ...prev,
            activeStudents: activeStudentsCount
          }));
        } else {
          console.error('Failed to fetch enrollments');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { label: 'Pending', class: 'bg-orange-100 text-orange-800' },
      'under review': { label: 'Under Review', class: 'bg-blue-100 text-blue-800' },
      'under_review': { label: 'Under Review', class: 'bg-blue-100 text-blue-800' },
      'approved': { label: 'Approved', class: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', class: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  // Capitalize first letter of name
  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
        user={user}
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold">Staff Dashboard</h1>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Pending Applications */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending Applications</p>
                  <h3 className="text-3xl font-bold text-tracked-primary mt-2">{stats.pendingApplications}</h3>
                  <p className="text-xs text-gray-400 mt-1">Requires review</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <MdPendingActions className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <Link 
                to="/staff/enrollments/applications" 
                className="text-sm text-tracked-secondary hover:text-tracked-primary mt-4 inline-block font-medium"
              >
                View Applications →
              </Link>
            </div>

            {/* Active Students */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Students</p>
                  <h3 className="text-3xl font-bold text-tracked-primary mt-2">{stats.activeStudents}</h3>
                  <p className="text-xs text-gray-400 mt-1">Currently enrolled</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <MdSchool className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <Link 
                to="/staff/students/profiles" 
                className="text-sm text-tracked-secondary hover:text-tracked-primary mt-4 inline-block font-medium"
              >
                View Students →
              </Link>
            </div>

            {/* Upcoming Assessments */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Upcoming Assessments</p>
                  <h3 className="text-3xl font-bold text-tracked-primary mt-2">{stats.upcomingAssessments}</h3>
                  <p className="text-xs text-gray-400 mt-1">Next 30 days</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <MdAssignment className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <Link 
                to="/staff/training/assessments" 
                className="text-sm text-tracked-secondary hover:text-tracked-primary mt-4 inline-block font-medium"
              >
                View Schedule →
              </Link>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Stock Items</p>
                  <h3 className="text-3xl font-bold text-tracked-primary mt-2">{stats.lowStockItems}</h3>
                  <p className="text-xs text-gray-400 mt-1">Needs restocking</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <MdWarning className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <Link 
                to="/staff/inventory/supplies" 
                className="text-sm text-tracked-secondary hover:text-tracked-primary mt-4 inline-block font-medium"
              >
                View Inventory →
              </Link>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
                <Link 
                  to="/staff/enrollments/applications" 
                  className="text-sm text-tracked-secondary hover:text-tracked-primary font-medium"
                >
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tracked-primary"></div>
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applicant</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Program</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.slice(0, 5).map((app) => {
                        const statusInfo = getStatusDisplay(app.application_status);
                        return (
                          <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {capitalizeName(app.first_name)} {capitalizeName(app.last_name)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {app.course_program_formatted || 'Not specified'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatDate(app.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;