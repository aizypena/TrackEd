import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdSchedule,
  MdPeople,
  MdRoom,
  MdViewDay,
  MdViewWeek,
  MdViewModule,
  MdChevronLeft,
  MdChevronRight,
  MdRefresh,
  MdPrint,
  MdDownload,
  MdCheckCircle,
  MdWarning,
  MdPending,
  MdCancel,
  MdAccessTime,
  MdLocationOn,
  MdPerson
} from 'react-icons/md';

const StaffTrainingSched = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('week'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 6)); // October 6, 2025
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);

  // Mock data - replace with actual API calls
  const [trainingSessions, setTrainingSessions] = useState([
    {
      id: 1,
      title: 'Welding NCII - Arc Welding Basics',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      instructor: 'Engr. Ramon Cruz',
      date: '2025-10-06',
      startTime: '08:00',
      endTime: '12:00',
      duration: '4 hours',
      room: 'Workshop A',
      participants: 15,
      maxParticipants: 20,
      status: 'ongoing',
      type: 'practical',
      description: 'Introduction to arc welding techniques and safety procedures'
    },
    {
      id: 2,
      title: 'Automotive NCII - Engine Diagnostics',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      instructor: 'Mr. Jose Santos',
      date: '2025-10-06',
      startTime: '13:00',
      endTime: '17:00',
      duration: '4 hours',
      room: 'Auto Lab',
      participants: 18,
      maxParticipants: 18,
      status: 'scheduled',
      type: 'practical',
      description: 'Hands-on engine troubleshooting and diagnostic procedures'
    },
    {
      id: 3,
      title: 'Electronics NCII - Circuit Analysis',
      program: 'Electronics NCII',
      batch: 'Batch 01-2025',
      instructor: 'Engr. Maria Garcia',
      date: '2025-10-07',
      startTime: '09:00',
      endTime: '11:00',
      duration: '2 hours',
      room: 'Room 201',
      participants: 12,
      maxParticipants: 15,
      status: 'scheduled',
      type: 'theory',
      description: 'Theoretical foundations of electronic circuit analysis'
    },
    {
      id: 4,
      title: 'Food Processing NCII - Safety & Sanitation',
      program: 'Food Processing NCII',
      batch: 'Batch 03-2025',
      instructor: 'Ms. Ana Lopez',
      date: '2025-10-07',
      startTime: '14:00',
      endTime: '16:00',
      duration: '2 hours',
      room: 'Food Lab',
      participants: 14,
      maxParticipants: 16,
      status: 'scheduled',
      type: 'theory',
      description: 'Food safety standards and sanitation protocols'
    },
    {
      id: 5,
      title: 'Welding NCII - Gas Metal Arc Welding',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      instructor: 'Engr. Ramon Cruz',
      date: '2025-10-08',
      startTime: '08:00',
      endTime: '12:00',
      duration: '4 hours',
      room: 'Workshop A',
      participants: 15,
      maxParticipants: 20,
      status: 'scheduled',
      type: 'practical',
      description: 'Advanced GMAW techniques and applications'
    },
    {
      id: 6,
      title: 'Plumbing NCII - Pipe Installation',
      program: 'Plumbing NCII',
      batch: 'Batch 02-2025',
      instructor: 'Mr. Pedro Reyes',
      date: '2025-10-08',
      startTime: '13:00',
      endTime: '17:00',
      duration: '4 hours',
      room: 'Workshop B',
      participants: 10,
      maxParticipants: 15,
      status: 'scheduled',
      type: 'practical',
      description: 'Hands-on pipe cutting, threading, and installation'
    },
    {
      id: 7,
      title: 'Automotive NCII - Brake System Maintenance',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      instructor: 'Mr. Jose Santos',
      date: '2025-10-09',
      startTime: '08:00',
      endTime: '12:00',
      duration: '4 hours',
      room: 'Auto Lab',
      participants: 18,
      maxParticipants: 18,
      status: 'scheduled',
      type: 'practical',
      description: 'Brake system inspection, maintenance, and repair'
    },
    {
      id: 8,
      title: 'Carpentry NCII - Safety Orientation',
      program: 'Carpentry NCII',
      batch: 'Batch 04-2025',
      instructor: 'Mr. Roberto Tan',
      date: '2025-10-05',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3 hours',
      room: 'Room 101',
      participants: 20,
      maxParticipants: 20,
      status: 'completed',
      type: 'theory',
      description: 'Workshop safety rules and equipment handling'
    }
  ]);

  const programs = [
    'Welding NCII',
    'Automotive Servicing NCII',
    'Electronics NCII',
    'Food Processing NCII',
    'Plumbing NCII',
    'Carpentry NCII'
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdSchedule className="h-4 w-4" />,
        label: 'Scheduled'
      },
      ongoing: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Ongoing'
      },
      completed: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Completed'
      },
      cancelled: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return type === 'practical' ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Practical
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Theory
      </span>
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const filteredSessions = trainingSessions
    .filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.room.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || session.program === programFilter;
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesSearch && matchesProgram && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });

  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(first + i));
      dates.push(date);
    }
    return dates;
  };

  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredSessions.filter(session => session.date === dateStr);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const stats = {
    totalSessions: trainingSessions.length,
    scheduledSessions: trainingSessions.filter(s => s.status === 'scheduled').length,
    ongoingSessions: trainingSessions.filter(s => s.status === 'ongoing').length,
    completedSessions: trainingSessions.filter(s => s.status === 'completed').length
  };

  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Training Schedule</h1>
                <p className="text-sm text-blue-100">Manage training sessions and schedules</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Add Session</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdCalendarToday className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Sessions</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalSessions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdSchedule className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Scheduled</p>
                  <p className="text-xl font-bold text-purple-600">{stats.scheduledSessions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ongoing</p>
                  <p className="text-xl font-bold text-green-600">{stats.ongoingSessions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-xl font-bold text-gray-600">{stats.completedSessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and View Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'day' ? 'bg-tracked-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MdViewDay className="h-5 w-5" />
                    <span className="text-sm">Day</span>
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'week' ? 'bg-tracked-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MdViewWeek className="h-5 w-5" />
                    <span className="text-sm">Week</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-tracked-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MdViewModule className="h-5 w-5" />
                    <span className="text-sm">List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <MdDownload className="h-5 w-5" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <MdPrint className="h-5 w-5" />
                Print
              </button>
            </div>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Week Navigation */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <MdChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-800">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <MdChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 divide-x divide-gray-200">
                {weekDates.map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const sessionsForDay = getSessionsForDate(date);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={index} className="min-h-[300px] bg-white">
                      <div className={`p-3 text-center border-b border-gray-200 ${isToday ? 'bg-tracked-primary text-white' : 'bg-gray-50'}`}>
                        <div className="text-xs font-medium uppercase">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold mt-1 ${isToday ? 'text-white' : 'text-gray-800'}`}>
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        {sessionsForDay.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className="bg-blue-50 border-l-4 border-tracked-primary p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <div className="text-xs font-semibold text-tracked-primary truncate">
                              {formatTime(session.startTime)}
                            </div>
                            <div className="text-xs font-medium text-gray-800 truncate mt-1">
                              {session.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {session.room}
                            </div>
                          </div>
                        ))}
                        {sessionsForDay.length === 0 && (
                          <div className="text-xs text-gray-400 text-center py-4">
                            No sessions
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Day Navigation */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => navigateDay(-1)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <MdChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-800">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                </div>
                <button
                  onClick={() => navigateDay(1)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <MdChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Sessions for Day */}
              <div className="p-6">
                {getSessionsForDate(currentDate).length > 0 ? (
                  <div className="space-y-4">
                    {getSessionsForDate(currentDate).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{session.title}</h3>
                              {getStatusBadge(session.status)}
                              {getTypeBadge(session.type)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MdAccessTime className="h-4 w-4" />
                                <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MdPerson className="h-4 w-4" />
                                <span>{session.instructor}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MdLocationOn className="h-4 w-4" />
                                <span>{session.room}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MdPeople className="h-4 w-4" />
                                <span>{session.participants}/{session.maxParticipants} participants</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MdCalendarToday className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg">No sessions scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{session.title}</div>
                            <div className="text-xs text-gray-500">{session.program}</div>
                            <div className="flex gap-2 mt-1">
                              {getTypeBadge(session.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{session.date}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">({session.duration})</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{session.instructor}</div>
                            <div className="text-xs text-gray-500">{session.batch}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <MdRoom className="h-4 w-4 text-gray-400" />
                              {session.room}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {session.participants}/{session.maxParticipants}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  (session.participants / session.maxParticipants) >= 1 
                                    ? 'bg-red-600' 
                                    : (session.participants / session.maxParticipants) >= 0.8 
                                      ? 'bg-yellow-600' 
                                      : 'bg-green-600'
                                }`}
                                style={{ width: `${(session.participants / session.maxParticipants) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(session.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedSession(session)}
                                className="text-tracked-primary hover:text-tracked-secondary"
                                title="View Details"
                              >
                                <MdViewDay className="h-5 w-5" />
                              </button>
                              <button
                                className="text-blue-600 hover:text-blue-700"
                                title="Edit Session"
                              >
                                <MdEdit className="h-5 w-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-700"
                                title="Cancel Session"
                              >
                                <MdDelete className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No training sessions found matching your filters.
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

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedSession.title}</h2>
                  <p className="text-blue-100">{selectedSession.program} • {selectedSession.batch}</p>
                  <div className="flex gap-2 mt-3">
                    {getStatusBadge(selectedSession.status)}
                    {getTypeBadge(selectedSession.type)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdCancel className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdCalendarToday className="h-5 w-5" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedSession.date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdAccessTime className="h-5 w-5" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{selectedSession.duration}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdPerson className="h-5 w-5" />
                    <span className="text-sm font-medium">Instructor</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedSession.instructor}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdLocationOn className="h-5 w-5" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedSession.room}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdPeople className="h-5 w-5" />
                    <span className="text-sm font-medium">Participants</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {selectedSession.participants}/{selectedSession.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      (selectedSession.participants / selectedSession.maxParticipants) >= 1 
                        ? 'bg-red-600' 
                        : (selectedSession.participants / selectedSession.maxParticipants) >= 0.8 
                          ? 'bg-yellow-600' 
                          : 'bg-green-600'
                    }`}
                    style={{ width: `${(selectedSession.participants / selectedSession.maxParticipants) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {((selectedSession.participants / selectedSession.maxParticipants) * 100).toFixed(0)}% capacity
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-800">{selectedSession.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Session
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Schedule
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  <MdCancel className="h-5 w-5" />
                  Cancel Session
                </button>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="ml-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTrainingSched;
