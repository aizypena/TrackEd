import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdPeople,
  MdCalendarToday,
  MdCheckCircle,
  MdWarning,
  MdPending,
  MdCancel,
  MdRefresh,
  MdDownload,
  MdPrint,
  MdGroup,
  MdSchool,
  MdAssignment,
  MdTrendingUp,
  MdClose,
  MdPersonAdd,
  MdSchedule,
  MdLocationOn
} from 'react-icons/md';

const StaffBatchManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Mock data - replace with actual API calls
  const [batches, setBatches] = useState([
    {
      id: 1,
      batchCode: 'BATCH-01-2025',
      batchName: 'Welding NCII - Morning Batch',
      program: 'Welding NCII',
      instructor: 'Engr. Ramon Cruz',
      startDate: '2025-09-01',
      endDate: '2025-12-15',
      duration: '3.5 months',
      schedule: 'Mon-Fri, 8:00 AM - 12:00 PM',
      location: 'Workshop A',
      maxStudents: 20,
      enrolledStudents: 18,
      activeStudents: 17,
      completedStudents: 0,
      droppedStudents: 1,
      status: 'active',
      progress: 45,
      students: [
        { id: 1, name: 'Juan Dela Cruz', status: 'active', attendance: 95 },
        { id: 2, name: 'Maria Santos', status: 'active', attendance: 92 },
        { id: 3, name: 'Pedro Reyes', status: 'dropped', attendance: 65 }
      ]
    },
    {
      id: 2,
      batchCode: 'BATCH-02-2025',
      batchName: 'Automotive Servicing NCII - Afternoon Batch',
      program: 'Automotive Servicing NCII',
      instructor: 'Mr. Jose Santos',
      startDate: '2025-09-15',
      endDate: '2026-01-20',
      duration: '4 months',
      schedule: 'Mon-Fri, 1:00 PM - 5:00 PM',
      location: 'Auto Lab',
      maxStudents: 18,
      enrolledStudents: 18,
      activeStudents: 18,
      completedStudents: 0,
      droppedStudents: 0,
      status: 'active',
      progress: 30,
      students: [
        { id: 4, name: 'Ana Garcia', status: 'active', attendance: 98 },
        { id: 5, name: 'Roberto Cruz', status: 'active', attendance: 88 }
      ]
    },
    {
      id: 3,
      batchCode: 'BATCH-03-2025',
      batchName: 'Electronics NCII - Weekend Batch',
      program: 'Electronics NCII',
      instructor: 'Engr. Maria Garcia',
      startDate: '2025-10-01',
      endDate: '2026-02-28',
      duration: '5 months',
      schedule: 'Sat-Sun, 9:00 AM - 4:00 PM',
      location: 'Room 201',
      maxStudents: 15,
      enrolledStudents: 12,
      activeStudents: 12,
      completedStudents: 0,
      droppedStudents: 0,
      status: 'active',
      progress: 10,
      students: [
        { id: 6, name: 'Carmen Lopez', status: 'active', attendance: 100 },
        { id: 7, name: 'Luis Martinez', status: 'active', attendance: 95 }
      ]
    },
    {
      id: 4,
      batchCode: 'BATCH-04-2025',
      batchName: 'Food Processing NCII',
      program: 'Food Processing NCII',
      instructor: 'Ms. Ana Lopez',
      startDate: '2025-10-15',
      endDate: '2026-02-15',
      duration: '4 months',
      schedule: 'Mon-Fri, 8:00 AM - 12:00 PM',
      location: 'Food Lab',
      maxStudents: 16,
      enrolledStudents: 14,
      activeStudents: 14,
      completedStudents: 0,
      droppedStudents: 0,
      status: 'upcoming',
      progress: 0,
      students: []
    },
    {
      id: 5,
      batchCode: 'BATCH-05-2024',
      batchName: 'Plumbing NCII - Completed',
      program: 'Plumbing NCII',
      instructor: 'Mr. Pedro Reyes',
      startDate: '2024-06-01',
      endDate: '2024-09-30',
      duration: '4 months',
      schedule: 'Mon-Fri, 1:00 PM - 5:00 PM',
      location: 'Workshop B',
      maxStudents: 15,
      enrolledStudents: 15,
      activeStudents: 0,
      completedStudents: 13,
      droppedStudents: 2,
      status: 'completed',
      progress: 100,
      students: [
        { id: 8, name: 'Sofia Ramos', status: 'completed', attendance: 96 },
        { id: 9, name: 'Diego Torres', status: 'completed', attendance: 94 }
      ]
    },
    {
      id: 6,
      batchCode: 'BATCH-06-2025',
      batchName: 'Carpentry NCII',
      program: 'Carpentry NCII',
      instructor: 'Mr. Roberto Tan',
      startDate: '2025-11-01',
      endDate: '2026-03-15',
      duration: '4.5 months',
      schedule: 'Mon-Fri, 8:00 AM - 12:00 PM',
      location: 'Carpentry Shop',
      maxStudents: 20,
      enrolledStudents: 5,
      activeStudents: 0,
      completedStudents: 0,
      droppedStudents: 0,
      status: 'enrollment',
      progress: 0,
      students: []
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
      active: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Active'
      },
      upcoming: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Upcoming'
      },
      enrollment: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdPersonAdd className="h-4 w-4" />,
        label: 'Enrollment'
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

    const config = statusConfig[status] || statusConfig.enrollment;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredBatches = batches
    .filter(batch => {
      const matchesSearch = batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || batch.program === programFilter;
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
      return matchesSearch && matchesProgram && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.startDate) - new Date(a.startDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortBy === 'name') {
        return a.batchName.localeCompare(b.batchName);
      } else if (sortBy === 'students') {
        return b.enrolledStudents - a.enrolledStudents;
      }
      return 0;
    });

  const stats = {
    totalBatches: batches.length,
    activeBatches: batches.filter(b => b.status === 'active').length,
    totalStudents: batches.reduce((sum, b) => sum + b.activeStudents, 0),
    completedBatches: batches.filter(b => b.status === 'completed').length
  };

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
                <h1 className="text-xl font-bold">Batch Management</h1>
                <p className="text-sm text-blue-100">Manage training batches and student groups</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Create Batch</span>
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
                  <MdGroup className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Batches</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalBatches}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Batches</p>
                  <p className="text-xl font-bold text-green-600">{stats.activeBatches}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdPeople className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students</p>
                  <p className="text-xl font-bold text-purple-600">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <MdSchool className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-xl font-bold text-gray-600">{stats.completedBatches}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search batches..."
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
                  <option value="enrollment">Enrollment</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="students">Most Students</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
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

          {/* Batches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="bg-tracked-primary p-4 text-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{batch.batchName}</h3>
                        <p className="text-sm text-blue-100">{batch.batchCode}</p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                    <div className="text-sm text-blue-100 mt-2">
                      {batch.program}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Instructor & Location */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MdSchool className="h-4 w-4 text-gray-400" />
                        <span>{batch.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MdLocationOn className="h-4 w-4 text-gray-400" />
                        <span>{batch.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MdSchedule className="h-4 w-4 text-gray-400" />
                        <span>{batch.schedule}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Start Date</p>
                          <p className="font-semibold text-gray-800">{batch.startDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs mb-1">End Date</p>
                          <p className="font-semibold text-gray-800">{batch.endDate}</p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs text-gray-500">Duration: {batch.duration}</p>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Students Enrolled</span>
                        <span className="text-sm font-bold text-gray-800">
                          {batch.enrolledStudents}/{batch.maxStudents}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (batch.enrolledStudents / batch.maxStudents) >= 1 
                              ? 'bg-red-600' 
                              : (batch.enrolledStudents / batch.maxStudents) >= 0.8 
                                ? 'bg-yellow-600' 
                                : 'bg-green-600'
                          }`}
                          style={{ width: `${(batch.enrolledStudents / batch.maxStudents) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Active: {batch.activeStudents}</span>
                        {batch.droppedStudents > 0 && (
                          <span className="text-red-600">Dropped: {batch.droppedStudents}</span>
                        )}
                        {batch.completedStudents > 0 && (
                          <span className="text-green-600">Completed: {batch.completedStudents}</span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    {batch.status === 'active' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-tracked-primary">{batch.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-tracked-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${batch.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors text-sm"
                      >
                        <MdVisibility className="h-4 w-4" />
                        View
                      </button>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <MdGroup className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No batches found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedBatch.batchName}</h2>
                  <p className="text-blue-100">{selectedBatch.batchCode} • {selectedBatch.program}</p>
                  <div className="flex gap-2 mt-3">
                    {getStatusBadge(selectedBatch.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Batch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdSchool className="h-5 w-5" />
                    <span className="text-sm font-medium">Instructor</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedBatch.instructor}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdLocationOn className="h-5 w-5" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedBatch.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdCalendarToday className="h-5 w-5" />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedBatch.startDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdCalendarToday className="h-5 w-5" />
                    <span className="text-sm font-medium">End Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedBatch.endDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MdSchedule className="h-5 w-5" />
                    <span className="text-sm font-medium">Schedule</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{selectedBatch.schedule}</p>
                  <p className="text-sm text-gray-600 mt-1">Duration: {selectedBatch.duration}</p>
                </div>
              </div>

              {/* Student Statistics */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdPeople className="h-5 w-5 text-tracked-primary" />
                  Student Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedBatch.enrolledStudents}</p>
                    <p className="text-xs text-gray-600 mt-1">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedBatch.activeStudents}</p>
                    <p className="text-xs text-gray-600 mt-1">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">{selectedBatch.completedStudents}</p>
                    <p className="text-xs text-gray-600 mt-1">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedBatch.droppedStudents}</p>
                    <p className="text-xs text-gray-600 mt-1">Dropped</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Capacity</span>
                    <span className="text-sm font-bold text-gray-800">
                      {selectedBatch.enrolledStudents}/{selectedBatch.maxStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (selectedBatch.enrolledStudents / selectedBatch.maxStudents) >= 1 
                          ? 'bg-red-600' 
                          : (selectedBatch.enrolledStudents / selectedBatch.maxStudents) >= 0.8 
                            ? 'bg-yellow-600' 
                            : 'bg-green-600'
                      }`}
                      style={{ width: `${(selectedBatch.enrolledStudents / selectedBatch.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress */}
              {selectedBatch.status === 'active' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdTrendingUp className="h-5 w-5 text-tracked-primary" />
                    Training Progress
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-lg font-bold text-tracked-primary">{selectedBatch.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-tracked-primary h-4 rounded-full transition-all duration-300"
                      style={{ width: `${selectedBatch.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Students List Preview */}
              {selectedBatch.students.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MdGroup className="h-5 w-5 text-tracked-primary" />
                      Students ({selectedBatch.students.length})
                    </h3>
                    <button className="text-sm text-tracked-primary hover:text-tracked-secondary font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedBatch.students.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-tracked-primary rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">Attendance: {student.attendance}%</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : student.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Batch
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPersonAdd className="h-5 w-5" />
                  Add Students
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print List
                </button>
                <button 
                  onClick={() => setSelectedBatch(null)}
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

export default StaffBatchManagement;
