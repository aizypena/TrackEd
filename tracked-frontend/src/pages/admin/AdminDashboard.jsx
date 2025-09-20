import React, { useState } from 'react';
import { 
  MdDashboard,
  MdPeople,
  MdSchool,
  MdAssignment,
  MdInventory,
  MdTrendingUp,
  MdSettings,
  MdReport,
  MdNotifications,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdAdd,
  MdEdit,
  MdVisibility,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdCancel,
  MdGroup,
  MdBook,
  MdAttachMoney,
  MdCalendarToday,
  MdBusiness,
  MdVerified,
  MdLocalLibrary
} from 'react-icons/md';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for dashboard statistics
  const dashboardStats = {
    totalStudents: 1247,
    activeApplications: 89,
    totalCourses: 8,
    totalRevenue: 2450000,
    monthlyEnrollments: 156,
    pendingApplications: 23,
    eligibleApplicants: 45,
    waitlistedApplicants: 21,
    completedAssessments: 234,
    activeBatches: 12,
    lowStockItems: 7,
    upcomingAssessments: 15
  };

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'application',
      message: 'New application submitted for Cookery NC II',
      user: 'Maria Santos',
      timestamp: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'enrollment',
      message: 'Payment confirmed for Barista Training',
      user: 'John Dela Cruz',
      timestamp: '5 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'assessment',
      message: 'Assessment results submitted for Housekeeping NC II',
      user: 'Instructor Lopez',
      timestamp: '10 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'inventory',
      message: 'Low stock alert: Coffee beans for Barista training',
      user: 'System',
      timestamp: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 5,
      type: 'application',
      message: 'Applicant marked as eligible for TESDA voucher',
      user: 'Ana Reyes',
      timestamp: '20 minutes ago',
      status: 'approved'
    }
  ];

  // SMI Institute course programs
  const coursePrograms = [
    { name: 'Cookery NC II', students: 185, batches: 3, status: 'Active' },
    { name: 'Bartending', students: 142, batches: 2, status: 'Active' },
    { name: 'Barista Training', students: 167, batches: 3, status: 'Active' },
    { name: 'Housekeeping NC II', students: 123, batches: 2, status: 'Active' },
    { name: 'Food & Beverage Services', students: 156, batches: 2, status: 'Active' },
    { name: 'Bread & Pastry', students: 134, batches: 2, status: 'Active' },
    { name: 'Events Management', students: 89, batches: 1, status: 'Active' },
    { name: 'Chef\'s Catering Services', students: 251, batches: 4, status: 'Active' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <MdPending className="h-4 w-4 text-yellow-500" />;
      case 'completed':
      case 'approved':
        return <MdCheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <MdWarning className="h-4 w-4 text-orange-500" />;
      default:
        return <MdNotifications className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application':
        return 'bg-blue-100 text-blue-800';
      case 'enrollment':
        return 'bg-green-100 text-green-800';
      case 'assessment':
        return 'bg-purple-100 text-purple-800';
      case 'inventory':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <MdDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">TrackEd - SMI Institute Training Center Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <MdNotifications className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdSchool className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeApplications}</p>
                <p className="text-xs text-blue-600 mt-1">{dashboardStats.pendingApplications} pending review</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdAssignment className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱{(dashboardStats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdAttachMoney className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Active Batches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeBatches}</p>
                <p className="text-xs text-purple-600 mt-1">{dashboardStats.upcomingAssessments} assessments due</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MdGroup className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-blue-100 rounded-lg mb-2">
                <MdPeople className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Applications</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-green-100 rounded-lg mb-2">
                <MdSchool className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Enrollment</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-purple-100 rounded-lg mb-2">
                <MdAssignment className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Assessments</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-orange-100 rounded-lg mb-2">
                <MdInventory className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Inventory</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-indigo-100 rounded-lg mb-2">
                <MdTrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Analytics</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-red-100 rounded-lg mb-2">
                <MdReport className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Reports</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-gray-100 rounded-lg mb-2">
                <MdSettings className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
            
            <button className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-3 bg-yellow-100 rounded-lg mb-2">
                <MdVerified className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">User Management</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Status Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Application Management</h2>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <MdAdd className="h-4 w-4 mr-2" />
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.eligibleApplicants}</p>
                  <p className="text-sm text-blue-800">Eligible</p>
                  <p className="text-xs text-blue-600 mt-1">TESDA Voucher</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingApplications}</p>
                  <p className="text-sm text-yellow-800">Pending</p>
                  <p className="text-xs text-yellow-600 mt-1">Under Review</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{dashboardStats.waitlistedApplicants}</p>
                  <p className="text-sm text-orange-800">Waitlisted</p>
                  <p className="text-xs text-orange-600 mt-1">Voucher Limit</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.monthlyEnrollments}</p>
                  <p className="text-sm text-green-800">Enrolled</p>
                  <p className="text-xs text-green-600 mt-1">This Month</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">TESDA Scholarship Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MdCheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Age: 18-65 years old</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdCheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Filipino Citizenship</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdCheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">High School Graduate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.type)}`}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Programs Overview */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">SMI Institute Course Programs</h2>
                <p className="text-sm text-gray-600">Tourism and Hospitality Training Programs</p>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MdFilterList className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <MdAdd className="h-4 w-4 mr-2" />
                  Add Course
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Batches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursePrograms.map((course, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <MdLocalLibrary className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                            <div className="text-sm text-gray-500">TESDA Accredited</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.batches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button className="text-blue-600 hover:text-blue-900">
                            <MdVisibility className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MdMoreVert className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Status: Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <MdBusiness className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">SMI Institute Inc. - TESDA Accredited</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
