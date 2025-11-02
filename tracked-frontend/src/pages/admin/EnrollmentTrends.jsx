import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdCalendarToday,
  MdTrendingUp,
  MdPeople,
  MdSchool,
  MdRefresh,
  MdDownload,
  MdFilterList,
} from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const EnrollmentTrends = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('3years');
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('quarterly');
  const [comparisonYear, setComparisonYear] = useState('2025');
  
  const [trendsData, setTrendsData] = useState({
    quarterlyData: {},
    programTotals: {},
    stats: {
      totalPrograms: 0,
      totalEnrollments: 0,
      avgPerProgram: 0
    }
  });

  // Fetch data from backend
  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/enrollment-trends', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
      } else {
        toast.error('Failed to load enrollment data');
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, []);

  // Filter data by time range
  const getFilteredQuarterlyData = () => {
    const quarters = Object.keys(trendsData.quarterlyData || {}).sort((a, b) => {
      const matchA = a.match(/Q(\d) (\d+)/);
      const matchB = b.match(/Q(\d) (\d+)/);
      const yearA = parseInt(matchA[2]);
      const yearB = parseInt(matchB[2]);
      const quarterA = parseInt(matchA[1]);
      const quarterB = parseInt(matchB[1]);
      
      if (yearA !== yearB) return yearA - yearB;
      return quarterA - quarterB;
    });
    
    if (timeRange === '3years') {
      return quarters.slice(-12); // Last 12 quarters = 3 years
    } else if (timeRange === '5years') {
      return quarters.slice(-20); // Last 20 quarters = 5 years
    }
    return quarters; // All time
  };

  // Calculate growth rate
  const calculateGrowthRate = () => {
    const quarters = getFilteredQuarterlyData();
    if (quarters.length < 2) return 0;
    
    const recent = trendsData.quarterlyData[quarters[quarters.length - 1]] || 0;
    const previous = trendsData.quarterlyData[quarters[quarters.length - 2]] || 0;
    
    if (previous === 0) return 0;
    return (((recent - previous) / previous) * 100).toFixed(1);
  };

  // Calculate NC II vs NC III distribution
  const nc2Programs = Object.keys(trendsData.programTotals || {}).filter(p => p.includes('NC II'));
  const nc3Programs = Object.keys(trendsData.programTotals || {}).filter(p => p.includes('NC III'));
  
  const nc2Total = nc2Programs.reduce((sum, prog) => sum + (trendsData.programTotals[prog] || 0), 0);
  const nc3Total = nc3Programs.reduce((sum, prog) => sum + (trendsData.programTotals[prog] || 0), 0);

  const filteredQuarters = getFilteredQuarterlyData();

  // Prepare chart data from CSV
  const popularPrograms = {
    labels: Object.keys(trendsData.programTotals || {}),
    datasets: [
      {
        label: 'Total Enrollments',
        data: Object.values(trendsData.programTotals || {}),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(201, 203, 207, 0.8)',
          'rgba(145, 232, 225, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Enrollment trends from CSV
  const enrollmentTrends = {
    labels: filteredQuarters,
    datasets: [
      {
        label: 'Quarterly Enrollments',
        data: filteredQuarters.map(q => trendsData.quarterlyData[q] || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  // Qualification distribution from CSV
  const qualificationDistribution = {
    labels: ['NC II', 'NC III'],
    datasets: [
      {
        data: [nc2Total, nc3Total],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Most Popular Training Programs'
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Enrollment Trends Over Time'
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Qualification Level Distribution'
      }
    }
  };

  const handleRefresh = () => {
    fetchTrendsData();
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Quarter,Enrollments\n" +
      filteredQuarters.map(q => `${q},${trendsData.quarterlyData[q]}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "enrollment_trends.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Enrollment Trends</h1>
                <p className="text-sm text-gray-500">Analytics and insights about training programs</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="quarterly">Quarterly View</option>
                  <option value="yearly">Yearly View</option>
                  <option value="program">By Program</option>
                </select>
                <select
                  value={comparisonYear}
                  onChange={(e) => setComparisonYear(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="3years">Last 3 Years</option>
                  <option value="5years">Last 5 Years</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Export data as CSV/PDF"
                >
                  <MdDownload className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programs</p>
                  <p className="text-2xl font-semibold text-gray-900">15</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdSchool className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-semibold text-gray-900">520</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <MdPeople className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-semibold text-green-600">+15%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <MdTrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion Rate</p>
                  <p className="text-2xl font-semibold text-blue-600">85%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdCalendarToday className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Programs Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div style={{ height: '400px' }}>
                <Bar data={popularPrograms} options={barOptions} />
              </div>
            </div>

            {/* Enrollment Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div style={{ height: '400px' }}>
                <Line data={enrollmentTrends} options={lineOptions} />
              </div>
            </div>

            {/* Qualification Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div style={{ height: '400px' }}>
                <Doughnut data={qualificationDistribution} options={doughnutOptions} />
              </div>
            </div>

            {/* Key Insights Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MdTrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Most Popular Programs</h4>
                    <p className="text-sm text-gray-500">Hospitality courses (Bartending, F&B, Barista) are the most enrolled</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MdSchool className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Qualification Distribution</h4>
                    <p className="text-sm text-gray-500">
                      NC II: {((nc2Total / (nc2Total + nc3Total || 1)) * 100).toFixed(1)}%,{' '}
                      NC III: {((nc3Total / (nc2Total + nc3Total || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MdPeople className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Data Source</h4>
                    <p className="text-sm text-gray-500">
                      Historical enrollment data from 2020 Q1 to 2025 Q3
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default EnrollmentTrends;
