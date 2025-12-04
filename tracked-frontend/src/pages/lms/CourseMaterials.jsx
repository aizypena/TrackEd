import { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentToken, getStudentUser } from '../../utils/studentAuth';
import DocumentViewer from '../../components/DocumentViewer';
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
  MdVisibility
} from 'react-icons/md';

const CourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  // Fetch user data and materials on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data from localStorage
        const userData = getStudentUser();
        if (userData) {
          setUser(userData);
        }
        
        const token = getStudentToken();
        
        // Fetch course materials
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
    setLoadingDocument(true);
    setViewerOpen(true);
    
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
        
        // Set material with blob URL
        setCurrentMaterial({
          ...material,
          fileUrl: url
        });
      } else {
        console.error('View failed');
        alert('Failed to view material. Please try again.');
        setViewerOpen(false);
      }
    } catch (error) {
      console.error('Error viewing material:', error);
      alert('Failed to view material. Please try again.');
      setViewerOpen(false);
    } finally {
      setLoadingDocument(false);
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
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
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={closeViewer}
        document={currentMaterial}
        onDownload={handleDownload}
        loading={loadingDocument}
      />
    </div>
  );
};

export default CourseMaterials;
