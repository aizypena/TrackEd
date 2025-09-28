import React, { useState } from 'react';
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
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(false);

  // Mock data for popular programs
  const popularPrograms = {
    labels: [
      'Bartending NC II',
      'Barista Training NC II',
      'Housekeeping NC II',
      'Food and Beverage Services NC II',
      'Bread and Pastry Production NC II',
      'Events Management NC III',
      "Chef's Catering Services NC II",
      'Cookery NC II'
    ],
    datasets: [
      {
        label: 'Number of Enrollments',
        data: [150, 130, 120, 110, 100, 95, 85, 80],
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

  // Mock data for enrollment trends over time
  const enrollmentTrends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Enrollments',
        data: [65, 75, 85, 95, 110, 120, 130, 140, 150, 160, 170, 180],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  // Mock data for qualification distribution
  const qualificationDistribution = {
    labels: ['NC II', 'NC III'],
    datasets: [
      {
        data: [85, 15], // 85% NC II programs, 15% NC III programs
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
    setLoading(true);
    // Implement refresh logic here
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting data...');
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
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
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
              >
                <MdDownload className="h-5 w-5" />
              </button>
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
                    <h4 className="text-sm font-medium text-gray-900">Qualification Levels</h4>
                    <p className="text-sm text-gray-500">85% of programs are NC II level, with 15% at NC III</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MdPeople className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Growth Trend</h4>
                    <p className="text-sm text-gray-500">15% increase in enrollments compared to last period</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnrollmentTrends;
