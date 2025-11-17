import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import StudentDetailModal from '../../components/staff/StudentDetailModal';
import EditEnrollmentModal from '../../components/staff/EditEnrollmentModal';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
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
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    fetchEnrollments();
    fetchPrograms();
    fetchBatches();
  }, []);

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          log_level: logLevel,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log system action');
      }
    } catch (error) {
      console.error('Error logging system action:', error);
    }
  };

  // Transform enrollment data to match StudentDetailModal props
  const transformEnrollmentForModal = (enrollment) => {
    return {
      firstName: enrollment.first_name || enrollment.student_name.split(' ')[0] || '',
      middleName: enrollment.middle_name || '',
      lastName: enrollment.last_name || enrollment.student_name.split(' ').pop() || '',
      studentId: enrollment.student_id,
      email: enrollment.email,
      phone: enrollment.phone || 'N/A',
      dateOfBirth: enrollment.date_of_birth || 'N/A',
      gender: enrollment.gender || 'N/A',
      address: enrollment.address || 'N/A',
      emergencyContact: enrollment.emergency_contact || {
        name: 'N/A',
        relationship: 'N/A',
        phone: 'N/A'
      },
      program: enrollment.program,
      batch: enrollment.batch,
      enrollmentStatus: enrollment.status,
      paymentStatus: enrollment.payment_status,
      enrollmentDate: enrollment.enrollment_date,
      expectedGraduation: enrollment.expected_end_date,
      enrollmentId: enrollment.enrollment_id,
      startDate: enrollment.start_date,
      attendance: enrollment.attendance || 0,
      overallGrade: 0, // Not available in enrollment data
      documents: enrollment.documents || {} // Include documents from backend
    };
  };

  // Handle view enrollment details
  const handleViewEnrollment = (enrollment) => {
    setSelectedStudent(transformEnrollmentForModal(enrollment));
    setShowDetailModal(true);
  };

  // Handle edit enrollment
  const handleEditEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowEditModal(true);
  };

  // Handle update enrollment success
  const handleUpdateSuccess = () => {
    fetchEnrollments(); // Refresh the list
    setShowEditModal(false);
    setSelectedEnrollment(null);
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      const response = await fetch('http://localhost:8000/api/staff/enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        toast.error('Failed to fetch enrollment records');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Error loading enrollment records');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Active'
      },
      inactive: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Inactive'
      },
      completed: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdSchool className="h-4 w-4" />,
        label: 'Completed'
      },
      dropped: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Dropped'
      }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    // Normalize payment status to lowercase for consistent comparison
    const normalizedStatus = paymentStatus ? paymentStatus.toLowerCase() : 'paid';
    
    // Show "Voucher" if student has voucher, otherwise "Paid"
    const paymentConfig = {
      voucher: {
        className: 'bg-blue-100 text-blue-800',
        label: 'Voucher'
      },
      // All other statuses (paid, unpaid, partial, pending) show as "Paid"
      paid: {
        className: 'bg-green-100 text-green-800',
        label: 'Paid'
      },
      partial: {
        className: 'bg-green-100 text-green-800',
        label: 'Paid'
      },
      unpaid: {
        className: 'bg-green-100 text-green-800',
        label: 'Paid'
      },
      pending: {
        className: 'bg-green-100 text-green-800',
        label: 'Paid'
      }
    };

    const config = paymentConfig[normalizedStatus] || paymentConfig.paid;

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

  // Export to Excel function
  const handleExportToExcel = async () => {
    const loadingToast = toast.loading('Generating Excel file...');

    try {
      // Get staff user info for logging
      const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
      const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

      // Prepare data for export
      const exportData = filteredEnrollments.map((enrollment, index) => ({
        'No.': index + 1,
        'Enrollment ID': enrollment.enrollment_id || 'N/A',
        'Student ID': enrollment.student_id || 'N/A',
        'Student Name': enrollment.student_name || 'N/A',
        'Email': enrollment.email || 'N/A',
        'Phone': enrollment.phone || 'N/A',
        'Program': enrollment.program || 'N/A',
        'Batch': enrollment.batch || 'N/A',
        'Enrollment Date': enrollment.enrollment_date || 'N/A',
        'Start Date': enrollment.start_date || 'TBA',
        'Expected End Date': enrollment.expected_end_date || 'TBA',
        'Enrollment Status': enrollment.status ? enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1) : 'N/A',
        'Payment Status': enrollment.payment_status ? enrollment.payment_status.charAt(0).toUpperCase() + enrollment.payment_status.slice(1) : 'N/A',
        'Attendance': enrollment.attendance ? `${enrollment.attendance}%` : '0%',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },  // No.
        { wch: 15 }, // Enrollment ID
        { wch: 15 }, // Student ID
        { wch: 25 }, // Student Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Program
        { wch: 20 }, // Batch
        { wch: 15 }, // Enrollment Date
        { wch: 15 }, // Start Date
        { wch: 15 }, // Expected End Date
        { wch: 15 }, // Enrollment Status
        { wch: 15 }, // Payment Status
        { wch: 12 }, // Attendance
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollments');

      // Generate filename with current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Enrollments_Export_${dateStr}_${timeStr}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      // Log the export action
      await logSystemAction(
        'enrollments_exported',
        `${staffName} exported ${filteredEnrollments.length} enrollment record(s) to Excel (${filename})`,
        'info'
      );

      toast.success(`Successfully exported ${filteredEnrollments.length} enrollment record(s) to Excel!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel', {
        id: loadingToast,
      });
    }
  };

  const filteredEnrollments = enrollments
    .filter(enrollment => {
      const matchesSearch = enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.enrollment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      const matchesProgram = programFilter === 'all' || enrollment.program === programFilter;
      const matchesBatch = batchFilter === 'all' || enrollment.batch === batchFilter;
      return matchesSearch && matchesStatus && matchesProgram && matchesBatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.enrollment_date) - new Date(a.enrollment_date);
      } else if (sortBy === 'oldest') {
        return new Date(a.enrollment_date) - new Date(b.enrollment_date);
      } else if (sortBy === 'name') {
        return a.student_name?.localeCompare(b.student_name);
      }
      return 0;
    });

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    inactive: enrollments.filter(e => e.status === 'inactive').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    dropped: enrollments.filter(e => e.status === 'dropped').length
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
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Enrollments</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
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
                  <option value="inactive">Inactive</option>
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
                    <option key={program.id} value={program.title}>{program.title}</option>
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
                    <option key={batch.id} value={batch.batch_id}>{batch.batch_id}</option>
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
              
              <button 
                onClick={fetchEnrollments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
              >
                <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={handleExportToExcel}
                disabled={filteredEnrollments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDownload className="h-5 w-5" />
                Export
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
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tracked-primary"></div>
                          <span className="ml-2 text-gray-600">Loading enrollment records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-tracked-primary">{enrollment.enrollment_id}</div>
                          <div className="text-xs text-gray-500">{enrollment.student_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{enrollment.student_name}</div>
                          <div className="text-xs text-gray-500">{enrollment.email}</div>
                          <div className="text-xs text-gray-500">{enrollment.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{enrollment.program}</div>
                          <div className="text-xs text-gray-500">{enrollment.batch}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-900">
                            <div>
                              <span>Start: {enrollment.start_date || 'TBA'}</span>
                            </div>
                            <div className="mt-1">
                              <span>End: {enrollment.expected_end_date || 'TBA'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(enrollment.payment_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(enrollment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewEnrollment(enrollment)}
                              className="text-tracked-primary hover:text-tracked-secondary transition-colors"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditEnrollment(enrollment)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
          getStatusBadge={getStatusBadge}
          getPaymentBadge={getPaymentBadge}
        />
      )}

      {/* Edit Enrollment Modal */}
      {showEditModal && selectedEnrollment && (
        <EditEnrollmentModal
          isOpen={showEditModal}
          enrollment={selectedEnrollment}
          programs={programs}
          batches={batches}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEnrollment(null);
          }}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default StaffEnrollmentsRecord;
