import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import { API_URL } from '../../config/api';
import {
  MdMenu,
  MdCalendarToday,
  MdTrendingUp,
  MdRefresh,
  MdDownload,
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
import toast, { Toaster } from 'react-hot-toast';

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
    // AI Interpretation State
    const [aiInterpretation, setAIInterpretation] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);

    // Generate AI Interpretation
    const generateAIInterpretation = async () => {
      setLoadingAI(true);
      try {
        // Prepare prompt with forecast summary
        const prompt = `You are an educational data analyst. Analyze the following ARIMA forecast results and provide a clear, actionable interpretation in markdown format.\n\nForecast Summary:\n- Program: ${selectedProgram}\n- Periods Forecasted: ${forecastPeriods}\n- Trend: ${forecastData.stats?.trend}\n- Average Growth Rate: ${forecastData.stats?.avgGrowthRate}%\n- Next Period Prediction: ${forecastData.forecast?.[0]?.enrollment || 0}\n- Range: ${forecastData.forecast?.[0]?.lower_bound || 0} - ${forecastData.forecast?.[0]?.upper_bound || 0}\n- Confidence: ${forecastData.forecast?.[0]?.confidence || 0}%\n\nPlease provide:\n1. **Trend Analysis**: What is the overall direction?\n2. **Forecast Reliability**: How confident is the prediction?\n3. **Actionable Recommendations**: 2-3 steps for program managers.\nFormat your response with markdown headings (##) and bullet points.`;

        const token = sessionStorage.getItem('adminToken');
        
        // Call backend API to generate interpretation (API key is stored securely in backend .env)
        const response = await fetch('https://api.smitracked.cloud/api/admin/ai-interpretation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle rate limiting specifically
          if (response.status === 429) {
            const retryAfter = errorData.retryAfter || 30;
            throw new Error(`AI service is busy. Please wait ${retryAfter} seconds and try again.`);
          }
          
          throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const interpretation = data.interpretation || 'Unable to generate interpretation';
        setAIInterpretation(interpretation);
        toast.success('AI interpretation generated successfully');
      } catch (error) {
        console.error('Error generating AI interpretation:', error);
        toast.error(error.message || 'Failed to generate AI interpretation');
        setAIInterpretation('Failed to generate interpretation. Please try again later.');
      } finally {
        setLoadingAI(false);
      }
    };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forecastType, setForecastType] = useState('quarterly'); // monthly, quarterly, semi-annual, annual, custom
  const [forecastPeriods, setForecastPeriods] = useState(3); // Default: 3 quarters ahead
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [loading, setLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Forecast type configurations
  const forecastTypeConfig = {
    monthly: {
      label: 'Monthly (3 months per period)',
      periodLabel: 'months',
      idealPeriods: 3,
      maxPeriods: 6,
      description: '3 months ahead ideal forecast'
    },
    quarterly: {
      label: 'Quarterly (3 months per period)',
      periodLabel: 'quarters',
      idealPeriods: 3,
      maxPeriods: 4,
      description: '3 quarters ahead ideal forecast'
    },
    'semi-annual': {
      label: 'Semi-Annual (6 months per period)',
      periodLabel: 'periods',
      idealPeriods: 4,
      maxPeriods: 4,
      description: '2 years (4 periods) ideal forecast'
    },
    annual: {
      label: 'Annual (12 months per period)',
      periodLabel: 'years',
      idealPeriods: 2,
      maxPeriods: 2,
      description: '1-2 years max ideal forecast'
    },
    custom: {
      label: 'Custom Range',
      periodLabel: 'months',
      idealPeriods: 3,
      maxPeriods: 12,
      description: 'Generate forecast for a specific date range based on historical data before that range'
    }
  };

  // Update forecast periods when type changes
  const handleForecastTypeChange = (type) => {
    setForecastType(type);
    if (type !== 'custom') {
      setForecastPeriods(forecastTypeConfig[type].idealPeriods);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // Get period options based on forecast type
  const getPeriodOptions = () => {
    const config = forecastTypeConfig[forecastType];
    const options = [];
    for (let i = 1; i <= config.maxPeriods; i++) {
      options.push({
        value: i,
        label: `${i} ${config.periodLabel}${i > 1 ? '' : ''}`
      });
    }
    return options;
  };
  
  const [forecastData, setForecastData] = useState({
    historical: [],
    forecast: [],
    stats: {
      totalHistorical: 0,
      avgGrowthRate: 0,
      predictedNext: 0,
      trend: 'stable'
    }
  });

  const programs = [
    { id: 'all', name: 'All Programs' },
    { id: 'Bartending NC II', name: 'Bartending NC II' },
    { id: 'Barista Training NC II', name: 'Barista Training NC II' },
    { id: 'Housekeeping NC II', name: 'Housekeeping NC II' },
    { id: 'Food and Beverage Services NC II', name: 'Food and Beverage Services NC II' },
    { id: 'Bread and Pastry Production NC II', name: 'Bread and Pastry Production NC II' },
    { id: 'Events Management NC III', name: 'Events Management NC III' },
    { id: "Ship's Catering Services NC II", name: "Ship's Catering Services NC II" },
    { id: 'Cookery NC II', name: 'Cookery NC II' }
  ];

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      
      const requestBody = {
        program: selectedProgram,
        periods: forecastPeriods,
        forecastType: forecastType
      };

      // Add custom date range if using custom type
      if (forecastType === 'custom' && customStartDate && customEndDate) {
        requestBody.startDate = customStartDate;
        requestBody.endDate = customEndDate;
      }

      const response = await fetch(`${API_URL}/admin/arima-forecast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        setForecastData(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Forecast error:', response.status, errorData);
        toast.error(errorData.message || 'Failed to generate forecast');
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
      toast.error('Error generating forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For custom type, don't auto-fetch - use the "Generate Forecast" button instead
    if (forecastType === 'custom') {
      return;
    }
    // For other types, always fetch automatically
    fetchForecast();
  }, [selectedProgram, forecastPeriods, forecastType]);

  // Manual fetch for custom range
  const handleCustomFetch = () => {
    if (forecastType === 'custom') {
      if (!customStartDate || !customEndDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (new Date(customStartDate) > new Date(customEndDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }
    fetchForecast();
  };

  const formatDate = (dateString) => {
    if (dateString === null || dateString === undefined) return 'N/A';
    
    // Convert to string for consistent handling
    const dateStr = String(dateString);
    
    // Handle year-only format like "2024" or "2025" (works for both number and string)
    if (/^\d{4}$/.test(dateStr)) {
      return dateStr; // Return year as-is
    }
    
    // Handle semi-annual format like "2024-H1" or "2024-H2"
    const halfMatch = dateStr.match(/(\d{4})-(H[12])/i);
    if (halfMatch) {
      return `${halfMatch[2]} ${halfMatch[1]}`; // "H1 2024"
    }
    
    // Handle quarter format like "Q1 2024" or "2024-Q1"
    const quarterMatch = dateStr.match(/Q(\d)\s*(\d{4})/i) || dateStr.match(/(\d{4})-Q(\d)/i);
    if (quarterMatch) {
      const quarter = quarterMatch[1] || quarterMatch[2];
      const year = quarterMatch[2] || quarterMatch[1];
      return `Q${quarter} ${year}`;
    }
    
    // Handle YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      return `${monthName} ${year}`;
    }
    
    // Handle different date formats
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM-DD
      const parts = dateStr.split(/[-\/]/);
      if (parts.length >= 2) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parts[2] ? parseInt(parts[2]) : 1;
        
        if (!isNaN(year) && !isNaN(month)) {
          const parsedDate = new Date(year, month, day);
          
          if (!isNaN(parsedDate.getTime())) {
            const monthName = parsedDate.toLocaleString('default', { month: 'short' });
            const yearValue = parsedDate.getFullYear();
            return `${monthName} ${yearValue}`;
          }
        }
      }
      
      return dateStr; // Return as-is if can't parse
    }
    
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Prepare chart data from API (with safety checks)
  const historicalLength = forecastData.historical?.length || 0;
  const forecastLength = forecastData.forecast?.length || 0;

  const chartData = {
    labels: [
      ...(forecastData.historical || []).map(d => formatDate(d.date)),
      ...(forecastData.forecast || []).map(d => formatDate(d.date))
    ],
    datasets: [
      {
        label: 'Historical Enrollments',
        data: [
          ...(forecastData.historical || []).map(d => d.enrollment || 0),
          ...Array(forecastLength).fill(null)
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'Forecasted Enrollments',
        data: [
          ...Array(Math.max(0, historicalLength - 1)).fill(null),
          forecastData.historical?.[historicalLength - 1]?.enrollment || null,
          ...(forecastData.forecast || []).map(d => d.enrollment || 0)
        ],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'Upper Confidence Bound (85%)',
        data: [
          ...Array(historicalLength).fill(null),
          ...(forecastData.forecast || []).map(d => d.upper_bound || 0)
        ],
        borderColor: 'rgba(54, 162, 235, 0.3)',
        backgroundColor: 'rgba(54, 162, 235, 0.05)',
        tension: 0.4,
        fill: '+1',
        pointRadius: 0,
        borderWidth: 1
      },
      {
        label: 'Lower Confidence Bound (85%)',
        data: [
          ...Array(historicalLength).fill(null),
          ...(forecastData.forecast || []).map(d => d.lower_bound || 0)
        ],
        borderColor: 'rgba(54, 162, 235, 0.3)',
        backgroundColor: 'rgba(54, 162, 235, 0.05)',
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `ARIMA Enrollment Forecast - ${selectedProgram === 'all' ? 'All Programs' : selectedProgram}`
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Enrollments'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Period'
        },
        ticks: {
          callback: function(value, index, ticks) {
            const label = this.getLabelForValue(value);
            // Hide labels that show invalid dates or unwanted text before Mar 2020
            if (label.includes('Invalid') || label === 'date' || label === 'N/A') {
              return '';
            }
            return label;
          }
        }
      }
    }
  };

  const handleRefresh = () => {
    fetchForecast();
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Type,Date,Enrollments,Upper Bound,Lower Bound,Confidence\n" +
      forecastData.historical.map(d => `Historical,${d.date},${d.enrollment},,,`).join("\n") + "\n" +
      forecastData.forecast.map(d => `Forecast,${d.date},${d.enrollment},${d.upper_bound},${d.lower_bound},${d.confidence}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `arima_forecast_${selectedProgram.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Forecast exported successfully');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <MdMenu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">ARIMA Forecasting</h1>
                  <p className="text-sm text-gray-500">Enrollment projections based on historical data</p>
                </div>
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
            
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Forecast Type */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Forecast Type:</label>
                <select
                  value={forecastType}
                  onChange={(e) => handleForecastTypeChange(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Monthly (3 months per period)</option>
                  <option value="quarterly">Quarterly (3 months per period)</option>
                  <option value="semi-annual">Semi-Annual (6 months per period)</option>
                  <option value="annual">Annual (12 months per period)</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Forecast Periods (not shown for custom) */}
              {forecastType !== 'custom' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Periods Ahead:</label>
                  <select
                    value={forecastPeriods}
                    onChange={(e) => setForecastPeriods(parseInt(e.target.value))}
                    className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getPeriodOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} {opt.value === forecastTypeConfig[forecastType].idealPeriods ? '(ideal)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Date Range */}
              {forecastType === 'custom' && (
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <label className="text-sm font-medium text-gray-700">From:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleCustomFetch}
                    disabled={loading || !customStartDate || !customEndDate}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Generate Forecast'}
                  </button>
                </div>
              )}

              {/* Program Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Program:</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Forecast Type Description */}
            <p className="text-xs text-gray-500 mt-2">
              {forecastTypeConfig[forecastType].description}
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Forecast Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Average</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {forecastData.historical?.length > 0
                      ? Math.round(
                          forecastData.historical.reduce((sum, d) => sum + (d.enrollment || 0), 0) /
                          forecastData.historical.length
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Historical avg per {forecastType === 'custom' ? 'period' : forecastType.replace('-', ' ')}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdCalendarToday className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next {forecastType === 'custom' ? 'Period' : forecastType.charAt(0).toUpperCase() + forecastType.slice(1).replace('-', ' ')} Forecast</p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {forecastData.forecast?.[0]?.enrollment || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {forecastData.historical?.length > 0 && forecastData.forecast?.[0]?.enrollment
                      ? (() => {
                          const avg = forecastData.historical.reduce((sum, d) => sum + (d.enrollment || 0), 0) / forecastData.historical.length;
                          const diff = forecastData.forecast[0].enrollment - avg;
                          const percentChange = (diff / avg) * 100;
                          return `${diff >= 0 ? '+' : ''}${Math.round(diff)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)`;
                        })()
                      : 'vs historical avg'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <MdSchedule className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Forecast Table and Insights - side by side */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(forecastData.forecast || []).map((data, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(data.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                              {data.enrollment || 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {data.lower_bound || 0} - {data.upper_bound || 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {data.confidence || 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                  <div className="space-y-3">
                    {/* ...existing Key Insights code... */}
                    {/* Selected Program Info */}
                    <div className="flex items-start space-x-3">
                      <MdCalendarToday className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Selected Program</p>
                        <p className="text-sm text-gray-600">
                          {selectedProgram === 'all' ? 'All Programs Combined' : selectedProgram}
                        </p>
                      </div>
                    </div>
                    {/* ...rest of Key Insights code unchanged... */}
                    {/* Forecast Period Info */}
                    <div className="flex items-start space-x-3">
                      <MdSchedule className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Forecast Period</p>
                        <p className="text-sm text-gray-600">
                          Projecting {forecastPeriods} periods ahead
                          {forecastData.forecast?.length > 0 && ` (${formatDate(forecastData.forecast[0]?.date)} - ${formatDate(forecastData.forecast[forecastData.forecast.length - 1]?.date)})`}
                        </p>
                      </div>
                    </div>
                    {/* Trend Analysis with actual growth rate */}
                    <div className="flex items-start space-x-3">
                      <MdTrendingUp className={`h-5 w-5 mt-0.5 ${
                        forecastData.stats?.trend === 'increasing' ? 'text-green-600' :
                        forecastData.stats?.trend === 'decreasing' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Trend Analysis</p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const avgGrowth = forecastData.stats?.avgGrowthRate || 0;
                            const trend = forecastData.stats?.trend || 'stable';
                            if (trend === 'increasing') {
                              return `Enrollment is projected to increase by ${Math.abs(avgGrowth).toFixed(1)}% on average`;
                            } else if (trend === 'decreasing') {
                              return `Enrollment is projected to decrease by ${Math.abs(avgGrowth).toFixed(1)}% on average`;
                            } else {
                              return `Enrollment is expected to remain stable (${Math.abs(avgGrowth).toFixed(1)}% change)`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    {/* Growth rate alert - Show for significant changes (positive or negative) */}
                    {Math.abs(forecastData.stats?.avgGrowthRate || 0) > 10 && (
                      <div className="flex items-start space-x-3">
                        <MdWarning className={`h-5 w-5 mt-0.5 ${
                          (forecastData.stats?.avgGrowthRate || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {(forecastData.stats?.avgGrowthRate || 0) > 0 ? 'High Growth Alert' : 'Declining Enrollment Alert'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(forecastData.stats?.avgGrowthRate || 0) > 0 
                              ? 'Consider expanding capacity and resources to meet increasing demand'
                              : 'Review program offerings and marketing strategies to address declining trend'}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Forecast range insight */}
                    {forecastData.forecast?.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <MdSchedule className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Forecast Range</p>
                          <p className="text-sm text-gray-600">
                            {(() => {
                              const enrollments = forecastData.forecast.map(f => f.enrollment || 0);
                              const min = Math.min(...enrollments);
                              const max = Math.max(...enrollments);
                              return `Predicted enrollments range from ${min} to ${max} students per period`;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Confidence level insight */}
                    {forecastData.forecast?.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <MdTrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Forecast Confidence</p>
                          <p className="text-sm text-gray-600">
                            {(() => {
                              const avgConfidence = forecastData.forecast.reduce((sum, f) => sum + (f.confidence || 0), 0) / forecastData.forecast.length;
                              return avgConfidence >= 80 
                                ? `High confidence (${avgConfidence.toFixed(1)}%) - predictions are reliable`
                                : avgConfidence >= 60
                                ? `Moderate confidence (${avgConfidence.toFixed(1)}%) - use with caution`
                                : `Lower confidence (${avgConfidence.toFixed(1)}%) - consider multiple scenarios`;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Data source */}
                    <div className="flex items-start space-x-3">
                      <MdCalendarToday className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data Source</p>
                        <p className="text-sm text-gray-600">
                          Based on {forecastData.historical?.length || 0} periods of historical enrollment data
                          {forecastData.historical?.length > 0 && forecastData.historical.length < 8 && 
                            ' (limited data may affect accuracy)'}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingAI || loading}
                  >
                    {loadingAI ? 'Analyzing...' : aiInterpretation ? 'Refresh Analysis' : 'Generate Analysis'}
                  </button>
                </div>
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-700 font-medium">Analyzing forecast with AI...</p>
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
                      Click "Generate Analysis" to get AI-powered insights about the forecast, trends, and recommendations.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default ArimaForecasting;
