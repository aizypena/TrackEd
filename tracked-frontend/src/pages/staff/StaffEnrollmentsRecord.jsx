import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdVisibility,
  MdEdit,
  MdDownload,
  MdRefresh,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdSchool,
  MdCalendarToday,
  MdPrint,
  MdPersonAdd
} from 'react-icons/md';

const StaffEnrollmentsRecord = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - replace with actual API calls
  const [enrollments, setEnrollments] = useState([
    {
      id: 1,
      enrollmentId: 'ENR-2025-001',
      studentName: 'Juan Dela Cruz',
      studentId: 'STU-2025-001',
      email: 'juan.delacruz@email.com',
      phone: '09171234567',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-09-15',
      startDate: '2025-10-01',
      expectedEndDate: '2025-12-15',
      status: 'active',
      paymentStatus: 'paid',
      attendance: 95
    },
    {
      id: 2,
      enrollmentId: 'ENR-2025-002',
      studentName: 'Maria Santos',
      studentId: 'STU-2025-002',
      email: 'maria.santos@email.com',
      phone: '09181234567',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      enrollmentDate: '2025-09-20',
      startDate: '2025-10-05',
      expectedEndDate: '2025-12-20',
      status: 'active',
      paymentStatus: 'partial',
      attendance: 88
    },
    {
      id: 3,
      enrollmentId: 'ENR-2025-003',
      studentName: 'Pedro Reyes',
      studentId: 'STU-2025-003',
      email: 'pedro.reyes@email.com',
      phone: '09191234567',
      program: 'Electronics NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-10',
      startDate: '2025-09-01',
      expectedEndDate: '2025-11-30',
      status: 'completed',
      paymentStatus: 'paid',
      attendance: 98
    },
    {
      id: 4,
      enrollmentId: 'ENR-2025-004',
      studentName: 'Ana Garcia',
      studentId: 'STU-2025-004',
      email: 'ana.garcia@email.com',
      phone: '09201234567',
      program: 'Food Processing NCII',
      batch: 'Batch 03-2025',
      enrollmentDate: '2025-09-25',
      startDate: '2025-10-10',
      expectedEndDate: '2025-12-25',
      status: 'pending',
      paymentStatus: 'unpaid',
      attendance: 0
    },
    {
      id: 5,
      enrollmentId: 'ENR-2025-005',
      studentName: 'Roberto Cruz',
      studentId: 'STU-2025-005',
      email: 'roberto.cruz@email.com',
      phone: '09211234567',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-15',
      startDate: '2025-09-01',
      expectedEndDate: '2025-11-15',
      status: 'dropped',
      paymentStatus: 'partial',
      attendance: 45
    },
    {
      id: 6,
      enrollmentId: 'ENR-2025-006',
      studentName: 'Carmen Lopez',
      studentId: 'STU-2025-006',
      email: 'carmen.lopez@email.com',
      phone: '09221234567',
      program: 'Plumbing NCII',
      batch: 'Batch 02-2025',
      enrollmentDate: '2025-09-18',
      startDate: '2025-10-03',
      expectedEndDate: '2025-12-18',
      status: 'active',
      paymentStatus: 'paid',
      attendance: 92
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

  const batches = [
    'Batch 01-2025',
    'Batch 02-2025',
    'Batch 03-2025',
    'Batch 04-2025'
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Active'
      },
      pending: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Pending'
      },
      completed: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdSchool className="h-4 w-4" />,
        label: 'Completed'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentConfig = {
      paid: {
        className: 'bg-green-100 text-green-800',
        label: 'Paid'
      },
      partial: {
        className: 'bg-yellow-100 text-yellow-800',
        label: 'Partial'
      },
      unpaid: {
        className: 'bg-red-100 text-red-800',
        label: 'Unpaid'
      }
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.unpaid;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEnrollments = enrollments
    .filter(enrollment => {
      const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      const matchesProgram = programFilter === 'all' || enrollment.program === programFilter;
      const matchesBatch = batchFilter === 'all' || enrollment.batch === batchFilter;
      return matchesSearch && matchesStatus && matchesProgram && matchesBatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.enrollmentDate) - new Date(b.enrollmentDate);
      } else if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      }
      return 0;
    });

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    completed: enrollments.filter(e => e.status === 'completed').length
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
                <h1 className="text-xl font-bold">Enrollment Records</h1>
                <p className="text-sm text-blue-100">Track and manage student enrollments</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdPersonAdd className="h-5 w-5" />
              <span className="hidden sm:inline">New Enrollment</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Enrollments</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name, student ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
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

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort and Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
              
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

          {/* Enrollments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
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
                  {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-tracked-primary">{enrollment.enrollmentId}</div>
                          <div className="text-xs text-gray-500">{enrollment.studentId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{enrollment.studentName}</div>
                          <div className="text-xs text-gray-500">{enrollment.email}</div>
                          <div className="text-xs text-gray-500">{enrollment.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{enrollment.program}</div>
                          <div className="text-xs text-gray-500">{enrollment.batch}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-900">
                            <div className="flex items-center gap-1">
                              <MdCalendarToday className="h-3 w-3 text-gray-400" />
                              <span>Start: {enrollment.startDate}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <MdCalendarToday className="h-3 w-3 text-gray-400" />
                              <span>End: {enrollment.expectedEndDate}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${getAttendanceColor(enrollment.attendance)}`}>
                            {enrollment.attendance}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(enrollment.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-700"
                              title="Print Certificate"
                            >
                              <MdPrint className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No enrollment records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredEnrollments.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredEnrollments.length}</span> of{' '}
                  <span className="font-medium">{enrollments.length}</span> enrollment records
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffEnrollmentsRecord;
