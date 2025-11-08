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
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('http://localhost:8000/api/student/attendance', {
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Monitoring</h1>
            <p className="mt-2 text-gray-600">Track your class attendance and monitor your progress</p>
            {batchInfo && (
              <p className="mt-1 text-sm text-gray-500">
                Batch: {batchInfo.batch_id} | Program: {batchInfo.program_name}
              </p>
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
          {/* Attendance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium">Overall Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.percentage}%</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium">Present</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.present}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium">Absent</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.absent}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium">Late</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.late}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Main Attendance Records */}
            <div>
              {/* Attendance Records */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Attendance Records
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <div key={record.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                {record.status === 'late' && record.lateMinutes && ` (${record.lateMinutes} min)`}
                              </span>
                              <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            
                            <h4 className="text-base font-medium text-gray-900 mb-1">
                              {record.courseTitle}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{record.courseCode}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Instructor:</span> {record.instructor}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {formatTime(record.startTime)} - {formatTime(record.endTime)}
                              </div>
                            </div>
                            
                            {record.topic && (
                              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                                <p className="text-sm font-medium text-gray-900">Topic Covered:</p>
                                <p className="text-sm text-gray-700">{record.topic}</p>
                              </div>
                            )}
                            
                            {record.reason && (
                              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                                <p className="text-sm font-medium text-gray-900">Absence Reason:</p>
                                <p className="text-sm text-gray-700">{record.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No attendance records found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
