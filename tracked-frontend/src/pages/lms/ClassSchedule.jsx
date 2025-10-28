import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdSchedule, 
  MdLocationOn, 
  MdPerson,
  MdAccessTime,
  MdCalendarToday,
  MdEvent,
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdNotifications,
  MdInfo,
  MdSchool,
  MdMenu,
  MdClose
} from 'react-icons/md';

const ClassSchedule = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('week'); // 'week' or 'month'
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [batchInfo, setBatchInfo] = useState(null);
  const [programInfo, setProgramInfo] = useState(null);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
      fetchStudentSchedule();
    }
  }, []);

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('http://localhost:8000/api/student/schedule', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentSchedule(data.schedule || []);
        setBatchInfo(data.batch);
        setProgramInfo(data.program);
        setTrainerInfo(data.trainer);
      } else {
        console.error('Failed to fetch schedule');
        setStudentSchedule([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setStudentSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 border-blue-300 text-blue-800',
      green: 'bg-green-100 border-green-300 text-green-800',
      purple: 'bg-purple-100 border-purple-300 text-purple-800',
      orange: 'bg-orange-100 border-orange-300 text-orange-800',
      red: 'bg-red-100 border-red-300 text-red-800'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(date.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getUpcomingClasses = () => {
    const today = new Date();
    const todayDay = today.getDay();
    const currentTime = today.getHours() * 100 + today.getMinutes();

    return studentSchedule
      .filter(schedule => {
        const scheduleTime = parseInt(schedule.startTime.replace(':', ''));
        return schedule.dayOfWeek >= todayDay && 
               (schedule.dayOfWeek > todayDay || scheduleTime > currentTime);
      })
      .slice(0, 3)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startTime.localeCompare(b.startTime);
      });
  };

  const getClassesForDay = (dayIndex, date) => {
    // If batch info is available, check if the date is within batch start and end dates
    if (batchInfo && batchInfo.start_date) {
      const batchStart = new Date(batchInfo.start_date);
      const batchEnd = batchInfo.end_date ? new Date(batchInfo.end_date) : null;
      
      // Set time to midnight for accurate date comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      batchStart.setHours(0, 0, 0, 0);
      
      // Check if date is before batch start
      if (checkDate < batchStart) {
        return [];
      }
      
      // Check if date is after batch end (if end date exists)
      if (batchEnd) {
        batchEnd.setHours(0, 0, 0, 0);
        if (checkDate > batchEnd) {
          return [];
        }
      }
    }
    
    return studentSchedule.filter(schedule => schedule.dayOfWeek === dayIndex);
  };

  const weekDates = getWeekDates(currentDate);
  const upcomingClasses = getUpcomingClasses();

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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
            <h1 className="text-lg font-semibold text-gray-900">Class Schedule</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your schedule...</p>
            </div>
          </div>
        ) : studentSchedule.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <MdSchedule className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Schedule Available</h2>
              <p className="text-gray-600">You haven't been assigned to a batch yet.</p>
              <p className="text-gray-500 text-sm mt-2">Please contact the administration office.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
                <p className="mt-2 text-gray-600">Your personal class timetable and upcoming sessions</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={goToToday}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <MdToday className="h-4 w-4 mr-2" />
                  Today
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Schedule */}
            <div className="xl:col-span-3">
              {/* Schedule Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MdChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MdChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weekly Calendar Grid */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-7 gap-2 min-w-[800px]">
                      {/* Day headers */}
                      {weekDates.map((date, index) => (
                        <div key={index} className="text-center p-2 border-b border-gray-200">
                          <div className="text-sm font-medium text-gray-900">
                            {daysOfWeek[index]}
                          </div>
                          <div className={`text-sm mt-1 w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            date.toDateString() === new Date().toDateString()
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500'
                          }`}>
                            {date.getDate()}
                          </div>
                        </div>
                      ))}

                      {/* Classes for each day */}
                      {weekDates.map((date, dayIndex) => {
                        const currentDate = date;
                        const dayClasses = getClassesForDay(dayIndex, currentDate);

                        return (
                          <div key={dayIndex} className="p-3 min-h-[120px] border-r border-gray-100 last:border-r-0">
                            {dayClasses.length > 0 ? (
                              dayClasses.map(schedule => (
                                <div
                                  key={schedule.id}
                                  className={`mb-2 p-3 rounded-md border-l-4 ${getColorClasses(schedule.color)} text-xs`}
                                >
                                  <div className="font-semibold text-sm mb-1">
                                    {schedule.courseTitle}
                                  </div>
                                  <div className="text-xs opacity-75 flex items-center mt-1">
                                    <MdAccessTime className="h-3 w-3 mr-1" />
                                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                  </div>
                                  {schedule.instructor && schedule.instructor !== 'TBA' && (
                                    <div className="text-xs opacity-75 flex items-center mt-1">
                                      <MdPerson className="h-3 w-3 mr-1" />
                                      {schedule.instructor}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400 text-center py-4">
                                No classes
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Upcoming Classes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdNotifications className="h-5 w-5 mr-2 text-blue-600" />
                    Upcoming Classes
                  </h3>
                  <div className="space-y-4">
                    {upcomingClasses.length > 0 ? (
                      upcomingClasses.map(schedule => (
                        <div key={schedule.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.courseTitle}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {daysOfWeek[schedule.dayOfWeek]} • {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                          {schedule.instructor && schedule.instructor !== 'TBA' && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MdPerson className="h-3 w-3 mr-1" />
                              {schedule.instructor}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No upcoming classes today</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Today's Classes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdEvent className="h-5 w-5 mr-2 text-green-600" />
                    Today's Classes
                  </h3>
                  <div className="space-y-3">
                    {getClassesForDay(new Date().getDay(), new Date()).length > 0 ? (
                      getClassesForDay(new Date().getDay(), new Date()).map(schedule => (
                        <div key={schedule.id} className={`p-3 rounded-lg ${getColorClasses(schedule.color)}`}>
                          <div className="text-sm font-medium">
                            {schedule.courseCode}
                          </div>
                          <div className="text-xs mt-1 opacity-75">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                          {schedule.instructor && schedule.instructor !== 'TBA' && (
                            <div className="text-xs mt-1 opacity-75 flex items-center">
                              <MdPerson className="h-3 w-3 mr-1" />
                              {schedule.instructor}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No classes scheduled for today</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MdInfo className="h-5 w-5 mr-2 text-purple-600" />
                    Weekly Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Classes</span>
                      <span className="text-sm font-medium text-gray-900">{studentSchedule.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Hours</span>
                      <span className="text-sm font-medium text-gray-900">
                        {studentSchedule.reduce((total, schedule) => {
                          const start = parseInt(schedule.startTime.replace(':', ''));
                          const end = parseInt(schedule.endTime.replace(':', ''));
                          return total + ((end - start) / 100);
                        }, 0)}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Courses</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Set(studentSchedule.map(s => s.courseCode)).size}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
                  {programInfo ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Program:</span>
                        <p className="text-sm font-medium text-gray-900">{programInfo.name}</p>
                      </div>
                      {trainerInfo && (
                        <div>
                          <span className="text-sm text-gray-600">Instructor:</span>
                          <p className="text-sm font-medium text-gray-900">{trainerInfo.name}</p>
                        </div>
                      )}
                      {batchInfo && (
                        <>
                          <div>
                            <span className="text-sm text-gray-600">Batch ID:</span>
                            <p className="text-sm font-medium text-gray-900">{batchInfo.batch_id}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Status:</span>
                            <p className="text-sm font-medium text-gray-900 capitalize">{batchInfo.status}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No program information available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ClassSchedule;
