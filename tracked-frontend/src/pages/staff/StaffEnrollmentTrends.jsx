import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
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
  const [viewMode, setViewMode] = useState('overview'); // overview, monthly, program, comparison
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Mock data - replace with actual API calls
  const enrollmentData = {
    yearly: {
      2023: { total: 450, growth: 0 },
      2024: { total: 580, growth: 28.9 },
      2025: { total: 720, growth: 24.1 }
    },
    monthly2025: [
      { month: 'Jan', enrollments: 85, applications: 110 },
      { month: 'Feb', enrollments: 72, applications: 95 },
      { month: 'Mar', enrollments: 68, applications: 88 },
      { month: 'Apr', enrollments: 78, applications: 102 },
      { month: 'May', enrollments: 82, applications: 108 },
      { month: 'Jun', enrollments: 95, applications: 120 },
      { month: 'Jul', enrollments: 88, applications: 115 },
      { month: 'Aug', enrollments: 76, applications: 98 },
      { month: 'Sep', enrollments: 90, applications: 118 },
      { month: 'Oct', enrollments: 86, applications: 0 }
    ],
    programBreakdown: [
      { 
        program: 'Welding NCII', 
        enrollments: 185, 
        percentage: 25.7,
        trend: 'up',
        growthRate: 15.2,
        batches: 6,
        avgBatchSize: 31
      },
      { 
        program: 'Automotive Servicing NCII', 
        enrollments: 165, 
        percentage: 22.9,
        trend: 'up',
        growthRate: 22.5,
        batches: 5,
        avgBatchSize: 33
      },
      { 
        program: 'Electronics NCII', 
        enrollments: 128, 
        percentage: 17.8,
        trend: 'up',
        growthRate: 18.9,
        batches: 4,
        avgBatchSize: 32
      },
      { 
        program: 'Food Processing NCII', 
        enrollments: 95, 
        percentage: 13.2,
        trend: 'down',
        growthRate: -5.3,
        batches: 3,
        avgBatchSize: 32
      },
      { 
        program: 'Plumbing NCII', 
        enrollments: 82, 
        percentage: 11.4,
        trend: 'up',
        growthRate: 28.6,
        batches: 3,
        avgBatchSize: 27
      },
      { 
        program: 'Carpentry NCII', 
        enrollments: 65, 
        percentage: 9.0,
        trend: 'stable',
        growthRate: 2.1,
        batches: 2,
        avgBatchSize: 33
      }
    ],
    demographics: {
      gender: [
        { category: 'Male', count: 542, percentage: 75.3 },
        { category: 'Female', count: 178, percentage: 24.7 }
      ],
      ageGroups: [
        { group: '18-24', count: 285, percentage: 39.6 },
        { group: '25-34', count: 312, percentage: 43.3 },
        { group: '35-44', count: 95, percentage: 13.2 },
        { group: '45+', count: 28, percentage: 3.9 }
      ]
    },
    conversionRate: {
      applications: 940,
      enrolled: 720,
      rate: 76.6,
      withdrawn: 85,
      rejected: 135
    }
  };

  const programs = [
    'Welding NCII',
    'Automotive Servicing NCII',
    'Electronics NCII',
    'Food Processing NCII',
    'Plumbing NCII',
    'Carpentry NCII'
  ];

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

  const currentYearData = enrollmentData.yearly[yearFilter] || enrollmentData.yearly['2025'];
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
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors">
                <MdDownload className="h-5 w-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
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
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdRefresh className="h-5 w-5" />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print
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
                {Math.round(enrollmentData.programBreakdown.reduce((sum, p) => sum + p.avgBatchSize, 0) / enrollmentData.programBreakdown.length)}
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
              {enrollmentData.monthly2025.map((month, index) => {
                const maxValue = Math.max(...enrollmentData.monthly2025.map(m => m.applications));
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
              })}
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
              <div className="space-y-4">
                {filteredPrograms.map((program, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{program.program}</span>
                        {getTrendIcon(program.trend)}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-tracked-primary">{program.enrollments}</span>
                        <span className="text-xs text-gray-500 ml-1">({program.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          program.trend === 'up' ? 'bg-green-600' :
                          program.trend === 'down' ? 'bg-red-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: `${program.percentage * 3.89}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{program.batches} batches</span>
                      <span className={`font-medium ${
                        program.growthRate > 0 ? 'text-green-600' :
                        program.growthRate < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {program.growthRate > 0 ? '+' : ''}{program.growthRate}% growth
                      </span>
                    </div>
                  </div>
                ))}
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

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdTimeline className="h-6 w-6 text-tracked-primary" />
              Application to Enrollment Funnel
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Applications Received</span>
                  <span className="text-lg font-bold text-blue-600">{enrollmentData.conversionRate.applications}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-lg h-12 flex items-center justify-center">
                  <span className="text-blue-800 font-semibold">100%</span>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Successfully Enrolled</span>
                  <span className="text-lg font-bold text-green-600">{enrollmentData.conversionRate.enrolled}</span>
                </div>
                <div 
                  className="bg-green-500 rounded-lg h-12 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${enrollmentData.conversionRate.rate}%` }}
                >
                  <span className="text-white font-semibold">{enrollmentData.conversionRate.rate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Withdrawn</span>
                    <span className="text-sm font-bold text-yellow-600">{enrollmentData.conversionRate.withdrawn}</span>
                  </div>
                  <div 
                    className="bg-yellow-400 rounded-lg h-8 flex items-center justify-center"
                    style={{ width: `${(enrollmentData.conversionRate.withdrawn / enrollmentData.conversionRate.applications) * 100}%` }}
                  >
                    <span className="text-yellow-900 text-sm font-semibold">
                      {((enrollmentData.conversionRate.withdrawn / enrollmentData.conversionRate.applications) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                    <span className="text-sm font-bold text-red-600">{enrollmentData.conversionRate.rejected}</span>
                  </div>
                  <div 
                    className="bg-red-400 rounded-lg h-8 flex items-center justify-center"
                    style={{ width: `${(enrollmentData.conversionRate.rejected / enrollmentData.conversionRate.applications) * 100}%` }}
                  >
                    <span className="text-red-900 text-sm font-semibold">
                      {((enrollmentData.conversionRate.rejected / enrollmentData.conversionRate.applications) * 100).toFixed(1)}%
                    </span>
                  </div>
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
    </div>
  );
};

export default StaffEnrollmentTrends;
