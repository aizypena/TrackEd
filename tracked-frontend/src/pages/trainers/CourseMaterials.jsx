import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import { getTrainerToken } from '../../utils/trainerAuth';
import { 
  MdUpload, 
  MdDelete, 
  MdEdit, 
  MdDownload, 
  MdMenu, 
  MdAdd,
  MdSearch,
  MdFilterList,
  MdBook,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdDescription,
  MdFolder,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdImage
} from 'react-icons/md';

const CourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'document',
    file: null
  });

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch assigned programs and materials on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getTrainerToken();
        
        // Fetch assigned programs
        const programsResponse = await fetch('http://localhost:8000/api/trainer/assigned-programs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (programsResponse.ok) {
          const programsData = await programsResponse.json();
          setAssignedPrograms(programsData.programs);
        }
        
        // Fetch course materials
        const materialsResponse = await fetch('http://localhost:8000/api/trainer/course-materials', {
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

  // Map program titles to match material program values
  const programTitleMap = {
    'Bartending NC II': 'bartending-nc-ii',
    'Barista Training NC II': 'barista-training-nc-ii',
    'Housekeeping NC II': 'housekeeping-nc-ii',
    'Food and Beverage Services NC II': 'food-beverage-services-nc-ii',
    'Bread and Pastry Production NC II': 'bread-pastry-production-nc-ii',
    'Events Management NC III': 'events-management-nc-iii',
    "Chef's Catering Services NC II": 'chefs-catering-services-nc-ii',
    'Cookery NC II': 'cookery-nc-ii',
  };

  const programs = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II', color: 'blue' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II', color: 'amber' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II', color: 'green' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II', color: 'purple' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II', color: 'pink' },
    { value: 'events-management-nc-iii', label: 'Events Management NC III', color: 'indigo' },
    { value: 'chefs-catering-services-nc-ii', label: "Chef's Catering Services NC II", color: 'orange' },
    { value: 'cookery-nc-ii', label: 'Cookery NC II', color: 'red' },
  ];

  // Filter programs to only show assigned ones
  const filteredPrograms = programs.filter(program => {
    // If still loading or no assigned programs, show all (or show none)
    if (loading) return false;
    if (assignedPrograms.length === 0) return false;
    
    // Check if this program is assigned to the trainer
    return assignedPrograms.some(assigned => {
      const mappedValue = programTitleMap[assigned.title];
      return mappedValue === program.value;
    });
  });

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
      return <MdPictureAsPdf className="h-8 w-8 text-red-500" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(lowerFormat) || type === 'video') {
      return <MdVideoLibrary className="h-8 w-8 text-blue-500" />;
    } else if (['ppt', 'pptx'].includes(lowerFormat) || type === 'presentation') {
      return <MdDescription className="h-8 w-8 text-yellow-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(lowerFormat) || type === 'image') {
      return <MdImage className="h-8 w-8 text-green-500" />;
    } else {
      return <MdDescription className="h-8 w-8 text-gray-500" />;
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

  const toggleProgramExpansion = (programValue) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programValue]: !prev[programValue]
    }));
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      pink: 'bg-pink-50 border-pink-200 text-pink-700',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[color] || colors.blue;
  };

  const getProgramMaterials = (programValue) => {
    // Find program ID from programValue
    const program = programs.find(p => p.value === programValue);
    if (!program) return [];
    
    const assignedProgram = assignedPrograms.find(ap => {
      const mappedValue = programTitleMap[ap.title];
      return mappedValue === programValue;
    });
    
    if (!assignedProgram) return [];
    
    return materials.filter(material => {
      const matchesProgram = material.program_id === assignedProgram.id;
      const matchesType = selectedType === 'all' || material.type === selectedType;
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProgram && matchesType && matchesSearch;
    });
  };

  const handleUpload = (programValue) => {
    const program = programs.find(p => p.value === programValue);
    if (!program) return;
    
    const assignedProgram = assignedPrograms.find(ap => {
      const mappedValue = programTitleMap[ap.title];
      return mappedValue === programValue;
    });
    
    if (!assignedProgram) return;
    
    setSelectedProgram(assignedProgram);
    setUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.title || !selectedProgram) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setUploading(true);
    
    try {
      const token = getTrainerToken();
      const formData = new FormData();
      formData.append('program_id', selectedProgram.id);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);
      formData.append('file', uploadForm.file);
      
      const response = await fetch('http://localhost:8000/api/trainer/course-materials/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        showToast('Material uploaded successfully!', 'success');
        setUploadModalOpen(false);
        setUploadForm({ title: '', description: '', type: 'document', file: null });
        
        // Refresh materials
        const materialsResponse = await fetch('http://localhost:8000/api/trainer/course-materials', {
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
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to upload material', 'error');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      showToast('Failed to upload material', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      const token = getTrainerToken();
      const response = await fetch(`http://localhost:8000/api/trainer/course-materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        showToast('Material deleted successfully', 'success');
        setMaterials(materials.filter(m => m.id !== id));
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to delete material', 'error');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      showToast('Failed to delete material', 'error');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setUploadForm({
      title: material.title,
      description: material.description || '',
      type: material.type,
      file: null
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title || !editingMaterial) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setUploading(true);
    
    try {
      const token = getTrainerToken();
      const response = await fetch(`http://localhost:8000/api/trainer/course-materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type,
        })
      });

      if (response.ok) {
        showToast('Material updated successfully!', 'success');
        setEditModalOpen(false);
        setEditingMaterial(null);
        setUploadForm({ title: '', description: '', type: 'document', file: null });
        
        // Refresh materials
        const materialsResponse = await fetch('http://localhost:8000/api/trainer/course-materials', {
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
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to update material', 'error');
      }
    } catch (error) {
      console.error('Error updating material:', error);
      showToast('Failed to update material', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const token = getTrainerToken();
      window.open(`http://localhost:8000/api/trainer/course-materials/${id}/download?token=${token}`, '_blank');
      showToast('Download started', 'success');
    } catch (error) {
      console.error('Error downloading material:', error);
      showToast('Failed to download material', 'error');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Course Materials</h1>
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
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
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

        {/* Content - Program-based layout */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading assigned programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MdFolder className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Assigned</h3>
              <p className="text-gray-500">You don't have any programs assigned yet. Please contact the administrator.</p>
            </div>
          ) : (
            filteredPrograms.map((program) => {
            const programMaterials = getProgramMaterials(program.value);
            const isExpanded = expandedPrograms[program.value];
            
            if (programMaterials.length === 0 && (searchQuery || selectedType !== 'all')) {
              return null; // Hide programs with no matching materials when filtering
            }

            return (
              <div key={program.value} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Program Header */}
                <div 
                  className={`p-4 border-l-4 cursor-pointer ${getColorClasses(program.color)}`}
                  onClick={() => toggleProgramExpansion(program.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MdFolder className="h-6 w-6" />
                      <div>
                        <h2 className="text-lg font-semibold">{program.label}</h2>
                        <p className="text-sm opacity-75">
                          {programMaterials.length} {programMaterials.length === 1 ? 'material' : 'materials'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpload(program.value);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-current rounded-md text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-colors"
                      >
                        <MdAdd className="h-4 w-4 mr-1" />
                        Upload
                      </button>
                      {isExpanded ? (
                        <MdKeyboardArrowUp className="h-6 w-6" />
                      ) : (
                        <MdKeyboardArrowDown className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Materials List */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-gray-50">
                    {programMaterials.length > 0 ? (
                      programMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                {getFileIcon(material.format, material.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">{material.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{material.description || 'No description'}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <MdDescription className="h-3 w-3 mr-1" />
                                    {material.format?.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">{formatFileSize(material.size)}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(material.uploaded_at).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    <MdDownload className="h-3 w-3 inline mr-1" />
                                    {material.downloads}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleDownload(material.id)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Download"
                              >
                                <MdDownload className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(material)}
                                className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                title="Edit"
                              >
                                <MdEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(material.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                              >
                                <MdDelete className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MdFolder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No materials found for this program</p>
                        <button
                          onClick={() => handleUpload(program.value)}
                          className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <MdAdd className="h-4 w-4 mr-2" />
                          Upload First Material
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Material for {selectedProgram?.title}
              </h2>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Bartending"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the material"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="presentation">Presentation</option>
                    <option value="image">Image</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 500MB</p>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalOpen(false);
                      setUploadForm({ title: '', description: '', type: 'document', file: null });
                    }}
                    disabled={uploading}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Edit Material
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="presentation">Presentation</option>
                    <option value="image">Image</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>

                <p className="text-sm text-gray-500">
                  Note: You cannot change the file. To upload a different file, delete this material and upload a new one.
                </p>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setEditingMaterial(null);
                      setUploadForm({ title: '', description: '', type: 'document', file: null });
                    }}
                    disabled={uploading}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseMaterials;
