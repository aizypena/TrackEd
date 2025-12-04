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
  MdPayment,
  MdAutoAwesome,
  MdClose,
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
  const [viewType, setViewType] = useState('quarterly'); // weekly, monthly, quarterly, yearly
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [showAIInterpretation, setShowAIInterpretation] = useState(false);
  const [aiInterpretation, setAIInterpretation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [trendsData, setTrendsData] = useState({
    quarterlyData: {},
    programTotals: {},
    allData: [],
    voucherStats: {
      total: 0,
      withVoucher: 0,
      withoutVoucher: 0,
      voucherPercentage: 0,
      paidPercentage: 0
    },
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
      const token = sessionStorage.getItem('adminToken');
      
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

  // Calculate data by view type for a specific program from allData
  const getDataByViewType = (programName) => {
    if (!trendsData.allData || trendsData.allData.length === 0) {
      return {};
    }

    const aggregatedData = {};
    
    // Filter data by program if not 'all'
    const filteredData = programName === 'all' 
      ? trendsData.allData 
      : trendsData.allData.filter(record => record.program === programName);

    // Aggregate by view type
    filteredData.forEach(record => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let key;

      switch (viewType) {
        case 'weekly':
          // Get week number of year
          const firstDayOfYear = new Date(year, 0, 1);
          const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `Week ${weekNum} ${year}`;
          break;
        case 'monthly':
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          key = `${monthNames[month - 1]} ${year}`;
          break;
        case 'yearly':
          key = `${year}`;
          break;
        case 'quarterly':
        default:
          const quarter = Math.ceil(month / 3);
          key = `Q${quarter} ${year}`;
          break;
      }
      
      if (!aggregatedData[key]) {
        aggregatedData[key] = 0;
      }
      aggregatedData[key] += record.enrollment || 0;
    });

    return aggregatedData;
  };

  // Filter data by time range
  const getFilteredData = () => {
    // Always use getDataByViewType to respect the current viewType
    // This ensures data is aggregated according to weekly/monthly/quarterly/yearly
    const dataForProgram = getDataByViewType(selectedProgram);

    // Sort function based on view type
    const sortKeys = (a, b) => {
      if (viewType === 'weekly') {
        const matchA = a.match(/Week (\d+) (\d+)/);
        const matchB = b.match(/Week (\d+) (\d+)/);
        if (!matchA || !matchB) return 0;
        const yearA = parseInt(matchA[2]);
        const yearB = parseInt(matchB[2]);
        const weekA = parseInt(matchA[1]);
        const weekB = parseInt(matchB[1]);
        if (yearA !== yearB) return yearA - yearB;
        return weekA - weekB;
      } else if (viewType === 'monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const matchA = a.match(/(\w+) (\d+)/);
        const matchB = b.match(/(\w+) (\d+)/);
        if (!matchA || !matchB) return 0;
        const yearA = parseInt(matchA[2]);
        const yearB = parseInt(matchB[2]);
        const monthA = monthNames.indexOf(matchA[1]);
        const monthB = monthNames.indexOf(matchB[1]);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      } else if (viewType === 'yearly') {
        return parseInt(a) - parseInt(b);
      } else { // quarterly
        const matchA = a.match(/Q(\d) (\d+)/);
        const matchB = b.match(/Q(\d) (\d+)/);
        if (!matchA || !matchB) return 0;
        const yearA = parseInt(matchA[2]);
        const yearB = parseInt(matchB[2]);
        const quarterA = parseInt(matchA[1]);
        const quarterB = parseInt(matchB[1]);
        if (yearA !== yearB) return yearA - yearB;
        return quarterA - quarterB;
      }
    };

    const periods = Object.keys(dataForProgram || {}).sort(sortKeys);
    
    // Apply time range filter based on actual year ranges
    if (timeRange === '1year' || timeRange === '3years' || timeRange === '5years') {
      const yearsToShow = timeRange === '1year' ? 1 : timeRange === '3years' ? 3 : 5;
      
      // Get the most recent year from the data
      let mostRecentYear = 0;
      periods.forEach(period => {
        let year = 0;
        if (viewType === 'weekly') {
          const match = period.match(/Week \d+ (\d+)/);
          if (match) year = parseInt(match[1]);
        } else if (viewType === 'monthly') {
          const match = period.match(/\w+ (\d+)/);
          if (match) year = parseInt(match[1]);
        } else if (viewType === 'yearly') {
          year = parseInt(period);
        } else { // quarterly
          const match = period.match(/Q\d (\d+)/);
          if (match) year = parseInt(match[1]);
        }
        if (year > mostRecentYear) mostRecentYear = year;
      });
      
      // Filter periods to only include those within the year range
      const cutoffYear = mostRecentYear - yearsToShow + 1;
      return periods.filter(period => {
        let year = 0;
        if (viewType === 'weekly') {
          const match = period.match(/Week \d+ (\d+)/);
          if (match) year = parseInt(match[1]);
        } else if (viewType === 'monthly') {
          const match = period.match(/\w+ (\d+)/);
          if (match) year = parseInt(match[1]);
        } else if (viewType === 'yearly') {
          year = parseInt(period);
        } else { // quarterly
          const match = period.match(/Q\d (\d+)/);
          if (match) year = parseInt(match[1]);
        }
        return year >= cutoffYear;
      });
    }
    
    // "All Time" - return all periods
    return periods;
  };

  // Calculate growth rate
  const calculateGrowthRate = () => {
    const periods = getFilteredData();
    if (periods.length < 2) return 0;
    
    // Always use getDataByViewType to ensure consistency
    const dataForProgram = getDataByViewType(selectedProgram);
    
    const recent = dataForProgram[periods[periods.length - 1]] || 0;
    const previous = dataForProgram[periods[periods.length - 2]] || 0;
    
    if (previous === 0) return 0;
    return (((recent - previous) / previous) * 100).toFixed(1);
  };

  const filteredPeriods = getFilteredData();

  // Get filtered program data based on selected program and time range
  const getFilteredProgramTotals = () => {
    // If a specific program is selected, calculate its total from filtered periods
    if (selectedProgram !== 'all') {
      const dataForProgram = getDataByViewType(selectedProgram);
      const total = filteredPeriods.reduce((sum, period) => sum + (dataForProgram[period] || 0), 0);
      
      const filtered = {};
      if (total > 0) {
        filtered[selectedProgram] = total;
      }
      return filtered;
    }
    
    // For 'all programs', calculate totals for each program from filtered periods
    const programTotals = {};
    
    // Get all unique programs from the data
    const allPrograms = Object.keys(trendsData.programTotals || {});
    
    // Calculate total for each program based on filtered periods
    allPrograms.forEach(program => {
      const dataForProgram = getDataByViewType(program);
      const total = filteredPeriods.reduce((sum, period) => sum + (dataForProgram[period] || 0), 0);
      
      if (total > 0) {
        programTotals[program] = total;
      }
    });
    
    // Sort by total enrollments (descending)
    const sortedPrograms = Object.entries(programTotals)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [program, total]) => {
        acc[program] = total;
        return acc;
      }, {});
    
    return sortedPrograms;
  };

  const filteredProgramTotals = getFilteredProgramTotals();



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

  // Enrollment trends - always use getDataByViewType for consistency
  const dataForProgram = getDataByViewType(selectedProgram);

  const viewTypeLabel = viewType.charAt(0).toUpperCase() + viewType.slice(1);

  const enrollmentTrends = {
    labels: filteredPeriods,
    datasets: [
      {
        label: selectedProgram === 'all' ? `${viewTypeLabel} Enrollments (All Programs)` : `${viewTypeLabel} Enrollments (${selectedProgram})`,
        data: filteredPeriods.map(p => dataForProgram[p] || 0),
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

  // Voucher payment distribution
  const voucherDistribution = {
    labels: ['With Voucher', 'Walk-In'],
    datasets: [
      {
        data: [
          trendsData.voucherStats?.withVoucher || 0,
          trendsData.voucherStats?.withoutVoucher || 0
        ],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',  // Purple for voucher
          'rgba(34, 197, 94, 0.8)'     // Green for paid
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
    if (filteredPeriods.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Always use getDataByViewType for consistency
    const dataForProgram = getDataByViewType(selectedProgram);
    
    const periodLabel = viewType.charAt(0).toUpperCase() + viewType.slice(1) + ' Period';
    const programLabel = selectedProgram === 'all' ? 'all_programs' : selectedProgram.replace(/\s+/g, '_');
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      `${periodLabel},Enrollments\n` +
      filteredPeriods.map(p => `${p},${dataForProgram[p] || 0}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enrollment_trends_${viewType}_${programLabel}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully');
  };

  const generateAIInterpretation = async () => {
    if (filteredPeriods.length === 0) {
      toast.error('No data available for interpretation');
      return;
    }

    setLoadingAI(true);
    setShowAIInterpretation(true);
    
    try {
      const dataForProgram = getDataByViewType(selectedProgram);
      const growthRate = calculateGrowthRate();
      
      // Prepare data summary for AI
      const dataSummary = {
        viewType: viewType,
        timeRange: timeRange,
        selectedProgram: selectedProgram,
        totalPrograms: trendsData.stats?.totalPrograms || 0,
        totalEnrollments: trendsData.stats?.totalEnrollments || 0,
        avgPerProgram: trendsData.stats?.avgPerProgram || 0,
        growthRate: growthRate,
        periods: filteredPeriods,
        enrollmentData: filteredPeriods.map(p => ({
          period: p,
          enrollments: dataForProgram[p] || 0
        })),
        topPrograms: Object.entries(filteredProgramTotals)
          .slice(0, 5)
          .map(([name, total]) => ({ name, total })),
        voucherStats: {
          withVoucher: trendsData.voucherStats?.withVoucher || 0,
          withoutVoucher: trendsData.voucherStats?.withoutVoucher || 0,
          voucherPercentage: trendsData.voucherStats?.voucherPercentage || 0,
          paidPercentage: trendsData.voucherStats?.paidPercentage || 0
        }
      };

      const prompt = `You are an educational data analyst. Analyze the following enrollment trends data and provide a comprehensive interpretation in a professional, actionable format.

Data Summary:
- View Type: ${dataSummary.viewType}
- Time Range: ${dataSummary.timeRange}
- Selected Program: ${dataSummary.selectedProgram}
- Total Programs: ${dataSummary.totalPrograms}
- Total Enrollments: ${dataSummary.totalEnrollments.toLocaleString()}
- Average per Program: ${dataSummary.avgPerProgram}
- Growth Rate: ${dataSummary.growthRate}%

Enrollment Trends (${dataSummary.viewType}):
${dataSummary.enrollmentData.map(d => `${d.period}: ${d.enrollments} enrollments`).join('\n')}

Top Programs:
${dataSummary.topPrograms.map((p, i) => `${i + 1}. ${p.name}: ${p.total.toLocaleString()} enrollments`).join('\n')}

Payment Distribution:
- With Voucher: ${dataSummary.voucherStats.withVoucher.toLocaleString()} (${dataSummary.voucherStats.voucherPercentage}%)
- Walk-In: ${dataSummary.voucherStats.withoutVoucher.toLocaleString()} (${dataSummary.voucherStats.paidPercentage}%)

Please provide:
1. **Overall Trend Analysis**: What's the general direction of enrollments?
2. **Key Patterns**: Identify any seasonal patterns, peaks, or dips
3. **Growth Assessment**: Evaluate the ${dataSummary.growthRate}% growth rate
4. **Program Performance**: Insights about program popularity
5. **Payment Insights**: Analysis of voucher vs walk-in distribution
6. **Recommendations**: 3-5 actionable recommendations for improving enrollments

Format your response with clear sections using markdown headings (##) and bullet points for readability.`;

      const API_KEY = 'AIzaSyB7A9T0XK_OA--i2Hh8KkLntuzfj0O-NR4';
      
      // Using the correct endpoint for Generative Language API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const interpretation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate interpretation';
      
      setAIInterpretation(interpretation);
      toast.success('AI interpretation generated successfully');
    } catch (error) {
      console.error('Error generating AI interpretation:', error);
      toast.error('Failed to generate AI interpretation: ' + error.message);
      setAIInterpretation('Failed to generate interpretation. Please try again.');
    } finally {
      setLoadingAI(false);
    }
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
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-700"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
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
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="5years">Last 5 Years</option>
                  <option value="3years">Last 3 Years</option>
                  <option value="1year">Last 1 Year</option>
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

          {/* Voucher Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">With Voucher</p>
                  <p className="text-2xl font-semibold text-purple-700">
                    {loading ? '...' : trendsData.voucherStats?.withVoucher?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {loading ? '...' : `${trendsData.voucherStats?.voucherPercentage || 0}% of total`}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <MdPayment className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Walk-In</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {loading ? '...' : trendsData.voucherStats?.withoutVoucher?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {loading ? '...' : `${trendsData.voucherStats?.paidPercentage || 0}% of total`}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <MdPayment className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Students</p>
                  <p className="text-2xl font-semibold text-blue-700">
                    {loading ? '...' : trendsData.voucherStats?.total?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Current enrollees
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <MdPeople className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Payment Method Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              ) : (trendsData.voucherStats?.total === 0) ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-gray-500">No payment data available</p>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <Doughnut 
                    data={voucherDistribution} 
                    options={{
                      ...doughnutOptions,
                      plugins: {
                        ...doughnutOptions.plugins,
                        title: {
                          ...doughnutOptions.plugins.title,
                          text: 'Payment Method Distribution'
                        }
                      }
                    }} 
                  />
                </div>
              )}
            </div>

            {/* Key Insights Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-4">
                {/* ...existing Key Insights code... */}
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
                {/* ...rest of Key Insights code unchanged... */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MdCalendarToday className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Data Coverage</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : filteredPeriods.length > 0 
                        ? `Showing ${filteredPeriods.length} ${viewType} periods from ${filteredPeriods[0]} to ${filteredPeriods[filteredPeriods.length - 1]}`
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
                    <h4 className="text-sm font-medium text-gray-900">Latest Period Performance</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : filteredPeriods.length > 0 
                        ? `${filteredPeriods[filteredPeriods.length - 1]} recorded ${(dataForProgram[filteredPeriods[filteredPeriods.length - 1]] || 0).toLocaleString()} enrollments across all programs`
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
                      {loading ? 'Loading...' : filteredPeriods.length >= 2
                        ? (() => {
                            const growthRate = parseFloat(calculateGrowthRate());
                            const periodLabel = viewType === 'weekly' ? 'week' : viewType === 'monthly' ? 'month' : viewType === 'yearly' ? 'year' : 'quarter';
                            if (growthRate > 0) {
                              return `Enrollments increased by ${growthRate}% from the previous ${periodLabel}`;
                            } else if (growthRate < 0) {
                              return `Enrollments decreased by ${Math.abs(growthRate)}% from the previous ${periodLabel}`;
                            } else {
                              return `No change from the previous ${periodLabel}`;
                            }
                          })()
                        : 'Insufficient data for trend analysis'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <MdPayment className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Payment Distribution</h4>
                    <p className="text-sm text-gray-500">
                      {loading ? 'Loading...' : trendsData.voucherStats?.total > 0
                        ? `${trendsData.voucherStats.voucherPercentage}% (${trendsData.voucherStats.withVoucher.toLocaleString()}) use vouchers, ${trendsData.voucherStats.paidPercentage}% (${trendsData.voucherStats.withoutVoucher.toLocaleString()}) are walk-in`
                        : 'No payment data available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Interpretation Panel - full width below */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Interpretation</h3>
              <button
                onClick={generateAIInterpretation}
                className="px-4 py-2 bg-blue-600 hover:cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingAI || loading}
              >
                {loadingAI ? 'Analyzing...' : aiInterpretation ? 'Refresh Analysis' : 'Generate Analysis'}
              </button>
            </div>
            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-700 font-medium">Analyzing enrollment trends with AI...</p>
              </div>
            ) : aiInterpretation ? (
              <div className="prose prose-sm max-w-none text-gray-800" style={{ maxHeight: '300px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ 
                  __html: aiInterpretation
                    // Headings
                    .replace(/##\s*(.*?)(\n|$)/g, '<h2 class="text-lg font-bold text-blue-700 mt-4 mb-2">$1</h2>')
                    .replace(/###\s*(.*?)(\n|$)/g, '<h3 class="text-base font-semibold text-blue-600 mt-3 mb-2">$1</h3>')
                    // Bold
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                    // Numbered lists
                    .replace(/\n(\d+\.\s)/g, '<br/><span class="font-bold">$1</span>')
                    // Bullet points
                    .replace(/^\* (.*?)$/gm, '<li class="ml-4 mb-1 text-sm">$1</li>')
                    // Sub-bullets
                    .replace(/^\s*\* (.*?)$/gm, '<li class="ml-8 mb-1 text-sm list-disc">$1</li>')
                    // Paragraph breaks
                    .replace(/\n{2,}/g, '<br/><br/>')
                    // Wrap lists in <ul>
                    .replace(/(<li.*?<\/li>\n?)+/g, '<ul class="list-disc pl-5 space-y-1 mb-3">$&</ul>')
                    // Remove stray hashes
                    .replace(/^#+\s*/gm, '')
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <h4 className="text-base font-medium text-gray-900 mb-2">No Analysis Yet</h4>
                <p className="text-sm text-gray-600 mb-2 max-w-md">
                  Click "Generate Analysis" to get AI-powered insights about enrollment trends, patterns, and actionable recommendations.
                </p>
              </div>
            )}
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default EnrollmentTrends;
