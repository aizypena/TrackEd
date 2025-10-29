import { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentToken } from '../../utils/studentAuth';
import { 
  MdDownload, 
  MdMenu, 
  MdSearch,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdDescription,
  MdFolder,
  MdImage,
  MdFilterList,
  MdVisibility,
  MdClose
} from 'react-icons/md';

const CourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerType, setViewerType] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState(null);

  // Fetch user data and materials on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getStudentToken();
        
        // Fetch user data
        const userResponse = await fetch('http://localhost:8000/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        
        // Fetch course materials (will need to create this endpoint)
        const materialsResponse = await fetch('http://localhost:8000/api/student/course-materials', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          setMaterials(materialsData.materials || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const materialTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'document', label: 'Documents' },
    { value: 'video', label: 'Videos' },
    { value: 'presentation', label: 'Presentations' },
    { value: 'image', label: 'Images' },
    { value: 'assessment', label: 'Assessments' }
  ];

  // Helper function to get file icon based on format
  const getFileIcon = (format, type) => {
    const lowerFormat = format?.toLowerCase() || '';
    
    if (['pdf'].includes(lowerFormat) || type === 'document') {
      return <MdPictureAsPdf className="h-10 w-10 text-red-500" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(lowerFormat) || type === 'video') {
      return <MdVideoLibrary className="h-10 w-10 text-blue-500" />;
    } else if (['ppt', 'pptx'].includes(lowerFormat) || type === 'presentation') {
      return <MdDescription className="h-10 w-10 text-yellow-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(lowerFormat) || type === 'image') {
      return <MdImage className="h-10 w-10 text-green-500" />;
    } else {
      return <MdDescription className="h-10 w-10 text-gray-500" />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleDownload = async (id) => {
    try {
      const token = getStudentToken();
      const response = await fetch(`http://localhost:8000/api/student/course-materials/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        // Get filename from content-disposition header or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'download';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed');
        alert('Failed to download material. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download material. Please try again.');
    }
  };

  const handleView = async (id, material) => {
    try {
      const token = getStudentToken();
      const response = await fetch(`http://localhost:8000/api/student/course-materials/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const format = material.format?.toLowerCase();
        
        // Check if it's a viewable document type
        if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(format)) {
          setCurrentMaterial(material);
          setViewerType(format);
          setViewerUrl(url);
          setViewerOpen(true);
        } else {
          // For other file types, open in new tab
          window.open(url, '_blank');
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);
        }
      } else {
        console.error('View failed');
        alert('Failed to view material. Please try again.');
      }
    } catch (error) {
      console.error('Error viewing material:', error);
      alert('Failed to view material. Please try again.');
    }
  };

  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setViewerOpen(false);
    setViewerUrl('');
    setViewerType('');
    setCurrentMaterial(null);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Sidebar 
        user={user}
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="lg:ml-64">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 ml-2">Course Materials</h1>
                <p className="text-sm text-gray-500 ml-2">Access learning resources for your program</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                >
                  {materialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MdFolder className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedType !== 'all' 
                  ? 'Try adjusting your filters or search query.' 
                  : 'No course materials are available yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center p-6 gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        {getFileIcon(material.format, material.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {material.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {material.description || 'No description available'}
                          </p>
                        </div>
                        <span className="ml-4 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full whitespace-nowrap">
                          {material.type}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                        <span className="flex items-center">
                          <MdDescription className="h-3.5 w-3.5 mr-1" />
                          {material.format?.toUpperCase()}
                        </span>
                        <span>{formatFileSize(material.size)}</span>
                        <span>
                          {new Date(material.uploaded_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MdDownload className="h-3.5 w-3.5 mr-1" />
                          {material.downloads} downloads
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex gap-3">
                      {/* View Button */}
                      <button
                        onClick={() => handleView(material.id, material)}
                        className="flex hover:cursor-pointer items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <MdVisibility className="h-5 w-5 mr-2" />
                        View
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(material.id)}
                        className="flex hover:cursor-pointer items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <MdDownload className="h-5 w-5 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-white rounded-lg shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getFileIcon(currentMaterial?.format, currentMaterial?.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentMaterial?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentMaterial?.format?.toUpperCase()} • {formatFileSize(currentMaterial?.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                title="Close viewer"
              >
                <MdClose className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Document Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              {viewerType === 'pdf' ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(viewerType) ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8">
                  <div className="max-w-md text-center">
                    <div className="mb-6">
                      {getFileIcon(currentMaterial?.format, currentMaterial?.type)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Office Document Preview
                    </h3>
                    <p className="text-gray-600 mb-6">
                      This is a {currentMaterial?.format?.toUpperCase()} file. To view it, please download the file and open it with Microsoft Office or a compatible application.
                    </p>
                    <button
                      onClick={() => handleDownload(currentMaterial?.id)}
                      className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                      <MdDownload className="h-5 w-5 mr-2" />
                      Download to View
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      Supported viewers: Microsoft Office, LibreOffice, Google Docs (after download)
                    </p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0"
                  title="Document Viewer"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <p className="text-sm text-gray-600">
                {currentMaterial?.description || 'No description available'}
              </p>
              <button
                onClick={() => handleDownload(currentMaterial?.id)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
