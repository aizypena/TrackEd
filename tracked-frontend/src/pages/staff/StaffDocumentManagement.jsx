import { useState } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { 
  MdMenu,
  MdSearch,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdUpload,
  MdDescription,
  MdWarning,
  MdFolder,
  MdFilterList,
  MdFilePresent,
  MdVerifiedUser
} from 'react-icons/md';

const StaffDocumentManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Mock data - replace with actual API calls
  const [documents, setDocuments] = useState([
    {
      id: 1,
      documentId: 'DOC-2025-001',
      studentName: 'Juan Dela Cruz',
      studentId: 'STU-2025-001',
      documentType: 'Birth Certificate',
      fileName: 'birth_cert_juan.pdf',
      fileSize: '2.5 MB',
      uploadDate: '2025-10-06',
      verifiedBy: null,
      verificationDate: null,
      status: 'pending',
      notes: ''
    },
    {
      id: 2,
      documentId: 'DOC-2025-002',
      studentName: 'Maria Santos',
      studentId: 'STU-2025-002',
      documentType: 'Valid ID',
      fileName: 'national_id_maria.jpg',
      fileSize: '1.8 MB',
      uploadDate: '2025-10-06',
      verifiedBy: 'Staff Admin',
      verificationDate: '2025-10-06',
      status: 'verified',
      notes: 'Valid government ID verified'
    },
    {
      id: 3,
      documentId: 'DOC-2025-003',
      studentName: 'Pedro Reyes',
      studentId: 'STU-2025-003',
      documentType: 'Diploma',
      fileName: 'high_school_diploma.pdf',
      fileSize: '3.2 MB',
      uploadDate: '2025-10-05',
      verifiedBy: 'Staff Admin',
      verificationDate: '2025-10-05',
      status: 'verified',
      notes: ''
    },
    {
      id: 4,
      documentId: 'DOC-2025-004',
      studentName: 'Ana Garcia',
      studentId: 'STU-2025-004',
      documentType: 'Medical Certificate',
      fileName: 'medical_cert_ana.pdf',
      fileSize: '1.5 MB',
      uploadDate: '2025-10-05',
      verifiedBy: 'Staff Admin',
      verificationDate: '2025-10-06',
      status: 'rejected',
      notes: 'Document expired, please upload a valid certificate'
    },
    {
      id: 5,
      documentId: 'DOC-2025-005',
      studentName: 'Roberto Cruz',
      studentId: 'STU-2025-005',
      documentType: '2x2 Photo',
      fileName: 'photo_roberto.jpg',
      fileSize: '0.8 MB',
      uploadDate: '2025-10-04',
      verifiedBy: null,
      verificationDate: null,
      status: 'pending',
      notes: ''
    },
    {
      id: 6,
      documentId: 'DOC-2025-006',
      studentName: 'Carmen Lopez',
      studentId: 'STU-2025-006',
      documentType: 'Birth Certificate',
      fileName: 'psa_birth_cert.pdf',
      fileSize: '2.1 MB',
      uploadDate: '2025-10-04',
      verifiedBy: 'Staff Admin',
      verificationDate: '2025-10-04',
      status: 'verified',
      notes: 'PSA authenticated'
    },
    {
      id: 7,
      documentId: 'DOC-2025-007',
      studentName: 'Juan Dela Cruz',
      studentId: 'STU-2025-001',
      documentType: 'Valid ID',
      fileName: 'drivers_license.jpg',
      fileSize: '1.2 MB',
      uploadDate: '2025-10-03',
      verifiedBy: null,
      verificationDate: null,
      status: 'under_review',
      notes: ''
    },
    {
      id: 8,
      documentId: 'DOC-2025-008',
      studentName: 'Maria Santos',
      studentId: 'STU-2025-002',
      documentType: 'Medical Certificate',
      fileName: 'medical_clearance.pdf',
      fileSize: '1.9 MB',
      uploadDate: '2025-10-03',
      verifiedBy: null,
      verificationDate: null,
      status: 'under_review',
      notes: ''
    }
  ]);

  const documentTypes = [
    'Birth Certificate',
    'Valid ID',
    'Diploma',
    'Medical Certificate',
    '2x2 Photo',
    'Certificate of Completion',
    'Transcript of Records',
    'Barangay Clearance'
  ];

  const students = [...new Set(documents.map(doc => doc.studentName))];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Pending'
      },
      under_review: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdFilterList className="h-4 w-4" />,
        label: 'Under Review'
      },
      verified: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Verified'
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

  const getDocumentIcon = (documentType) => {
    const iconClass = "h-12 w-12";
    if (documentType.includes('Photo')) {
      return <MdFilePresent className={`${iconClass} text-purple-500`} />;
    } else if (documentType.includes('Certificate') || documentType.includes('Diploma')) {
      return <MdVerifiedUser className={`${iconClass} text-blue-500`} />;
    } else if (documentType.includes('ID')) {
      return <MdDescription className={`${iconClass} text-green-500`} />;
    }
    return <MdFolder className={`${iconClass} text-gray-500`} />;
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = documentTypeFilter === 'all' || doc.documentType === documentTypeFilter;
      const matchesStudent = studentFilter === 'all' || doc.studentName === studentFilter;
      return matchesSearch && matchesStatus && matchesType && matchesStudent;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      } else if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      }
      return 0;
    });

  const stats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    underReview: documents.filter(doc => doc.status === 'under_review').length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
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
                <h1 className="text-xl font-bold">Document Management</h1>
                <p className="text-sm text-blue-100">Review and verify student documents</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors">
              <MdUpload className="h-5 w-5" />
              <span className="hidden sm:inline">Upload Document</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total Documents</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Under Review</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Verified</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
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
                    placeholder="Search documents..."
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
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Document Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={documentTypeFilter}
                  onChange={(e) => setDocumentTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Types</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Student Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Students</option>
                  {students.map((student) => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Student Name (A-Z)</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdRefresh className="h-5 w-5" />
                Refresh
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <MdDownload className="h-5 w-5" />
                Export Report
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-tracked-primary text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-tracked-primary text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Documents Display */}
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col items-center mb-3">
                      {getDocumentIcon(doc.documentType)}
                      <h3 className="text-sm font-semibold text-gray-800 mt-2 text-center">{doc.documentType}</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-gray-500">Student:</p>
                        <p className="font-medium text-gray-800">{doc.studentName}</p>
                        <p className="text-gray-400">{doc.studentId}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">File:</p>
                        <p className="font-medium text-gray-800 truncate" title={doc.fileName}>{doc.fileName}</p>
                        <p className="text-gray-400">{doc.fileSize}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Upload Date:</p>
                        <p className="font-medium text-gray-800">{doc.uploadDate}</p>
                      </div>

                      <div className="pt-2">
                        {getStatusBadge(doc.status)}
                      </div>

                      {doc.notes && (
                        <div className="pt-2">
                          <p className="text-gray-500">Notes:</p>
                          <p className="text-xs text-gray-600 italic">{doc.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors text-xs"
                        title="View Document"
                      >
                        <MdVisibility className="h-4 w-4" />
                        View
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                        title="Download"
                      >
                        <MdDownload className="h-4 w-4" />
                        Download
                      </button>
                      {doc.status === 'pending' && (
                        <button
                          className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                          title="Verify"
                        >
                          <MdCheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No documents found matching your filters.
                </div>
              )}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-tracked-primary">{doc.documentId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{doc.studentName}</div>
                            <div className="text-xs text-gray-500">{doc.studentId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{doc.documentType}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{doc.fileName}</div>
                            <div className="text-xs text-gray-500">{doc.fileSize}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doc.uploadDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(doc.status)}
                            {doc.notes && (
                              <div className="mt-1 text-xs text-gray-500 italic">{doc.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {doc.verifiedBy ? (
                              <div>
                                <div className="text-sm text-gray-900">{doc.verifiedBy}</div>
                                <div className="text-xs text-gray-500">{doc.verificationDate}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not verified</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                className="text-tracked-primary hover:text-tracked-secondary"
                                title="View Document"
                              >
                                <MdVisibility className="h-5 w-5" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-700"
                                title="Download"
                              >
                                <MdDownload className="h-5 w-5" />
                              </button>
                              {doc.status === 'pending' && (
                                <>
                                  <button
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Verify"
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
                          No documents found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredDocuments.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredDocuments.length}</span> of{' '}
                    <span className="font-medium">{documents.length}</span> documents
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDocumentManagement;
