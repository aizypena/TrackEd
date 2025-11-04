import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdMenu,
  MdSearch,
  MdDownload,
  MdRefresh,
  MdPrint,
  MdTrendingUp,
  MdTrendingDown,
  MdPeople,
  MdSchool,
  MdCalendarToday,
  MdBarChart,
  MdShowChart,
  MdPieChart,
  MdTimeline,
  MdFilterList,
  MdClose
} from 'react-icons/md';

const StaffEnrollmentTrends = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [yearFilter, setYearFilter] = useState('2025');
  const [programFilter, setProgramFilter] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    yearly: {},
    monthly: [],
    programBreakdown: [],
    demographics: {
      gender: [],
      ageGroups: []
    },
    conversionRate: {
      applications: 0,
      enrolled: 0,
      rate: 0,
      withdrawn: 0,
      rejected: 0
    }
  });
  const [programs, setPrograms] = useState([]);

  // Fetch enrollment trends on mount and when year changes
  useEffect(() => {
    fetchEnrollmentTrends();
  }, [yearFilter]);

  const fetchEnrollmentTrends = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      const response = await fetch(`http://localhost:8000/api/staff/enrollment-trends?year=${yearFilter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setEnrollmentData(result.data);
        // Extract unique programs
        const uniquePrograms = result.data.programBreakdown.map(p => p.program);
        setPrograms(uniquePrograms);
      } else {
        toast.error('Failed to load enrollment trends');
      }
    } catch (error) {
      console.error('Error fetching enrollment trends:', error);
      toast.error('Failed to load enrollment trends: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <MdTrendingUp className="h-5 w-5 text-green-600" />;
    } else if (trend === 'down') {
      return <MdTrendingDown className="h-5 w-5 text-red-600" />;
    }
    return <MdShowChart className="h-5 w-5 text-blue-600" />;
  };

  const filteredPrograms = programFilter === 'all' 
    ? enrollmentData.programBreakdown 
    : enrollmentData.programBreakdown.filter(p => p.program === programFilter);

  const currentYearData = enrollmentData.yearly[yearFilter] || enrollmentData.yearly['2025'] || { total: 0, growth: 0 };
  const totalEnrollments = enrollmentData.programBreakdown.reduce((sum, p) => sum + p.enrollments, 0);

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
              <div>
                <h1 className="text-xl font-bold">Enrollment Trends</h1>
                <p className="text-sm text-blue-100">Analytics and insights on enrollment patterns</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MdFilterList className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                {Object.keys(enrollmentData.yearly).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                <option value="all">All Programs</option>
                {programs.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
              <div className="ml-auto flex gap-2">
                <button 
                  onClick={fetchEnrollmentTrends}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                  <MdDownload className="h-5 w-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdPeople className="h-6 w-6 text-blue-600" />
                </div>
                {currentYearData.growth > 0 && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <MdTrendingUp className="h-4 w-4" />
                    +{currentYearData.growth.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Enrollments</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{currentYearData.total}</p>
              <p className="text-xs text-gray-500 mt-1">Year {yearFilter}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdSchool className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Active Programs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{enrollmentData.programBreakdown.length}</p>
              <p className="text-xs text-gray-500 mt-1">NCII Qualifications</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdBarChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{enrollmentData.conversionRate.rate}%</p>
              <p className="text-xs text-gray-500 mt-1">{enrollmentData.conversionRate.enrolled} of {enrollmentData.conversionRate.applications} applicants</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MdTimeline className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Avg. Batch Size</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {enrollmentData.programBreakdown.length > 0 
                  ? Math.round(enrollmentData.programBreakdown.reduce((sum, p) => sum + p.avgBatchSize, 0) / enrollmentData.programBreakdown.length)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Students per batch</p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MdShowChart className="h-6 w-6 text-tracked-primary" />
                Monthly Enrollment Trend - {yearFilter}
              </h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <MdRefresh className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading trend data...
                </div>
              ) : enrollmentData.monthly && enrollmentData.monthly.length > 0 ? (
                enrollmentData.monthly.map((month, index) => {
                const maxValue = Math.max(...enrollmentData.monthly.map(m => m.applications || 1));
                const enrollmentPercentage = (month.enrollments / maxValue) * 100;
                const applicationPercentage = (month.applications / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-12">{month.month}</span>
                      <div className="flex-1 mx-4">
                        <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                          {month.applications > 0 && (
                            <div 
                              className="absolute h-full bg-blue-200 rounded-lg transition-all duration-300"
                              style={{ width: `${applicationPercentage}%` }}
                            />
                          )}
                          <div 
                            className="absolute h-full bg-tracked-primary rounded-lg transition-all duration-300"
                            style={{ width: `${enrollmentPercentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-xs font-semibold text-white">
                              {month.enrollments} enrolled
                            </span>
                            {month.applications > 0 && (
                              <span className="text-xs font-medium text-gray-700">
                                {month.applications} applied
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-20">
                        {month.applications > 0 ? (
                          <span className="text-sm font-bold text-tracked-primary">
                            {((month.enrollments / month.applications) * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No enrollment data available for {yearFilter}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-tracked-primary rounded"></div>
                <span className="text-sm text-gray-600">Enrollments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span className="text-sm text-gray-600">Applications</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Program Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MdBarChart className="h-6 w-6 text-tracked-primary" />
                Program Performance
              </h2>
              <div className="space-y-6">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-800">{program.program}</span>
                          {getTrendIcon(program.trend)}
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="text-lg font-bold text-tracked-primary">{program.enrollments}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {program.percentage ? program.percentage.toFixed(1) : '0.0'}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${
                            program.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            program.trend === 'down' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${program.percentage || 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">
                            <span className="font-semibold text-gray-700">{program.batches || 0}</span> batches
                          </span>
                          <span className="text-gray-600">
                            Avg: <span className="font-semibold text-gray-700">{program.avgBatchSize || 0}</span> students
                          </span>
                        </div>
                        <span className={`font-semibold ${
                          program.growthRate > 0 ? 'text-green-600' :
                          program.growthRate < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {program.growthRate > 0 ? '+' : ''}{program.growthRate || 0}% growth
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MdBarChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No program data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MdPieChart className="h-6 w-6 text-tracked-primary" />
                Demographics Overview
              </h2>
              
              {/* Gender Distribution */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Gender Distribution</h3>
                <div className="space-y-3">
                  {enrollmentData.demographics.gender.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.category}</span>
                        <span className="text-sm font-bold text-gray-800">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-pink-600'}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Groups */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Age Groups</h3>
                <div className="space-y-3">
                  {enrollmentData.demographics.ageGroups.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.group} years</span>
                        <span className="text-sm font-bold text-gray-800">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-purple-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Year-over-Year Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdCalendarToday className="h-6 w-6 text-tracked-primary" />
              Year-over-Year Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(enrollmentData.yearly).map(([year, data]) => (
                <div 
                  key={year} 
                  className={`p-6 rounded-lg border-2 transition-all ${
                    year === yearFilter 
                      ? 'border-tracked-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium mb-2">{year}</p>
                    <p className="text-4xl font-bold text-gray-800 mb-3">{data.total}</p>
                    {data.growth > 0 && (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <MdTrendingUp className="h-5 w-5" />
                        <span className="text-lg font-semibold">+{data.growth}%</span>
                      </div>
                    )}
                    {data.growth === 0 && (
                      <p className="text-sm text-gray-400">Base year</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default StaffEnrollmentTrends;
