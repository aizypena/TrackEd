import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdFactCheck, 
  MdCheckCircle, 
  MdCancel, 
  MdSchedule,
  MdTrendingUp,
  MdTrendingDown,
  MdCalendarToday,
  MdLocationOn,
  MdPerson,
  MdWarning,
  MdInfo,
  MdFilterList,
  MdDateRange,
  MdBarChart,
  MdMenu,
  MdClose,
  MdAccessTime
} from 'react-icons/md';

const Attendance = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    percentage: 0
  });
  const [batchInfo, setBatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'records'
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('studentToken');
      
      const response = await fetch('https://api.smitracked.cloud/api/student/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setAttendanceRecords(data.data);
        setStatistics(data.statistics);
        setBatchInfo(data.batch);
      } else {
        setError(data.message || 'Failed to load attendance records');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'text-green-700 bg-green-100 border-green-200';
      case 'absent': return 'text-red-700 bg-red-100 border-red-200';
      case 'late': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'excused': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <MdCheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <MdCancel className="h-5 w-5 text-red-600" />;
      case 'late': return <MdWarning className="h-5 w-5 text-yellow-600" />;
      case 'excused': return <MdInfo className="h-5 w-5 text-blue-600" />;
      default: return <MdInfo className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupRecordsByMonth = () => {
    const grouped = {};
    attendanceRecords.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(record);
    });
    return grouped;
  };

  const getFilteredRecords = () => {
    if (filterStatus === 'all') return attendanceRecords;
    return attendanceRecords.filter(record => record.status === filterStatus);
  };

  const filteredRecords = getFilteredRecords();
  const groupedRecords = groupRecordsByMonth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sidebarOpen={sidebarCollapsed}
        setSidebarOpen={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Attendance</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            <p className="mt-1 text-sm text-gray-600">View your attendance records and track your progress</p>
            {batchInfo && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">{batchInfo.program_name}</span> • Batch {batchInfo.batch_id}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading attendance records...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>

          {/* View Toggle Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewMode('records')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'records'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                All Records
              </button>
            </div>

            {viewMode === 'records' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            )}
          </div>

          {/* Summary View */}
          {viewMode === 'summary' && (
            <div className="space-y-4">
              {/* Monthly Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MdCalendarToday className="h-5 w-5 text-gray-600" />
                  Monthly Breakdown
                </h3>
                
                {Object.keys(groupedRecords).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedRecords).map(([monthYear, records]) => {
                      const monthStats = {
                        present: records.filter(r => r.status === 'present').length,
                        absent: records.filter(r => r.status === 'absent').length,
                        late: records.filter(r => r.status === 'late').length,
                        total: records.length
                      };
                      const monthPercentage = monthStats.total > 0 
                        ? Math.round(((monthStats.present + monthStats.late) / monthStats.total) * 100) 
                        : 0;

                      return (
                        <div key={monthYear} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{monthYear}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{monthStats.total} {monthStats.total === 1 ? 'class' : 'classes'}</span>
                              <span className={`text-lg font-bold ${
                                monthPercentage >= 90 ? 'text-green-600' :
                                monthPercentage >= 75 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {monthPercentage}%
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-full rounded-full ${
                                  monthPercentage >= 90 ? 'bg-green-500' :
                                  monthPercentage >= 75 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${monthPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white rounded p-2 text-center border border-gray-200">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <MdCheckCircle className="h-3 w-3 text-green-600" />
                                <p className="font-bold text-green-600">{monthStats.present}</p>
                              </div>
                              <p className="text-xs text-gray-600">Present</p>
                            </div>
                            <div className="bg-white rounded p-2 text-center border border-gray-200">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <MdCancel className="h-3 w-3 text-red-600" />
                                <p className="font-bold text-red-600">{monthStats.absent}</p>
                              </div>
                              <p className="text-xs text-gray-600">Absent</p>
                            </div>
                            <div className="bg-white rounded p-2 text-center border border-gray-200">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <MdAccessTime className="h-3 w-3 text-yellow-600" />
                                <p className="font-bold text-yellow-600">{monthStats.late}</p>
                              </div>
                              <p className="text-xs text-gray-600">Late</p>
                            </div>
                          </div>

                          {/* Absent Dates */}
                          {monthStats.absent > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <p className="text-xs font-medium text-gray-700 mb-2">Days you were absent:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {records
                                  .filter(r => r.status === 'absent')
                                  .map(r => (
                                    <span key={r.id} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md font-medium">
                                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  ))
                                }
                              </div>
                            </div>
                          )}

                          {/* Late Dates */}
                          {monthStats.late > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <p className="text-xs font-medium text-gray-700 mb-2">Days you were late:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {records
                                  .filter(r => r.status === 'late')
                                  .map(r => (
                                    <span key={r.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md font-medium">
                                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      {r.lateMinutes > 0 && ` (+${r.lateMinutes}m)`}
                                    </span>
                                  ))
                                }
                              </div>
                            </div>
                          )}
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
            </div>
          )}

          {/* Detailed Records View */}
          {viewMode === 'records' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Attendance Records</h3>
                  <p className="text-xs text-gray-500">
                    {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                            {record.status === 'present' && <MdCheckCircle className="h-3 w-3" />}
                            {record.status === 'absent' && <MdCancel className="h-3 w-3" />}
                            {record.status === 'late' && <MdAccessTime className="h-3 w-3" />}
                            {record.status === 'excused' && <MdInfo className="h-3 w-3" />}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            {record.status === 'late' && record.lateMinutes > 0 && ` (+${record.lateMinutes}m)`}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatDate(record.date)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{record.courseTitle}</h4>
                          {record.courseCode && record.courseCode !== 'N/A' && (
                            <p className="text-xs text-gray-500">{record.courseCode}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MdPerson className="h-3.5 w-3.5 text-gray-400" />
                            <span>{record.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MdSchedule className="h-3.5 w-3.5 text-gray-400" />
                            <span>{formatTime(record.startTime)} - {formatTime(record.endTime)}</span>
                          </div>
                        </div>

                        {record.total_hours && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Duration:</span> {record.total_hours} {record.total_hours === 1 ? 'hour' : 'hours'}
                          </div>
                        )}
                        
                        {record.topic && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs">
                            <p className="font-medium text-blue-900 mb-0.5">Topic:</p>
                            <p className="text-blue-800">{record.topic}</p>
                          </div>
                        )}
                        
                        {record.reason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs">
                            <p className="font-medium text-red-900 mb-0.5">Reason:</p>
                            <p className="text-red-800">{record.reason}</p>
                          </div>
                        )}

                        {record.remarks && record.remarks !== record.reason && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                            <p className="font-medium text-gray-900 mb-0.5">Remarks:</p>
                            <p className="text-gray-700">{record.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <MdInfo className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No attendance records found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {filterStatus !== 'all' ? 'Try changing the filter' : 'Records will appear here once attendance is marked'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
