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
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Sample attendance data
  const attendanceRecords = [
    {
      id: 1,
      date: '2025-09-18',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      instructor: 'Chef Maria Santos',
      startTime: '08:00',
      endTime: '12:00',
      location: 'Kitchen Laboratory A',
      status: 'present',
      timeIn: '07:55',
      timeOut: '12:05',
      topic: 'Table Service Standards and Customer Relations'
    },
    {
      id: 2,
      date: '2025-09-17',
      courseTitle: 'Cookery NC II',
      courseCode: 'COOK-NC2-2025',
      instructor: 'Chef Roberto Cruz',
      startTime: '13:00',
      endTime: '18:00',
      location: 'Main Kitchen',
      status: 'present',
      timeIn: '12:58',
      timeOut: '18:10',
      topic: 'Basic Knife Skills and Vegetable Cuts'
    },
    {
      id: 3,
      date: '2025-09-16',
      courseTitle: 'Bread and Pastry Production NC II',
      courseCode: 'BPP-NC2-2025',
      instructor: 'Chef Anna Reyes',
      startTime: '07:00',
      endTime: '17:00',
      location: 'Bakery Laboratory',
      status: 'present',
      timeIn: '06:55',
      timeOut: '17:15',
      topic: 'Bread Dough Preparation and Fermentation'
    },
    {
      id: 4,
      date: '2025-09-15',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      instructor: 'Chef Maria Santos',
      startTime: '08:00',
      endTime: '12:00',
      location: 'Kitchen Laboratory A',
      status: 'absent',
      timeIn: null,
      timeOut: null,
      topic: 'Wine Service and Beverage Knowledge',
      reason: 'Medical appointment'
    },
    {
      id: 5,
      date: '2025-09-13',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      instructor: 'Chef Maria Santos',
      startTime: '08:00',
      endTime: '12:00',
      location: 'Kitchen Laboratory A',
      status: 'late',
      timeIn: '08:25',
      timeOut: '12:00',
      topic: 'Restaurant Service Procedures',
      lateMinutes: 25
    },
    {
      id: 6,
      date: '2025-09-12',
      courseTitle: 'Cookery NC II',
      courseCode: 'COOK-NC2-2025',
      instructor: 'Chef Roberto Cruz',
      startTime: '13:00',
      endTime: '18:00',
      location: 'Main Kitchen',
      status: 'present',
      timeIn: '12:50',
      timeOut: '18:05',
      topic: 'Sauce Preparation and Mother Sauces'
    },
    {
      id: 7,
      date: '2025-09-11',
      courseTitle: 'Food and Beverage Services NC II',
      courseCode: 'FBS-NC2-2025',
      instructor: 'Chef Maria Santos',
      startTime: '08:00',
      endTime: '12:00',
      location: 'Kitchen Laboratory A',
      status: 'present',
      timeIn: '07:58',
      timeOut: '12:02',
      topic: 'Menu Knowledge and Product Information'
    },
    {
      id: 8,
      date: '2025-09-10',
      courseTitle: 'Cookery NC II',
      courseCode: 'COOK-NC2-2025',
      instructor: 'Chef Roberto Cruz',
      startTime: '13:00',
      endTime: '18:00',
      location: 'Main Kitchen',
      status: 'present',
      timeIn: '13:02',
      timeOut: '18:00',
      topic: 'Meat Cookery and Temperature Control'
    }
  ];

  const courses = [
    { code: 'all', title: 'All Courses' },
    { code: 'FBS-NC2-2025', title: 'Food and Beverage Services NC II' },
    { code: 'COOK-NC2-2025', title: 'Cookery NC II' },
    { code: 'BPP-NC2-2025', title: 'Bread and Pastry Production NC II' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'text-green-700 bg-green-100 border-green-200';
      case 'absent': return 'text-red-700 bg-red-100 border-red-200';
      case 'late': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <MdCheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <MdCancel className="h-5 w-5 text-red-600" />;
      case 'late': return <MdWarning className="h-5 w-5 text-yellow-600" />;
      default: return <MdInfo className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const courseMatch = selectedCourse === 'all' || record.courseCode === selectedCourse;
    const monthMatch = recordDate.getMonth() === selectedMonth;
    const yearMatch = recordDate.getFullYear() === selectedYear;
    return courseMatch && monthMatch && yearMatch;
  });

  const calculateAttendanceStats = () => {
    const records = selectedCourse === 'all' 
      ? attendanceRecords 
      : attendanceRecords.filter(r => r.courseCode === selectedCourse);
    
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    
    return {
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? ((present + late) / total * 100).toFixed(1) : 0
    };
  };

  const getCourseAttendanceStats = () => {
    return courses.slice(1).map(course => {
      const courseRecords = attendanceRecords.filter(r => r.courseCode === course.code);
      const total = courseRecords.length;
      const present = courseRecords.filter(r => r.status === 'present').length;
      const late = courseRecords.filter(r => r.status === 'late').length;
      const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
      
      return {
        ...course,
        total,
        present,
        late,
        absent: courseRecords.filter(r => r.status === 'absent').length,
        percentage
      };
    });
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

  const stats = calculateAttendanceStats();
  const courseStats = getCourseAttendanceStats();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
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
          </div>

          {/* Attendance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Overall Attendance</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.percentage}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MdTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.present}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <MdCancel className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Late</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.late}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <MdWarning className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Attendance Records */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdFilterList className="h-5 w-5 mr-2 text-blue-600" />
                    Filter Attendance Records
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {courses.map(course => (
                          <option key={course.code} value={course.code}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Date(2025, i).toLocaleDateString('en-US', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MdFactCheck className="h-5 w-5 mr-2 text-blue-600" />
                    Attendance Records
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(record.status)}
                              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                {record.status === 'late' && record.lateMinutes && ` (${record.lateMinutes} min)`}
                              </span>
                              <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            
                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                              {record.courseTitle}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{record.courseCode}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MdPerson className="h-4 w-4 mr-1" />
                                {record.instructor}
                              </div>
                              <div className="flex items-center">
                                <MdLocationOn className="h-4 w-4 mr-1" />
                                {record.location}
                              </div>
                              <div className="flex items-center">
                                <MdSchedule className="h-4 w-4 mr-1" />
                                {formatTime(record.startTime)} - {formatTime(record.endTime)}
                              </div>
                              <div className="flex items-center">
                                <MdAccessTime className="h-4 w-4 mr-1" />
                                {record.timeIn ? `In: ${formatTime(record.timeIn)}` : 'Not recorded'}
                              </div>
                            </div>
                            
                            {record.topic && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm font-medium text-blue-900">Topic Covered:</p>
                                <p className="text-sm text-blue-700">{record.topic}</p>
                              </div>
                            )}
                            
                            {record.reason && (
                              <div className="mt-3 p-3 bg-red-50 rounded-md">
                                <p className="text-sm font-medium text-red-900">Absence Reason:</p>
                                <p className="text-sm text-red-700">{record.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MdCalendarToday className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No attendance records found for the selected filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Course-wise Attendance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdBarChart className="h-5 w-5 mr-2 text-purple-600" />
                    Course-wise Attendance
                  </h3>
                  <div className="space-y-4">
                    {courseStats.map(course => (
                      <div key={course.code} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {course.code}
                          </h4>
                          <span className="text-lg font-bold text-blue-600">
                            {course.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.percentage}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-green-600 font-medium">{course.present}</div>
                            <div className="text-gray-500">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-600 font-medium">{course.late}</div>
                            <div className="text-gray-500">Late</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-medium">{course.absent}</div>
                            <div className="text-gray-500">Absent</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attendance Goal */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Attendance Target
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Target Rate</span>
                      <span className="text-2xl font-bold text-blue-600">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          stats.percentage >= 95 ? 'bg-green-500' : 
                          stats.percentage >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Current Progress</span>
                      <span className="font-medium text-gray-900">{stats.percentage}%</span>
                    </div>
                    {stats.percentage >= 95 ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 text-sm font-medium">Target Achievement Status</p>
                        <p className="text-green-700 text-sm">Excellent attendance record maintained</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-800 text-sm font-medium">Progress to Target</p>
                        <p className="text-blue-700 text-sm">
                          {(95 - parseFloat(stats.percentage)).toFixed(1)}% improvement needed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Classes</span>
                      <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Classes Attended</span>
                      <span className="text-sm font-medium text-gray-900">{stats.present + stats.late}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Perfect Attendance</span>
                      <span className="text-sm font-medium text-gray-900">{stats.present}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-sm font-medium text-gray-900">
                        {filteredRecords.length} classes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
