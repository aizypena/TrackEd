import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdCalendarToday,
  MdPrint,
  MdDownload,
  MdPeople,
  MdInfo
} from 'react-icons/md';

const TrainerAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'summary'
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0
  });

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
  }, []);

  useEffect(() => {
    // Check if selected date is a weekend
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = date.getDay();
      setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sunday, 6 = Saturday
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && !isWeekend && viewMode === 'daily') {
      fetchStudents();
    }
  }, [selectedDate, selectedBatch, selectedProgram, isWeekend, viewMode]);

  useEffect(() => {
    if (viewMode === 'summary') {
      fetchAttendanceHistory();
    }
  }, [viewMode, selectedBatch, selectedProgram]);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('http://localhost:8000/api/trainer/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('http://localhost:8000/api/trainer/assigned-programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.programs) {
        setPrograms(data.programs);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const getFilteredBatches = () => {
    if (selectedProgram === 'all') {
      return batches;
    }
    return batches.filter(batch => batch.program_id === parseInt(selectedProgram));
  };

  const getFilteredPrograms = () => {
    if (selectedBatch === 'all') {
      return programs;
    }
    const batch = batches.find(b => b.batch_id === selectedBatch);
    if (batch) {
      return programs.filter(p => p.id === batch.program_id);
    }
    return programs;
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('trainerToken');
      
      const params = new URLSearchParams({
        date: selectedDate,
      });
      
      if (selectedBatch !== 'all') {
        params.append('batch_id', selectedBatch);
      }
      
      if (selectedProgram !== 'all') {
        params.append('program_id', selectedProgram);
      }

      const response = await fetch(`http://localhost:8000/api/trainer/attendance/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      } else {
        setError(data.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('trainerToken');
      
      const params = new URLSearchParams();
      
      if (selectedBatch !== 'all') {
        params.append('batch_id', selectedBatch);
      }
      
      if (selectedProgram !== 'all') {
        params.append('program_id', selectedProgram);
      }

      const response = await fetch(`http://localhost:8000/api/trainer/attendance/summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAttendanceHistory(data.data || []);
        setSummaryStats(data.statistics || {
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0
        });
      } else {
        setError(data.message || 'Failed to load attendance history');
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError('Failed to load attendance history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Filter students based on current filters
    const filteredStudents = students.filter(student => {
      const matchesProgram = selectedProgram === 'all' || student.program_id === parseInt(selectedProgram);
      const matchesBatch = selectedBatch === 'all' || student.batch_id === selectedBatch;
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (student.student_id && student.student_id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProgram && matchesBatch && matchesSearch;
    });

    // Create CSV content
    const headers = ['Student ID', 'Name', 'Program', 'Batch', 'Status', 'Date'];
    const csvRows = [headers.join(',')];

    filteredStudents.forEach(student => {
      const status = student.attendance?.status || 'absent';
      const row = [
        student.student_id || '',
        `"${student.name}"`,
        `"${student.program_name}"`,
        student.batch_id || '',
        status.charAt(0).toUpperCase() + status.slice(1),
        selectedDate
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedDate}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAttendanceChange = async (student, status) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('trainerToken');

      const response = await fetch('http://localhost:8000/api/trainer/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: student.id,
          batch_id: student.batch_id,
          date: selectedDate,
          status: status,
          time_in: status !== 'absent' ? `${selectedDate} ${student.schedule_time_start}` : null,
          time_out: status !== 'absent' ? `${selectedDate} ${student.schedule_time_end}` : null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the student list to get updated data
        fetchStudents();
      } else {
        setError(data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const groupRecordsByMonth = () => {
    const grouped = {};
    attendanceHistory.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(record);
    });
    return grouped;
  };

  const groupedRecords = groupRecordsByMonth();

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Attendance Management</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Daily Marking
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Summary View
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Picker - Only show in daily mode */}
              {viewMode === 'daily' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdCalendarToday className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    // Reset batch if it doesn't belong to the selected program
                    if (e.target.value !== 'all' && selectedBatch !== 'all') {
                      const batch = batches.find(b => b.batch_id === selectedBatch);
                      if (batch && batch.program_id !== parseInt(e.target.value)) {
                        setSelectedBatch('all');
                      }
                    }
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {getFilteredPrograms().map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    // Auto-select program if batch is selected
                    if (e.target.value !== 'all') {
                      const batch = batches.find(b => b.batch_id === e.target.value);
                      if (batch && selectedProgram === 'all') {
                        setSelectedProgram(batch.program_id.toString());
                      }
                    }
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Batches</option>
                  {getFilteredBatches().map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_id} - {batch.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search - Only show in daily mode */}
              {viewMode === 'daily' && (
                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary View */}
          {viewMode === 'summary' && !loading && !error && (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summaryStats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Present</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{summaryStats.present}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Absent</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{summaryStats.absent}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{summaryStats.late}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Excused</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{summaryStats.excused}</p>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                
                {Object.keys(groupedRecords).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedRecords).map(([monthYear, records]) => {
                      const monthStats = {
                        present: records.filter(r => r.status === 'present').length,
                        absent: records.filter(r => r.status === 'absent').length,
                        late: records.filter(r => r.status === 'late').length,
                        excused: records.filter(r => r.status === 'excused').length,
                        total: records.length
                      };
                      const monthPercentage = monthStats.total > 0 
                        ? Math.round(((monthStats.present + monthStats.late) / monthStats.total) * 100) 
                        : 0;

                      return (
                        <div key={monthYear} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{monthYear}</h4>
                            <span className="text-lg font-bold text-gray-900">{monthPercentage}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`h-full rounded-full ${
                                monthPercentage >= 90 ? 'bg-green-500' :
                                monthPercentage >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${monthPercentage}%` }}
                            ></div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-2 text-center text-sm">
                            <div>
                              <p className="font-semibold text-green-600">{monthStats.present}</p>
                              <p className="text-gray-600 text-xs">Present</p>
                            </div>
                            <div>
                              <p className="font-semibold text-red-600">{monthStats.absent}</p>
                              <p className="text-gray-600 text-xs">Absent</p>
                            </div>
                            <div>
                              <p className="font-semibold text-yellow-600">{monthStats.late}</p>
                              <p className="text-gray-600 text-xs">Late</p>
                            </div>
                            <div>
                              <p className="font-semibold text-blue-600">{monthStats.excused}</p>
                              <p className="text-gray-600 text-xs">Excused</p>
                            </div>
                          </div>

                          {/* List of dates */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Attendance dates:</p>
                            <div className="flex flex-wrap gap-1">
                              {records.slice(0, 10).map((r, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-xs px-2 py-1 rounded ${
                                    r.status === 'present' ? 'bg-green-50 text-green-700' :
                                    r.status === 'absent' ? 'bg-red-50 text-red-700' :
                                    r.status === 'late' ? 'bg-yellow-50 text-yellow-700' :
                                    'bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              ))}
                              {records.length > 10 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{records.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No attendance records available
                  </div>
                )}
              </div>
            </>
          )}

          {/* Weekend Notice */}
          {viewMode === 'daily' && isWeekend && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <MdInfo className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-700">
                  <strong>No Classes on Weekends</strong>
                  <br />
                  Attendance cannot be marked on Saturdays and Sundays. Please select a weekday.
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading {viewMode === 'daily' ? 'students' : 'attendance history'}...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Batch Date Info */}
          {viewMode === 'daily' && !loading && !isWeekend && selectedBatch !== 'all' && batches.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm text-blue-700">
                  {(() => {
                    const batch = batches.find(b => b.batch_id === selectedBatch);
                    if (batch) {
                      const startDate = new Date(batch.start_date).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      });
                      const endDate = new Date(batch.end_date).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      });
                      return (
                        <>
                          <strong>Batch Period:</strong> {startDate} to {endDate}
                          <br />
                          <span className="text-xs">Attendance can only be marked within this date range.</span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'daily' && !loading && !error && !isWeekend && (
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.filter(student => {
                      const matchesProgram = selectedProgram === 'all' || student.program_id === parseInt(selectedProgram);
                      const matchesBatch = selectedBatch === 'all' || student.batch_id === selectedBatch;
                      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                           (student.student_id && student.student_id.toLowerCase().includes(searchQuery.toLowerCase()));
                      return matchesProgram && matchesBatch && matchesSearch;
                    }).map((student) => {
                      const currentStatus = student.attendance?.status || '';
                      return (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.student_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.program_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.batch_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleAttendanceChange(student, e.target.value)}
                              disabled={saving}
                              className={`text-sm rounded-full px-3 py-1 font-medium border ${
                                saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                currentStatus === 'present' ? 'text-green-700 bg-green-50 border-green-200' :
                                currentStatus === 'late' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                                currentStatus === 'excused' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                currentStatus === 'absent' ? 'text-red-700 bg-red-50 border-red-200' :
                                'text-gray-700 bg-gray-50 border-gray-300'
                              }`}
                            >
                              <option value="">-- Mark Attendance --</option>
                              <option value="present">Present</option>
                              <option value="late">Late</option>
                              <option value="absent">Absent</option>
                              <option value="excused">Excused</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <MdPeople className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p className="font-medium mb-2">No students found</p>
                            <p className="text-sm">
                              {selectedDate && batches.length > 0 
                                ? "No students found for the selected date and filters. Please ensure the selected date falls within the batch start and end dates."
                                : "No students found for the selected filters."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerAttendance;
