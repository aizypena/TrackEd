import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import documentAPI from '../../services/documentAPI';
import { 
  FaArrowLeft,
  FaUpload,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const ManageDocuments = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDocumentView, setLoadingDocumentView] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    navigate('/');
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser.role === 'applicant' || parsedUser.role === 'student') {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await documentAPI.getDocuments();
          
          if (response.success) {
            // Transform backend response to match our document structure
            const transformedDocs = response.documents
              .filter(doc => doc.uploaded) // Only include uploaded documents
              .map(doc => ({
                id: doc.type,
                name: doc.path ? doc.path.split('/').pop() : '',
                type: doc.type,
                size: 'N/A', // Will be set on upload
                uploadDate: 'Previously uploaded',
                status: 'pending',
                fileUrl: null, // Will be fetched when viewing
                fileType: doc.path ? getFileTypeFromPath(doc.path) : ''
              }));
            
            setDocuments(transformedDocs);
          }
        } catch (error) {
          console.error('Error fetching documents:', error);
          setError('Failed to load documents');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocuments();
  }, [isAuthenticated]);

  const getFileTypeFromPath = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return typeMap[ext] || 'application/octet-stream';
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Required documents list
  const requiredDocuments = [
    { id: 1, name: 'Valid ID', type: 'valid_id', required: true },
    { id: 2, name: 'Transcript of Records', type: 'transcript', required: true },
    { id: 3, name: 'Diploma', type: 'diploma', required: true },
    { id: 4, name: 'Passport Photo', type: 'photo', required: true },
  ];

  const handleFileUpload = async (event, docType) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploading(true);
      setError(null);
      
      try {
        const response = await documentAPI.uploadDocument(file, docType);
        
        if (response.success) {
          // Update documents list
          const newDoc = {
            id: docType,
            name: response.document.name,
            type: docType,
            size: response.document.size,
            uploadDate: response.document.uploadDate,
            status: 'pending',
            fileUrl: null, // Will be fetched when viewing
            fileType: file.type
          };
          
          // Remove old document of same type if exists
          setDocuments(prevDocs => [
            ...prevDocs.filter(doc => doc.type !== docType),
            newDoc
          ]);
          
          alert('Document uploaded successfully!');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload document: ' + error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <FaFileImage className="text-blue-500" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-600" />;
    return <FaFile className="text-gray-500" />;
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // docId is actually the document type
        const response = await documentAPI.deleteDocument(docId);
        
        if (response.success) {
          setDocuments(documents.filter(doc => doc.id !== docId));
          alert('Document deleted successfully!');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete document: ' + error.message);
      }
    }
  };

  const getUploadedDoc = (docType) => {
    return documents.find(doc => doc.type === docType);
  };

  const handleViewDocument = async (doc) => {
    setLoadingDocumentView(true);
    setShowViewModal(true);
    
    try {
      // Fetch the document URL with authentication
      const fileUrl = await documentAPI.getDocumentViewUrl(doc.type);
      
      // Update the document with the fetched URL
      const docWithUrl = {
        ...doc,
        fileUrl: fileUrl
      };
      
      setViewingDocument(docWithUrl);
    } catch (error) {
      console.error('Error fetching document:', error);
      alert('Failed to load document: ' + error.message);
      setShowViewModal(false);
    } finally {
      setLoadingDocumentView(false);
    }
  };

  const handleCloseViewModal = () => {
    // Revoke the blob URL to free up memory
    if (viewingDocument?.fileUrl) {
      URL.revokeObjectURL(viewingDocument.fileUrl);
    }
    setShowViewModal(false);
    setViewingDocument(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-tracked-primary/5">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/smi-logo.jpg" alt="SMI Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Document Management
                </h1>
                <p className="text-sm text-gray-600">
                  Upload and manage your application documents
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/applicant/dashboard')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="bg-tracked-primary hover:bg-tracked-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg mb-8">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-tracked-primary to-indigo-900 p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Required Documents</h2>
            <p className="text-white/90 text-lg">Please upload all required documents for your application</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Upload Instructions</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>• Accepted formats: PDF, JPG, PNG, DOCX</li>
            <li>• Maximum file size: 5MB per document</li>
            <li>• Ensure all documents are clear and readable</li>
            <li>• Documents marked with * are required</li>
          </ul>
        </div>

        {/* Documents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocuments.map((reqDoc) => {
            const uploadedDoc = getUploadedDoc(reqDoc.type);
            
            return (
              <div
                key={reqDoc.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {reqDoc.name}
                      {reqDoc.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {reqDoc.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  {uploadedDoc && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaClock className="mr-1" />
                      {uploadedDoc.status === 'pending' ? 'Pending Review' : uploadedDoc.status}
                    </span>
                  )}
                </div>

                {uploadedDoc ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-2xl">
                          {getFileIcon(uploadedDoc.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedDoc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {uploadedDoc.size} • Uploaded on {uploadedDoc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewDocument(uploadedDoc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(uploadedDoc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                    <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p className="text-sm text-gray-600 mb-2">No document uploaded</p>
                  </div>
                )}

                <label
                  htmlFor={`upload-${reqDoc.type}`}
                  className="w-full bg-tracked-primary hover:bg-indigo-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer flex items-center justify-center"
                >
                  <FaUpload className="mr-2" />
                  {uploadedDoc ? 'Replace Document' : 'Upload Document'}
                </label>
                <input
                  id={`upload-${reqDoc.type}`}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, reqDoc.type)}
                  disabled={uploading}
                />
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {documents.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ready to Submit?</h3>
                <p className="text-sm text-gray-600">
                  {documents.length} of {requiredDocuments.filter(d => d.required).length} required documents uploaded
                </p>
              </div>
              <button
                disabled={documents.length < requiredDocuments.filter(d => d.required).length}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
              >
                Submit Documents
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* View Document Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-tracked-primary to-indigo-900 px-6 py-5 rounded-t-xl flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {viewingDocument ? viewingDocument.name : 'Loading...'}
                </h3>
                {viewingDocument && (
                  <div className="text-white/90 text-sm">
                    <span className="font-medium">Size: {viewingDocument.size}</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">Uploaded: {viewingDocument.uploadDate}</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium capitalize">{viewingDocument.status}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleCloseViewModal}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Modal Content - Document Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-inner p-4 min-h-[500px] flex items-center justify-center">
                {loadingDocumentView ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading document...</p>
                  </div>
                ) : viewingDocument?.fileType?.startsWith('image/') ? (
                  <img
                    src={viewingDocument.fileUrl}
                    alt={viewingDocument.name}
                    className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                  />
                ) : viewingDocument?.fileType === 'application/pdf' ? (
                  <iframe
                    src={viewingDocument.fileUrl}
                    className="w-full h-[600px] rounded-lg border-2 border-gray-200"
                    title={viewingDocument.name}
                  />
                ) : viewingDocument ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-gray-400">
                      {getFileIcon(viewingDocument.name)}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {viewingDocument.name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type
                    </p>
                    <a
                      href={viewingDocument.fileUrl}
                      download={viewingDocument.name}
                      className="inline-flex items-center px-6 py-3 bg-tracked-primary hover:bg-indigo-900 text-white rounded-lg font-medium transition-colors"
                    >
                      Download File
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Modal Footer */}
            {viewingDocument && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Document Type: <span className="font-medium text-gray-900 capitalize">
                      {viewingDocument.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    {viewingDocument.fileUrl && (
                      <a
                        href={viewingDocument.fileUrl}
                        download={viewingDocument.name}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={handleCloseViewModal}
                      className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;
