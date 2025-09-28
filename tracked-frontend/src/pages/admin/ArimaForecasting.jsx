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
  MdSettings,
  MdAttachMoney,
  MdGroup,
  MdSchedule,
  MdWarning,
} from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ArimaForecasting = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [loading, setLoading] = useState(false);
  const [arimaParams, setArimaParams] = useState({
    p: 1, // AR parameter
    d: 1, // Difference order
    q: 1, // MA parameter
    confidence: 0.95, // Confidence interval
    seasonality: true // Include seasonality
  });
  const [quarterlyView, setQuarterlyView] = useState(true);

  // Mock data for forecasting
  const forecastData = {
    labels: ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'],
    datasets: [
      {
        label: 'Historical Enrollments',
        data: [120, 135, 125, 145, 160, 175],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Forecasted Enrollments',
        data: [175, 190, 205, 220, 235, 250],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false
      },
      {
        label: 'Upper Confidence Bound',
        data: [185, 205, 225, 240, 255, 270],
        borderColor: 'rgba(54, 162, 235, 0.2)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: '+1'
      },
      {
        label: 'Lower Confidence Bound',
        data: [165, 175, 185, 200, 215, 230],
        borderColor: 'rgba(54, 162, 235, 0.2)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };

  const programs = [
    { id: 'all', name: 'All Programs' },
    { id: 'bartending-nc-ii', name: 'Bartending NC II' },
    { id: 'barista-training-nc-ii', name: 'Barista Training NC II' },
    { id: 'housekeeping-nc-ii', name: 'Housekeeping NC II' },
    { id: 'food-beverage-nc-ii', name: 'Food and Beverage Services NC II' },
    { id: 'bread-pastry-nc-ii', name: 'Bread and Pastry Production NC II' },
    { id: 'events-management-nc-iii', name: 'Events Management NC III' },
    { id: 'chefs-catering-nc-ii', name: "Chef's Catering Services NC II" },
    { id: 'cookery-nc-ii', name: 'Cookery NC II' }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'ARIMA Enrollment Forecast'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Number of Enrollments'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // Implement refresh logic here
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting forecast data...');
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
                <h1 className="text-2xl font-semibold text-gray-900">ARIMA Forecasting</h1>
                <p className="text-sm text-gray-500">Enrollment projections and resource planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="4">4 Quarters</option>
                  <option value="8">8 Quarters</option>
                  <option value="12">12 Quarters</option>
                </select>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setQuarterlyView(!quarterlyView)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    quarterlyView ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Quarterly View
                </button>
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
                >
                  <MdDownload className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Forecast Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projected Peak Enrollment</p>
                  <p className="text-2xl font-semibold text-blue-600">250</p>
                  <p className="text-xs text-gray-500 mt-1">March 2026</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Required Instructors</p>
                  <p className="text-2xl font-semibold text-green-600">12</p>
                  <p className="text-xs text-gray-500 mt-1">Based on 1:25 ratio</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <MdGroup className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Est. TESDA Fund Required</p>
                  <p className="text-2xl font-semibold text-yellow-600">₱750K</p>
                  <p className="text-xs text-gray-500 mt-1">Next 6 months</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <MdAttachMoney className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommended Classes</p>
                  <p className="text-2xl font-semibold text-purple-600">10</p>
                  <p className="text-xs text-gray-500 mt-1">Per program</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <MdSchedule className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ARIMA Configuration Panel */}
          {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ARIMA Model Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">AR Parameter (p)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={arimaParams.p}
                  onChange={(e) => setArimaParams({...arimaParams, p: parseInt(e.target.value)})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Difference Order (d)</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={arimaParams.d}
                  onChange={(e) => setArimaParams({...arimaParams, d: parseInt(e.target.value)})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">MA Parameter (q)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={arimaParams.q}
                  onChange={(e) => setArimaParams({...arimaParams, q: parseInt(e.target.value)})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confidence Interval</label>
                <select
                  value={arimaParams.confidence}
                  onChange={(e) => setArimaParams({...arimaParams, confidence: parseFloat(e.target.value)})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0.90">90%</option>
                  <option value="0.95">95%</option>
                  <option value="0.99">99%</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Seasonality</label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={arimaParams.seasonality}
                    onChange={(e) => setArimaParams({...arimaParams, seasonality: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Include seasonal components
                  </label>
                </div>
              </div>
            </div>
          </div> */}

          {/* Main Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div style={{ height: '400px' }}>
              <Line data={forecastData} options={chartOptions} />
            </div>
          </div>

          {/* Planning Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Planning Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MdPeople className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Staffing Requirements</h4>
                    <p className="text-sm text-gray-500">Plan to hire 2 additional instructors by January 2026 to maintain optimal class sizes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MdSchool className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Class Scheduling</h4>
                    <p className="text-sm text-gray-500">Increase morning sessions for Bartending and F&B courses due to projected demand</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MdSettings className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Equipment Planning</h4>
                    <p className="text-sm text-gray-500">Order additional training equipment by December to accommodate growth</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TESDA Fund Allocation</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <MdAttachMoney className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Voucher Distribution</h4>
                    <p className="text-sm text-gray-500">Allocate 40% of vouchers to high-demand programs (Bartending, F&B Services)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <MdWarning className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Budget Alerts</h4>
                    <p className="text-sm text-gray-500">Request additional funding by January to support projected enrollment increase</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <MdCalendarToday className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Planning Timeline</h4>
                    <p className="text-sm text-gray-500">Submit fund utilization report by December for Q1 2026 allocation</p>
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

export default ArimaForecasting;
