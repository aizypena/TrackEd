import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  MdMenu,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdDownload,
  MdRefresh,
  MdSort,
  MdAdd
} from 'react-icons/md';

const StaffApplications = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
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

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        
        // Extract unique programs for filter
        const uniquePrograms = [...new Set(data.applications.map(app => app.course_program_formatted).filter(Boolean))];
        setAllPrograms(uniquePrograms);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Capitalize name helper
  const capitalizeName = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Export to Excel function
  const handleExportToExcel = async () => {
    const loadingToast = toast.loading('Generating Excel file...');

    try {
      // Get staff user info for logging
      const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
      const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

      // Prepare data for export
      const exportData = filteredApplications.map((app, index) => ({
        'No.': index + 1,
        'Application ID': `APP-${app.id}`,
        'First Name': capitalizeName(app.first_name),
        'Middle Name': capitalizeName(app.middle_name) || '',
        'Last Name': capitalizeName(app.last_name),
        'Email': app.email,
        'Phone Number': app.phone_number || 'N/A',
        'Address': app.address || 'N/A',
        'Date of Birth': app.date_of_birth ? formatDate(app.date_of_birth) : 'N/A',
        'Gender': app.gender || 'N/A',
        'Program Applied': app.course_program_formatted || app.course_program || 'Not specified',
        'Application Status': app.application_status ? app.application_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A',
        'Date Applied': formatDate(app.created_at),
        'Valid ID': app.valid_id_path ? 'Submitted' : 'Not Submitted',
        'Transcript': app.transcript_path ? 'Submitted' : 'Not Submitted',
        'Diploma': app.diploma_path ? 'Submitted' : 'Not Submitted',
        'Passport Photo': app.passport_photo_path ? 'Submitted' : 'Not Submitted',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },  // No.
        { wch: 15 }, // Application ID
        { wch: 15 }, // First Name
        { wch: 15 }, // Middle Name
        { wch: 15 }, // Last Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone Number
        { wch: 30 }, // Address
        { wch: 15 }, // Date of Birth
        { wch: 10 }, // Gender
        { wch: 30 }, // Program Applied
        { wch: 15 }, // Application Status
        { wch: 15 }, // Date Applied
        { wch: 15 }, // Valid ID
        { wch: 15 }, // Transcript
        { wch: 15 }, // Diploma
        { wch: 15 }, // Passport Photo
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

      // Generate filename with current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Applications_Export_${dateStr}_${timeStr}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      // Log the export action
      await logSystemAction(
        'applications_exported',
        `${staffName} exported ${filteredApplications.length} application(s) to Excel (${filename})`,
        'info'
      );

      toast.success(`Successfully exported ${filteredApplications.length} application(s) to Excel!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel', {
        id: loadingToast,
      });
    }
  };

  const programs = allPrograms;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdPendingActions className="h-4 w-4" />,
        label: 'Pending'
      },
      under_review: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdFilterList className="h-4 w-4" />,
        label: 'Under Review'
      },
      approved: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Approved'
      },
      rejected: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Rejected'
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

  const filteredApplications = applications
    .filter(app => {
      const fullName = `${app.first_name} ${app.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (app.id && app.id.toString().includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || app.application_status === statusFilter;
      const matchesProgram = programFilter === 'all' || app.course_program_formatted === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`;
        const nameB = `${b.first_name} ${b.last_name}`;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.application_status === 'pending').length,
    underReview: applications.filter(app => app.application_status === 'under_review').length,
    approved: applications.filter(app => app.application_status === 'approved').length,
    rejected: applications.filter(app => app.application_status === 'rejected').length
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Applications</h1>
                <p className="text-sm text-blue-100">Review and manage student applications</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/staff/applications/add')}
              className="flex items-center gap-2 hover:cursor-pointer px-4 py-2 bg-white text-tracked-primary rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <MdAdd className="h-5 w-5" />
              Add Applicant
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Under Review</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
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
                    placeholder="Search by name, or email..."
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
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={fetchApplications}
                className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
              >
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button 
                onClick={handleExportToExcel}
                disabled={filteredApplications.length === 0}
                className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDownload className="h-5 w-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
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
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {capitalizeName(app.first_name)} {capitalizeName(app.last_name)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{app.email}</div>
                          <div className="text-sm text-gray-500">{app.phone_number || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {app.course_program_formatted || app.course_program || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(app.created_at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {[app.valid_id_path, app.transcript_path, app.diploma_path, app.passport_photo_path].filter(Boolean).length} document(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(app.application_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              to={`/staff/enrollments/applications/${app.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No applications found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}

            {/* Pagination */}
            {!loading && filteredApplications.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredApplications.length}</span> of{' '}
                  <span className="font-medium">{applications.length}</span> applications
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
    </div>
  );
};

export default StaffApplications;
