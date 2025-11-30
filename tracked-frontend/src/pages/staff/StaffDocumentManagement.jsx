import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import DocumentViewer from '../../components/DocumentViewer';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { API_URL, STORAGE_URL } from '../../config/api';
import { 
  MdMenu,
  MdSearch,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdFolder,
  MdFilePresent,
  MdVerifiedUser,
  MdDescription
} from 'react-icons/md';

const StaffDocumentManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [categorizedDocuments, setCategorizedDocuments] = useState({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/log-action`, {
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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      
      const response = await fetch(`${API_URL}/staff/applicant-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setCategorizedDocuments(data.categorized || {});
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCategoryFilter(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryFilter('all');
    setSearchTerm('');
  };

  const handleViewDocument = async (doc) => {
    setLoadingDocument(true);
    setViewerOpen(true);
    
    try {
      const token = getStaffToken();
      const downloadUrl = `${API_URL}/staff/document/download?path=${encodeURIComponent(doc.file_path)}`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        toast.error('Failed to load document');
        setViewerOpen(false);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Extract file extension from file path
      const fileExtension = doc.file_path?.split('.').pop()?.toLowerCase() || '';
      
      // Set document with blob URL
      setCurrentDocument({
        id: doc.id,
        fileUrl: url,
        title: doc.file_name || `${doc.document_type} - ${doc.applicant_name}`,
        name: doc.file_name,
        format: fileExtension,
        size: doc.file_size,
        uploadDate: doc.created_at,
        description: `${doc.document_type} for ${doc.applicant_name} (${doc.student_id})`
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document');
      setViewerOpen(false);
    } finally {
      setLoadingDocument(false);
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setCurrentDocument(null);
  };

  const handleDownloadDocument = async (docId) => {
    try {
      // Get staff user info for logging
      const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
      const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

      // Find the document from state or use current document
      const doc = documents.find(d => d.id === docId) || currentDocument;
      if (!doc) {
        toast.error('Document not found');
        return;
      }

      const token = getStaffToken();
      const downloadUrl = `${API_URL}/staff/document/download?path=${encodeURIComponent(doc.file_path || '')}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.file_name || doc.name || 'download';
      
      // Set authorization header by adding it to the URL won't work, so we'll open in iframe
      // Alternative: Use fetch to get the file with auth, then download
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        toast.error('Failed to download document');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Log the download action
      await logSystemAction(
        'document_downloaded',
        `${staffName} downloaded ${doc.document_type || 'document'} for ${doc.applicant_name || 'applicant'} (Student ID: ${doc.student_id || 'N/A'})`,
        'info'
      );

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading document');
    }
  };

  const documentTypes = [
    'Valid ID',
    'Transcript of Records',
    'Diploma',
    'Passport Photo'
  ];

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
    } else if (documentType.includes('Diploma')) {
      return <MdVerifiedUser className={`${iconClass} text-blue-500`} />;
    } else if (documentType.includes('ID')) {
      return <MdDescription className={`${iconClass} text-green-500`} />;
    } else if (documentType.includes('Transcript')) {
      return <MdDescription className={`${iconClass} text-orange-500`} />;
    }
    return <MdFolder className={`${iconClass} text-gray-500`} />;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.document_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get filtered categorized documents
  const getFilteredCategorizedDocs = () => {
    const filtered = {};
    Object.keys(categorizedDocuments).forEach(category => {
      const categoryDocs = categorizedDocuments[category].filter(doc => {
        const matchesSearch = doc.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || doc.document_type === categoryFilter;
        return matchesSearch && matchesCategory;
      });
      if (categoryDocs.length > 0 || categoryFilter === 'all' || categoryFilter === category) {
        filtered[category] = categoryDocs;
      }
    });
    return filtered;
  };

  const stats = {
    total: documents.length,
    validId: categorizedDocuments['Valid ID']?.length || 0,
    transcript: categorizedDocuments['Transcript of Records']?.length || 0,
    diploma: categorizedDocuments['Diploma']?.length || 0,
    photo: categorizedDocuments['Passport Photo']?.length || 0
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
                <h1 className="text-xl font-bold">Applicant Documents Management</h1>
                <p className="text-sm text-blue-100">Review documents submitted by applicants</p>
              </div>
            </div>
            <button 
              onClick={fetchDocuments}
              className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors"
            >
              <MdRefresh className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-tracked-primary mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Valid ID</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.validId}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Transcript</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.transcript}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Diploma</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.diploma}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 font-medium">Passport Photo</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.photo}</p>
            </div>
          </div>

          {/* Filters and Search - Only show when category is selected */}
          {selectedCategory && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleBackToCategories}
                  className="text-tracked-primary hover:cursor-pointer hover:text-tracked-secondary font-medium"
                >
                  ← Back
                </button>
                <h2 className="text-lg font-semibold text-gray-800">{selectedCategory}</h2>
              </div>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
            </div>
          ) : selectedCategory ? (
            /* Document List View for Selected Category */
            <div className="bg-white rounded-lg shadow-md p-6">
              {getFilteredCategorizedDocs()[selectedCategory]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredCategorizedDocs()[selectedCategory].map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-tracked-primary transition-colors">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-gray-800">{doc.applicant_name}</p>
                          <p className="text-sm text-gray-500">{doc.student_id}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">{doc.email}</p>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-400">Size: {doc.file_size}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="flex-1 px-3 py-2 bg-tracked-primary hover:cursor-pointer text-white rounded-md hover:bg-tracked-secondary transition-colors text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MdFolder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents found</p>
                </div>
              )}
            </div>
          ) : (
            /* Category Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documentTypes.map((category) => {
                const categoryDocs = categorizedDocuments[category] || [];

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-tracked-primary hover:shadow-md hover:cursor-pointer transition-all"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-gray-400 mb-3">
                        {getDocumentIcon(category)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={closeViewer}
        document={currentDocument}
        onDownload={handleDownloadDocument}
        loading={loadingDocument}
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

export default StaffDocumentManagement;
