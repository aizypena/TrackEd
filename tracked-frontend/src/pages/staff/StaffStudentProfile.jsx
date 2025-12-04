import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import StudentDetailModal from '../../components/staff/StudentDetailModal';
import EditStudentModal from '../../components/staff/EditStudentModal';
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
  MdPrint,
  MdClose
} from 'react-icons/md';

const StaffStudentProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPrograms, setAllPrograms] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
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

  const fetchPrograms = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/programs?per_page=all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Programs API response:', data); // Debug log
        // Handle different response structures
        const programsList = data.programs || data.data || data || [];
        console.log('Programs list:', programsList); // Debug log
        setAllPrograms(programsList);
      } else {
        console.error('Failed to fetch programs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      // Fetch both students and payment records
      const [studentsResponse, paymentsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/users?role=student&per_page=all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/payments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ]);

      if (studentsResponse.ok && paymentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        const paymentsData = await paymentsResponse.json();
        
        // Create a map of user payments for quick lookup
        const userPaymentMap = {};
        paymentsData.payments.forEach(payment => {
          const userId = payment.user_id;
          const hasVoucher = payment.user?.voucher_id && payment.user?.voucher;
          
          // Use the payment_status from the database
          let status = payment.payment_status;
          
          // Override with 'voucher' if user has a voucher
          if (hasVoucher) {
            status = 'voucher';
          }
          
          // Store the most recent or most relevant payment status
          if (!userPaymentMap[userId]) {
            userPaymentMap[userId] = {
              status: status,
              totalFee: parseFloat(payment.amount || 0),
              amountPaid: parseFloat(payment.amount_paid || 0)
            };
          } else {
            // If there are multiple payments, aggregate the amounts
            userPaymentMap[userId].totalFee += parseFloat(payment.amount || 0);
            userPaymentMap[userId].amountPaid += parseFloat(payment.amount_paid || 0);
            
            // Update status based on priority: voucher > paid > partial > unpaid
            if (status === 'voucher' || hasVoucher) {
              userPaymentMap[userId].status = 'voucher';
            } else if (status === 'paid' && userPaymentMap[userId].status !== 'voucher') {
              userPaymentMap[userId].status = 'paid';
            } else if (status === 'partial' && !['voucher', 'paid'].includes(userPaymentMap[userId].status)) {
              userPaymentMap[userId].status = 'partial';
            }
          }
        });
        
        // Transform the data to match our component structure
        const transformedStudents = studentsData.users.map(user => {
          // Check if user has a voucher
          const hasVoucher = user.voucher_id && user.voucher;
          
          // Get payment info from the map
          const paymentInfo = userPaymentMap[user.id];
          
          // Determine payment status
          let paymentStatus = 'unpaid';
          if (hasVoucher) {
            paymentStatus = 'voucher';
          } else if (paymentInfo) {
            paymentStatus = paymentInfo.status;
          }
          
          return {
            id: user.id,
            studentId: user.student_id || 'N/A',
            firstName: user.first_name,
            middleName: user.middle_name || '',
            lastName: user.last_name,
            email: user.email,
            phone: user.phone_number,
            dateOfBirth: user.date_of_birth ? user.date_of_birth.split('T')[0] : 'N/A',
            gender: user.gender,
            address: user.address,
            enrollmentStatus: user.status,
            program: user.program?.title || 'N/A',
            batch: user.batch_id || 'N/A',
            enrollmentDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A',
            expectedGraduation: user.batch?.end_date ? new Date(user.batch.end_date).toISOString().split('T')[0] : 'N/A',
            attendance: 0, // TODO: Calculate from actual attendance data
            overallGrade: 0, // TODO: Calculate from actual grades
            paymentStatus: paymentStatus,
            documents: [], // TODO: Get actual documents
            emergencyContact: {
              name: user.emergency_contact || 'N/A',
              relationship: user.emergency_relationship || 'N/A',
              phone: user.emergency_phone || 'N/A'
            }
          };
        });

        setStudents(transformedStudents);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel function
  const handleExportToExcel = async () => {
    const loadingToast = toast.loading('Generating Excel file...');

    try {
      // Get staff user info for logging
      const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
      const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

      // Prepare data for export
      const exportData = filteredStudents.map((student, index) => ({
        'No.': index + 1,
        'Student ID': student.studentId || 'N/A',
        'First Name': student.firstName || 'N/A',
        'Middle Name': student.middleName || '',
        'Last Name': student.lastName || 'N/A',
        'Email': student.email || 'N/A',
        'Phone': student.phone || 'N/A',
        'Date of Birth': student.dateOfBirth || 'N/A',
        'Gender': student.gender || 'N/A',
        'Address': student.address || 'N/A',
        'Program': student.program || 'N/A',
        'Batch': student.batch || 'N/A',
        'Enrollment Date': student.enrollmentDate || 'N/A',
        'Expected Graduation': student.expectedGraduation || 'N/A',
        'Enrollment Status': student.enrollmentStatus ? student.enrollmentStatus.charAt(0).toUpperCase() + student.enrollmentStatus.slice(1) : 'N/A',
        'Payment Status': student.paymentStatus ? student.paymentStatus.charAt(0).toUpperCase() + student.paymentStatus.slice(1) : 'N/A',
        'Emergency Contact Name': student.emergencyContact?.name || 'N/A',
        'Emergency Contact Relationship': student.emergencyContact?.relationship || 'N/A',
        'Emergency Contact Phone': student.emergencyContact?.phone || 'N/A',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },  // No.
        { wch: 15 }, // Student ID
        { wch: 15 }, // First Name
        { wch: 15 }, // Middle Name
        { wch: 15 }, // Last Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // Date of Birth
        { wch: 10 }, // Gender
        { wch: 35 }, // Address
        { wch: 30 }, // Program
        { wch: 15 }, // Batch
        { wch: 15 }, // Enrollment Date
        { wch: 18 }, // Expected Graduation
        { wch: 18 }, // Enrollment Status
        { wch: 15 }, // Payment Status
        { wch: 25 }, // Emergency Contact Name
        { wch: 25 }, // Emergency Contact Relationship
        { wch: 20 }, // Emergency Contact Phone
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      // Generate filename with current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Students_Export_${dateStr}_${timeStr}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      // Log the export action
      await logSystemAction(
        'students_exported',
        `${staffName} exported ${filteredStudents.length} student profile(s) to Excel (${filename})`,
        'info'
      );

      toast.success(`Successfully exported ${filteredStudents.length} student profile(s) to Excel!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel', {
        id: loadingToast,
      });
    }
  };

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
      voucher: { className: 'bg-purple-100 text-purple-800', label: 'Voucher' },
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
                  {allPrograms.map((program) => (
                    <option key={program.id} value={program.title}>{program.title}</option>
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
              <button 
                onClick={fetchStudents}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors disabled:opacity-50"
              >
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button 
                onClick={handleExportToExcel}
                disabled={filteredStudents.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDownload className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>

          {/* Students List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
              <span className="ml-3 text-gray-600">Loading students...</span>
            </div>
          ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredStudents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-tracked-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <MdPerson className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.program}</div>
                        <div className="text-sm text-gray-500">{student.batch}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.enrollmentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-tracked-primary hover:text-tracked-secondary mr-3"
                          title="View Details"
                        >
                          <MdVisibility className="h-5 w-5 inline" />
                        </button>
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Student"
                        >
                          <MdEdit className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
                No students found matching your filters.
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        getStatusBadge={getStatusBadge}
        getPaymentBadge={getPaymentBadge}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={() => {
          fetchStudents();
          setEditingStudent(null);
        }}
      />

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
    </div>
  );
};

export default StaffStudentProfile;
