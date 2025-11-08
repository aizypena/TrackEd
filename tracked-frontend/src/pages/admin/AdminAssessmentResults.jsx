import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdPrint,
  MdRefresh,
  MdAssessment,
  MdSchool,
  MdCheckCircle,
  MdPeople,
  MdInsights,
  MdTrendingUp,
  MdSort,
} from 'react-icons/md';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';

const AdminAssessmentResults = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [dateRange, setDateRange] = useState('all-time');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  // State for actual data
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAssessments: 0,
    passRate: 0,
    averageScore: 0,
    pendingAssessments: 0,
  });
  const [scoreDistribution, setScoreDistribution] = useState({});
  const [programPerformance, setProgramPerformance] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // Fetch assessment results from backend
  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/assessment-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssessmentResults(data.data || []);
          setStatistics(data.statistics || {});
          setScoreDistribution(data.scoreDistribution || {});
          setProgramPerformance(data.programPerformance || []);
          setPrograms(data.programs || []);
          setBatches(data.batches || []);
        } else {
          toast.error('Failed to load assessment results');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to load data (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      toast.error('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentResults();
  }, []);

  // Prepare chart data for score distribution
  const scoreDistributionData = {
    labels: ['90-100', '80-89', '70-79', '60-69', 'Below 60'],
    datasets: [{
      data: [
        scoreDistribution['90-100'] || 0,
        scoreDistribution['80-89'] || 0,
        scoreDistribution['70-79'] || 0,
        scoreDistribution['60-69'] || 0,
        scoreDistribution['Below 60'] || 0,
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(16, 185, 129, 0.8)', // Green
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(99, 102, 241, 0.8)', // Indigo
        'rgba(190, 18, 60, 0.8)',  // Red
      ],
    }]
  };

  // Prepare chart data for program performance
  const programPerformanceData = {
    labels: programPerformance.map(p => p.program),
    datasets: [{
      label: 'Average Score',
      data: programPerformance.map(p => p.average_score),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const handleExport = (format) => {
    console.log('Exporting in format:', format);
  };

  const handlePrint = () => {
    console.log('Printing assessment results');
  };

  const handleRefresh = () => {
    fetchAssessmentResults();
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
                <h1 className="text-2xl font-semibold text-gray-900">Assessment Results</h1>
                <p className="text-sm text-gray-500">View and analyze student performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdPrint className="h-5 w-5 mr-2" />
                Print Report
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <MdAssessment className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : statistics.totalAssessments}
                      </p>
                      <p className="text-sm font-medium text-blue-600">Total Assessments</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <MdCheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : `${statistics.passRate.toFixed(1)}%`}
                      </p>
                      <p className="text-sm font-medium text-green-600">Pass Rate</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <MdTrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : `${statistics.averageScore.toFixed(1)}%`}
                      </p>
                      <p className="text-sm font-medium text-amber-600">Average Score</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <MdPeople className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : statistics.pendingAssessments}
                      </p>
                      <p className="text-sm font-medium text-indigo-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all">All Programs</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all">All Batches</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all-time">All Time</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-3-months">Last 3 Months</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="score">Sort by Score</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students..."
                      className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                <div className="h-[300px] flex items-center justify-center">
                  {loading ? (
                    <div className="text-gray-500">Loading chart...</div>
                  ) : (
                    <div className="w-[300px]">
                      <Doughnut
                        data={scoreDistributionData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
                  ) : (
                    <Bar
                      data={programPerformanceData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                              color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              maxRotation: 45,
                              minRotation: 45
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Results Table */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Assessment Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Assessment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">JD</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">Juan Dela Cruz</div>
                            <div className="text-sm text-gray-500">ID: STU-2025-001</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Bartending NC II</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Final Assessment</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">92%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Passed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Sep 25, 2025</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing 1 to 10 of 50 entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <MdFileDownload className="h-4 w-4 mr-1.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <MdPrint className="h-4 w-4 mr-1.5" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminAssessmentResults;
