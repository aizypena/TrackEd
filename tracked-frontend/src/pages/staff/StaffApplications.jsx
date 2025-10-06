import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
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
  MdSort
} from 'react-icons/md';

const StaffApplications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - replace with actual API calls
  const [applications, setApplications] = useState([
    {
      id: 1,
      applicationNumber: 'APP-2025-001',
      applicantName: 'Juan Dela Cruz',
      email: 'juan.delacruz@email.com',
      phone: '09171234567',
      program: 'Welding NCII',
      dateApplied: '2025-10-06',
      status: 'pending',
      documents: ['Birth Certificate', 'ID', 'Photo']
    },
    {
      id: 2,
      applicationNumber: 'APP-2025-002',
      applicantName: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '09181234567',
      program: 'Automotive Servicing NCII',
      dateApplied: '2025-10-05',
      status: 'under_review',
      documents: ['Birth Certificate', 'ID', 'Photo', 'Diploma']
    },
    {
      id: 3,
      applicationNumber: 'APP-2025-003',
      applicantName: 'Pedro Reyes',
      email: 'pedro.reyes@email.com',
      phone: '09191234567',
      program: 'Electronics NCII',
      dateApplied: '2025-10-05',
      status: 'approved',
      documents: ['Birth Certificate', 'ID', 'Photo']
    },
    {
      id: 4,
      applicationNumber: 'APP-2025-004',
      applicantName: 'Ana Garcia',
      email: 'ana.garcia@email.com',
      phone: '09201234567',
      program: 'Food Processing NCII',
      dateApplied: '2025-10-04',
      status: 'pending',
      documents: ['Birth Certificate', 'ID']
    },
    {
      id: 5,
      applicationNumber: 'APP-2025-005',
      applicantName: 'Roberto Cruz',
      email: 'roberto.cruz@email.com',
      phone: '09211234567',
      program: 'Welding NCII',
      dateApplied: '2025-10-04',
      status: 'rejected',
      documents: ['Birth Certificate', 'ID', 'Photo']
    },
    {
      id: 6,
      applicationNumber: 'APP-2025-006',
      applicantName: 'Carmen Lopez',
      email: 'carmen.lopez@email.com',
      phone: '09221234567',
      program: 'Automotive Servicing NCII',
      dateApplied: '2025-10-03',
      status: 'under_review',
      documents: ['Birth Certificate', 'ID', 'Photo', 'Medical Certificate']
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
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesProgram = programFilter === 'all' || app.program === programFilter;
      return matchesSearch && matchesStatus && matchesProgram;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateApplied) - new Date(a.dateApplied);
      } else if (sortBy === 'oldest') {
        return new Date(a.dateApplied) - new Date(b.dateApplied);
      } else if (sortBy === 'name') {
        return a.applicantName.localeCompare(b.applicantName);
      }
      return 0;
    });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    underReview: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
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
                <h1 className="text-xl font-bold">Applications</h1>
                <p className="text-sm text-blue-100">Review and manage student applications</p>
              </div>
            </div>
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
                    placeholder="Search by name, email, or ID..."
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
              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <MdDownload className="h-5 w-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
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
                          <div className="text-sm font-medium text-tracked-primary">{app.applicationNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.applicantName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{app.email}</div>
                          <div className="text-sm text-gray-500">{app.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{app.program}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.dateApplied}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {app.documents.length} document{app.documents.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              className="text-tracked-primary hover:text-tracked-secondary"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-700"
                                  title="Approve"
                                >
                                  <MdCheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-700"
                                  title="Reject"
                                >
                                  <MdCancel className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        No applications found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredApplications.length > 0 && (
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
    </div>
  );
};

export default StaffApplications;
