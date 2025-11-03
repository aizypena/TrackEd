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
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('quarterly');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  
  const [trendsData, setTrendsData] = useState({
    quarterlyData: {},
    programTotals: {},
    allData: [],
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
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/admin/enrollment-trends', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrendsData(data);
        } else {
          toast.error('Failed to load enrollment data');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to load data (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast.error('Error loading data: ' + error.message);
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
      
      if (!matchA || !matchB) return 0;
      
      const yearA = parseInt(matchA[2]);
      const yearB = parseInt(matchB[2]);
      const quarterA = parseInt(matchA[1]);
      const quarterB = parseInt(matchB[1]);
      
      if (yearA !== yearB) return yearA - yearB;
      return quarterA - quarterB;
    });
    
    // Filter by selected year first
    let filtered = quarters;
    if (selectedYear !== 'all') {
      filtered = quarters.filter(q => q.includes(selectedYear));
    }
    
    // Then apply time range filter
    if (timeRange === '1year') {
      return filtered.slice(-4); // Last 4 quarters = 1 year
    } else if (timeRange === '3years') {
      return filtered.slice(-12); // Last 12 quarters = 3 years
    } else if (timeRange === '5years') {
      return filtered.slice(-20); // Last 20 quarters = 5 years
    }
    return filtered; // All time or selected year
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

  const filteredQuarters = getFilteredQuarterlyData();

  // Get filtered program data based on selected program
  const getFilteredProgramTotals = () => {
    if (selectedProgram === 'all') {
      return trendsData.programTotals || {};
    }
    const filtered = {};
    if (trendsData.programTotals && trendsData.programTotals[selectedProgram]) {
      filtered[selectedProgram] = trendsData.programTotals[selectedProgram];
    }
    return filtered;
  };

  const filteredProgramTotals = getFilteredProgramTotals();

  // Calculate NC II vs NC III distribution
  const nc2Programs = Object.keys(filteredProgramTotals).filter(p => p.includes('NC II'));
  const nc3Programs = Object.keys(filteredProgramTotals).filter(p => p.includes('NC III'));
  
  const nc2Total = nc2Programs.reduce((sum, prog) => sum + (filteredProgramTotals[prog] || 0), 0);
  const nc3Total = nc3Programs.reduce((sum, prog) => sum + (filteredProgramTotals[prog] || 0), 0);

  // Prepare chart data from CSV
  const popularPrograms = {
    labels: Object.keys(filteredProgramTotals),
    datasets: [
      {
        label: 'Total Enrollments',
        data: Object.values(filteredProgramTotals),
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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(37, 99, 235)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3
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
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Most Popular Training Programs',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + ' enrollments';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Total Enrollments',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Enrollment Trends Over Time',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + ' enrollments';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Enrollments',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Quarter',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Qualification Level Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return label + ': ' + value.toLocaleString() + ' (' + percentage + '%)';
          }
        }
      }
    }
  };

  const handleRefresh = () => {
    fetchTrendsData();
  };

  const handleExport = () => {
    if (filteredQuarters.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Quarter,Enrollments\n" +
      filteredQuarters.map(q => `${q},${trendsData.quarterlyData[q] || 0}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enrollment_trends_${timeRange}.csv`);
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
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Programs</option>
                  {Object.keys(trendsData.programTotals || {}).map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time (2020-2025)</option>
                  <option value="5years">Last 5 Years</option>
                  <option value="3years">Last 3 Years</option>
                  <option value="1year">Last Year</option>
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
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : trendsData.stats?.totalPrograms || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdSchool className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : trendsData.stats?.totalEnrollments?.toLocaleString() || 0}
                  </p>
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
                  <p className={`text-2xl font-semibold ${parseFloat(calculateGrowthRate()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {loading ? '...' : `${calculateGrowthRate() > 0 ? '+' : ''}${calculateGrowthRate()}%`}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <MdTrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Per Program</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {loading ? '...' : trendsData.stats?.avgPerProgram?.toLocaleString() || 0}
                  </p>
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
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              ) : Object.keys(trendsData.programTotals || {}).length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-gray-500">No program data available</p>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <Bar data={popularPrograms} options={barOptions} />
                </div>
              )}
            </div>

            {/* Enrollment Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              ) : filteredQuarters.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-gray-500">No enrollment data available</p>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <Line data={enrollmentTrends} options={lineOptions} />
                </div>
              )}
            </div>

            {/* Qualification Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              ) : (nc2Total === 0 && nc3Total === 0) ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-gray-500">No qualification data available</p>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <Doughnut data={qualificationDistribution} options={doughnutOptions} />
                </div>
              )}
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
                    <h4 className="text-sm font-medium text-gray-900">Most Popular Program</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : Object.keys(trendsData.programTotals || {}).length > 0 
                        ? `${Object.keys(trendsData.programTotals)[0]} leads with ${Object.values(trendsData.programTotals)[0].toLocaleString()} total enrollments`
                        : 'No data available'}
                    </p>
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
                      {loading ? 'Loading...' : (nc2Total + nc3Total) > 0
                        ? `NC II programs: ${((nc2Total / (nc2Total + nc3Total)) * 100).toFixed(1)}% (${nc2Total.toLocaleString()} enrollments), NC III: ${((nc3Total / (nc2Total + nc3Total)) * 100).toFixed(1)}% (${nc3Total.toLocaleString()} enrollments)`
                        : 'No data available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MdCalendarToday className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Data Coverage</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : filteredQuarters.length > 0 
                        ? `Showing ${filteredQuarters.length} quarters from ${filteredQuarters[0]} to ${filteredQuarters[filteredQuarters.length - 1]}`
                        : 'No data available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <MdPeople className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Latest Quarter Performance</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : filteredQuarters.length > 0 
                        ? `${filteredQuarters[filteredQuarters.length - 1]} recorded ${(trendsData.quarterlyData[filteredQuarters[filteredQuarters.length - 1]] || 0).toLocaleString()} enrollments across all programs`
                        : 'No data available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <MdTrendingUp className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Growth Trend</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : filteredQuarters.length >= 2
                        ? (() => {
                            const growthRate = parseFloat(calculateGrowthRate());
                            if (growthRate > 0) {
                              return `Enrollments increased by ${growthRate}% from the previous quarter`;
                            } else if (growthRate < 0) {
                              return `Enrollments decreased by ${Math.abs(growthRate)}% from the previous quarter`;
                            } else {
                              return 'No change from the previous quarter';
                            }
                          })()
                        : 'Insufficient data for trend analysis'}
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
