import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import { 
  MdMenu, MdSearch, MdSupervisorAccount,
  MdPeople, MdAssignment, MdCardGiftcard, MdTrendingUp, MdShowChart,
  MdInsights, MdCheckCircle, MdVisibility, MdAnalytics, MdBarChart,
  MdInfo, MdWarning, MdError, MdBusiness
} from 'react-icons/md';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get admin user info from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');
  
  const [dashboardStats, setDashboardStats] = useState({
    totalApplicants: 0,
    activeApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    waitlistedApplicants: 0,
    tesdaVouchers: 125,
    eligibleApplicants: 89,
    conversionRate: 74.3,
    enrollmentGrowth: 18.5,
    avgProcessingTime: 3.2,
    activeBatches: 8
  });

  const [forecastingData, setForecastingData] = useState({
    nextMonthPrediction: 0,
    quarterPrediction: 0,
    yearPrediction: 0,
    confidence: 0,
    accuracy: 0
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'application',
      status: 'success',
      priority: 'high',
      message: 'New TESDA voucher application submitted for Data Analytics Program',
      user: 'Maria Santos',
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      type: 'system',
      status: 'info',
      priority: 'medium',
      message: 'ARIMA forecasting model updated with Q4 enrollment data',
      user: 'System',
      timestamp: '15 minutes ago'
    },
    {
      id: 3,
      type: 'approval',
      status: 'success',
      priority: 'high',
      message: 'Batch enrollment approved for Cybersecurity Fundamentals',
      user: 'Admin User',
      timestamp: '1 hour ago'
    },
    {
      id: 4,
      type: 'notification',
      status: 'warning',
      priority: 'medium',
      message: 'TESDA voucher limit approaching for this quarter',
      user: 'System',
      timestamp: '2 hours ago'
    },
    {
      id: 5,
      type: 'maintenance',
      status: 'info',
      priority: 'low',
      message: 'Scheduled system maintenance completed successfully',
      user: 'System',
      timestamp: '4 hours ago'
    }
  ]);

  // Fetch dashboard statistics from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          setDashboardStats({
            totalApplicants: data.totalApplicants || 0,
            activeApplications: data.activeApplications || 0,
            pendingApplications: data.pendingApplications || 0,
            rejectedApplications: data.rejectedApplications || 0,
            waitlistedApplicants: data.waitlistedApplicants || 0,
            tesdaVouchers: data.tesdaVouchers || 0,
            eligibleApplicants: data.eligibleApplicants || 0,
            conversionRate: data.conversionRate || 0,
            enrollmentGrowth: data.enrollmentGrowth || 0,
            avgProcessingTime: data.avgProcessingTime || 0,
            activeBatches: data.activeBatches || 0
          });

          // Update recent activities if available
          if (data.recentActivities && data.recentActivities.length > 0) {
            setRecentActivities(data.recentActivities);
          }
        } else {
          console.error('Failed to fetch dashboard stats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (adminToken) {
      fetchDashboardStats();
    }
  }, [adminToken]);

  // Fetch ARIMA forecast data from API
  useEffect(() => {
    const fetchArimaForecast = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/arima-forecast', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            program: 'all',
            periods: 12  // Fetch 12 quarters (3 years) for different predictions
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Calculate predictions based on forecast data
          if (data.forecast && data.forecast.length > 0) {
            // Next quarter (first forecast point)
            const nextQuarter = data.forecast[0]?.enrollment || 0;
            
            // Next 4 quarters average (1 year)
            const yearForecast = data.forecast.slice(0, 4);
            const yearPrediction = yearForecast.length > 0
              ? Math.round(yearForecast.reduce((sum, f) => sum + (f.enrollment || 0), 0))
              : 0;
            
            // All 12 quarters total (3 years)
            const allForecast = data.forecast.slice(0, 12);
            const threeYearTotal = allForecast.length > 0
              ? Math.round(allForecast.reduce((sum, f) => sum + (f.enrollment || 0), 0))
              : 0;
            
            // Calculate average confidence from forecast
            const avgConfidence = data.forecast.length > 0
              ? Math.round(data.forecast.reduce((sum, f) => sum + (f.confidence || 0), 0) / data.forecast.length)
              : 0;
            
            setForecastingData({
              nextMonthPrediction: nextQuarter,
              quarterPrediction: yearPrediction,
              yearPrediction: threeYearTotal,
              confidence: avgConfidence,
              accuracy: 94.2  // Keep static accuracy for now
            });
          }
        } else {
          console.error('Failed to fetch ARIMA forecast:', response.status);
        }
      } catch (error) {
        console.error('Error fetching ARIMA forecast:', error);
      }
    };

    if (adminToken) {
      fetchArimaForecast();
    }
  }, [adminToken]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <MdWarning className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <MdError className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <MdInfo className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application':
        return 'bg-green-100 text-green-800';
      case 'approval':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'notification':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop: Always visible, Mobile: Toggle */}
      <div className="hidden lg:block">
        <Sidebar 
          isOpen={true} 
          onClose={() => {}}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
                <p className="text-sm text-gray-600">TrackEd Integrated Training Center Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MdSupervisorAccount className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {adminUser.name || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Applicants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalApplicants.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+{dashboardStats.enrollmentGrowth}% growth</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MdPeople className="h-6 w-6 text-blue-600" />
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

            {/* TESDA Vouchers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">TESDA Vouchers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.tesdaVouchers}</p>
                  <p className="text-xs text-purple-600 mt-1">{dashboardStats.eligibleApplicants} eligible</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MdCardGiftcard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ARIMA Forecasting Section - Core Feature */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ARIMA Enrollment Forecasting</h2>
                <p className="text-sm text-gray-600">Predictive analysis for strategic planning</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MdShowChart className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{forecastingData.nextMonthPrediction}</p>
                <p className="text-sm text-blue-800 font-medium">Next Quarter</p>
                <p className="text-xs text-blue-600 mt-1">Predicted Enrollments</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MdBarChart className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{forecastingData.quarterPrediction}</p>
                <p className="text-sm text-purple-800 font-medium">Next Year Total</p>
                <p className="text-xs text-purple-600 mt-1">4 Quarters Forecast</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MdAnalytics className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{forecastingData.yearPrediction}</p>
                <p className="text-sm text-green-800 font-medium">3-Year Projection</p>
                <p className="text-xs text-green-600 mt-1">Strategic Planning</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Management Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Application Management</h2>
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                    <MdVisibility className="h-4 w-4 mr-2" />
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingApplications}</p>
                    <p className="text-sm text-yellow-800">Pending</p>
                    <p className="text-xs text-yellow-600 mt-1">Under review</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{dashboardStats.waitlistedApplicants}</p>
                    <p className="text-sm text-orange-800">Waitlisted</p>
                    <p className="text-xs text-orange-600 mt-1">Voucher limit</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{dashboardStats.rejectedApplications}</p>
                    <p className="text-sm text-red-800">Rejected</p>
                    <p className="text-xs text-red-600 mt-1">Ineligible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Activities */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">System Activities</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(activity.priority)}`}>
                      <div className="flex items-start space-x-3">
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
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default AdminDashboard;