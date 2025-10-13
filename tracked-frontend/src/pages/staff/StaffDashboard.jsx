import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import { 
  MdMenu, 
  MdPeople, 
  MdSchool, 
  MdPendingActions,
  MdCheckCircle,
  MdTrendingUp,
  MdAssignment,
  MdInventory,
  MdNotifications,
  MdCalendarToday,
  MdWarning
} from 'react-icons/md';

const StaffDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data - replace with actual API calls
  const [stats, setStats] = useState({
    pendingApplications: 0,
    activeStudents: 156,
    upcomingAssessments: 8,
    lowStockItems: 5
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Welding NCII Assessment', date: '2025-10-10', time: '09:00 AM', type: 'assessment' },
    { id: 2, title: 'New Batch Orientation', date: '2025-10-12', time: '02:00 PM', type: 'orientation' },
    { id: 3, title: 'Equipment Maintenance', date: '2025-10-15', time: '10:00 AM', type: 'maintenance' }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'New application submitted', user: 'Juan Dela Cruz', time: '2 hours ago' },
    { id: 2, action: 'Student enrolled', user: 'Maria Santos', time: '5 hours ago' },
    { id: 3, action: 'Assessment completed', user: 'Welding Batch 03', time: '1 day ago' },
    { id: 4, action: 'Equipment request approved', user: 'Workshop A', time: '2 days ago' }
  ]);

  // Fetch recent applications on component mount
  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        const token = getStaffToken();
        const response = await fetch('http://localhost:8000/api/staff/recent-applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecentApplications(data.applications);
          
          // Update pending applications count
          const pendingCount = data.applications.filter(
            app => app.application_status === 'pending'
          ).length;
          setStats(prev => ({
            ...prev,
            pendingApplications: pendingCount
          }));
        } else {
          console.error('Failed to fetch applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentApplications();
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
      'approved': { label: 'Approved', class: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', class: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
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
                  <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.slice(0, 5).map((app) => {
                        const statusInfo = getStatusDisplay(app.application_status);
                        return (
                          <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {app.first_name} {app.last_name}
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
                            <td className="py-3 px-4">
                              <button className="text-tracked-secondary hover:text-tracked-primary text-sm font-medium">
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                <MdCalendarToday className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-tracked-secondary pl-4 py-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.date} at {event.time}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                      event.type === 'assessment' 
                        ? 'bg-blue-100 text-blue-700'
                        : event.type === 'orientation'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
              <Link 
                to="/staff/training/schedule" 
                className="text-sm text-tracked-secondary hover:text-tracked-primary mt-4 inline-block font-medium"
              >
                View Full Calendar →
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <MdNotifications className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-tracked-secondary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.action}</span>
                      {' - '}
                      <span className="text-gray-600">{activity.user}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/staff/enrollments/applications" 
              className="bg-tracked-primary hover:bg-tracked-secondary text-white p-4 rounded-lg shadow-md transition-colors"
            >
              <MdPeople className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Process Applications</h3>
              <p className="text-sm text-blue-100 mt-1">Review and approve new applications</p>
            </Link>

            <Link 
              to="/staff/training/batches" 
              className="bg-tracked-primary hover:bg-tracked-secondary text-white p-4 rounded-lg shadow-md transition-colors"
            >
              <MdSchool className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Manage Batches</h3>
              <p className="text-sm text-blue-100 mt-1">Create and manage training batches</p>
            </Link>

            <Link 
              to="/staff/inventory/equipment" 
              className="bg-tracked-primary hover:bg-tracked-secondary text-white p-4 rounded-lg shadow-md transition-colors"
            >
              <MdInventory className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Update Inventory</h3>
              <p className="text-sm text-blue-100 mt-1">Track equipment and supplies</p>
            </Link>

            <Link 
              to="/staff/reports/enrollment" 
              className="bg-tracked-primary hover:bg-tracked-secondary text-white p-4 rounded-lg shadow-md transition-colors"
            >
              <MdTrendingUp className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Generate Reports</h3>
              <p className="text-sm text-blue-100 mt-1">View analytics and insights</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;