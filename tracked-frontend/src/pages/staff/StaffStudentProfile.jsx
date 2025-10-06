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
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdDescription,
  MdAssignment,
  MdPayment,
  MdPrint
} from 'react-icons/md';

const StaffStudentProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data - replace with actual API calls
  const [students, setStudents] = useState([
    {
      id: 1,
      studentId: 'STU-2025-001',
      firstName: 'Juan',
      middleName: 'Santos',
      lastName: 'Dela Cruz',
      email: 'juan.delacruz@email.com',
      phone: '09171234567',
      dateOfBirth: '2000-05-15',
      gender: 'Male',
      address: '123 Main St, Manila, Philippines',
      enrollmentStatus: 'active',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-09-15',
      expectedGraduation: '2025-12-15',
      attendance: 95,
      overallGrade: 92,
      paymentStatus: 'paid',
      documents: ['Birth Certificate', 'Valid ID', '2x2 Photo', 'Medical Certificate'],
      emergencyContact: {
        name: 'Maria Dela Cruz',
        relationship: 'Mother',
        phone: '09181234567'
      }
    },
    {
      id: 2,
      studentId: 'STU-2025-002',
      firstName: 'Maria',
      middleName: 'Garcia',
      lastName: 'Santos',
      email: 'maria.santos@email.com',
      phone: '09181234567',
      dateOfBirth: '1999-08-20',
      gender: 'Female',
      address: '456 Oak Ave, Quezon City, Philippines',
      enrollmentStatus: 'active',
      program: 'Automotive Servicing NCII',
      batch: 'Batch 02-2025',
      enrollmentDate: '2025-09-20',
      expectedGraduation: '2025-12-20',
      attendance: 88,
      overallGrade: 89,
      paymentStatus: 'partial',
      documents: ['Birth Certificate', 'Valid ID', '2x2 Photo'],
      emergencyContact: {
        name: 'Roberto Santos',
        relationship: 'Father',
        phone: '09191234567'
      }
    },
    {
      id: 3,
      studentId: 'STU-2025-003',
      firstName: 'Pedro',
      middleName: 'Lopez',
      lastName: 'Reyes',
      email: 'pedro.reyes@email.com',
      phone: '09191234567',
      dateOfBirth: '2001-03-10',
      gender: 'Male',
      address: '789 Pine Rd, Pasig City, Philippines',
      enrollmentStatus: 'completed',
      program: 'Electronics NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-10',
      expectedGraduation: '2025-11-30',
      attendance: 98,
      overallGrade: 95,
      paymentStatus: 'paid',
      documents: ['Birth Certificate', 'Valid ID', '2x2 Photo', 'Diploma'],
      emergencyContact: {
        name: 'Ana Reyes',
        relationship: 'Sister',
        phone: '09201234567'
      }
    },
    {
      id: 4,
      studentId: 'STU-2025-004',
      firstName: 'Ana',
      middleName: 'Cruz',
      lastName: 'Garcia',
      email: 'ana.garcia@email.com',
      phone: '09201234567',
      dateOfBirth: '2000-11-25',
      gender: 'Female',
      address: '321 Elm St, Makati City, Philippines',
      enrollmentStatus: 'pending',
      program: 'Food Processing NCII',
      batch: 'Batch 03-2025',
      enrollmentDate: '2025-09-25',
      expectedGraduation: '2025-12-25',
      attendance: 0,
      overallGrade: 0,
      paymentStatus: 'unpaid',
      documents: ['Birth Certificate', 'Valid ID'],
      emergencyContact: {
        name: 'Carmen Garcia',
        relationship: 'Mother',
        phone: '09211234567'
      }
    },
    {
      id: 5,
      studentId: 'STU-2025-005',
      firstName: 'Roberto',
      middleName: 'Mendoza',
      lastName: 'Cruz',
      email: 'roberto.cruz@email.com',
      phone: '09211234567',
      dateOfBirth: '1998-07-08',
      gender: 'Male',
      address: '654 Maple Dr, Taguig City, Philippines',
      enrollmentStatus: 'dropped',
      program: 'Welding NCII',
      batch: 'Batch 01-2025',
      enrollmentDate: '2025-08-15',
      expectedGraduation: '2025-11-15',
      attendance: 45,
      overallGrade: 55,
      paymentStatus: 'partial',
      documents: ['Birth Certificate', 'Valid ID', '2x2 Photo'],
      emergencyContact: {
        name: 'Elena Cruz',
        relationship: 'Wife',
        phone: '09221234567'
      }
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
      pending: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Pending'
      },
      completed: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdSchool className="h-4 w-4" />,
        label: 'Completed'
      },
      dropped: {
        className: 'bg-red-100 text-red-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Dropped'
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
      paid: { className: 'bg-green-100 text-green-800', label: 'Paid' },
      partial: { className: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      unpaid: { className: 'bg-red-100 text-red-800', label: 'Unpaid' }
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.unpaid;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredStudents = students
    .filter(student => {
      const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.enrollmentStatus === statusFilter;
      const matchesProgram = programFilter === 'all' || student.program === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.lastName.localeCompare(b.lastName);
      } else if (sortBy === 'newest') {
        return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
      } else if (sortBy === 'studentId') {
        return a.studentId.localeCompare(b.studentId);
      }
      return 0;
    });

  const stats = {
    total: students.length,
    active: students.filter(s => s.enrollmentStatus === 'active').length,
    pending: students.filter(s => s.enrollmentStatus === 'pending').length,
    completed: students.filter(s => s.enrollmentStatus === 'completed').length,
    dropped: students.filter(s => s.enrollmentStatus === 'dropped').length
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
                <h1 className="text-xl font-bold">Student Profiles</h1>
                <p className="text-sm text-blue-100">View and manage student information</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
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
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Dropped</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.dropped}</p>
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
                    placeholder="Search by name or ID..."
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
                  <option value="dropped">Dropped</option>
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

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="studentId">Student ID</option>
                  <option value="newest">Newest First</option>
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

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="bg-tracked-primary p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                          <MdPerson className="h-10 w-10 text-tracked-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-blue-100">{student.studentId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Status & Payment */}
                      <div className="flex items-center justify-between">
                        {getStatusBadge(student.enrollmentStatus)}
                        {getPaymentBadge(student.paymentStatus)}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MdEmail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MdPhone className="h-4 w-4 text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
                      </div>

                      {/* Program Info */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <MdSchool className="h-4 w-4 text-tracked-primary" />
                          <span className="font-medium text-gray-800">{student.program}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">
                          {student.batch}
                        </div>
                      </div>

                      {/* Performance */}
                      {student.enrollmentStatus !== 'pending' && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Attendance</p>
                            <p className="text-lg font-bold text-tracked-primary">{student.attendance}%</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Grade</p>
                            <p className="text-lg font-bold text-tracked-secondary">{student.overallGrade}%</p>
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MdDescription className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {student.documents.length} document{student.documents.length !== 1 ? 's' : ''} submitted
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors text-sm"
                      >
                        <MdVisibility className="h-4 w-4" />
                        View Full Profile
                      </button>
                      <button
                        className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
                No students found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                    <MdPerson className="h-12 w-12 text-tracked-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                    </h2>
                    <p className="text-blue-100">{selectedStudent.studentId}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedStudent.enrollmentStatus)}
                      {getPaymentBadge(selectedStudent.paymentStatus)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdPerson className="h-5 w-5 text-tracked-primary" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-800">
                        {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-800">{selectedStudent.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium text-gray-800">{selectedStudent.gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">{selectedStudent.address}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdPhone className="h-5 w-5 text-tracked-primary" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Contact Name</p>
                      <p className="font-medium text-gray-800">{selectedStudent.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Relationship</p>
                      <p className="font-medium text-gray-800">{selectedStudent.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-800">{selectedStudent.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdSchool className="h-5 w-5 text-tracked-primary" />
                    Enrollment Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Program</p>
                      <p className="font-medium text-gray-800">{selectedStudent.program}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Batch</p>
                      <p className="font-medium text-gray-800">{selectedStudent.batch}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enrollment Date</p>
                      <p className="font-medium text-gray-800">{selectedStudent.enrollmentDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expected Graduation</p>
                      <p className="font-medium text-gray-800">{selectedStudent.expectedGraduation}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdAssignment className="h-5 w-5 text-tracked-primary" />
                    Academic Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Attendance Rate</span>
                      <span className="text-2xl font-bold text-tracked-primary">{selectedStudent.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-tracked-primary h-2 rounded-full" 
                        style={{ width: `${selectedStudent.attendance}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-600">Overall Grade</span>
                      <span className="text-2xl font-bold text-tracked-secondary">{selectedStudent.overallGrade}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-tracked-secondary h-2 rounded-full" 
                        style={{ width: `${selectedStudent.overallGrade}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdDescription className="h-5 w-5 text-tracked-primary" />
                    Submitted Documents
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedStudent.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                        <MdCheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdPayment className="h-5 w-5" />
                  Payment History
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
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

export default StaffStudentProfile;
