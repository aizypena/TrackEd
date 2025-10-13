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
  MdKeyboardArrowUp
} from 'react-icons/md';

const CourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned programs on mount
  useEffect(() => {
    const fetchAssignedPrograms = async () => {
      try {
        const token = getTrainerToken();
        const response = await fetch('http://localhost:8000/api/trainer/assigned-programs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAssignedPrograms(data.programs);
        } else {
          console.error('Failed to fetch assigned programs');
        }
      } catch (error) {
        console.error('Error fetching assigned programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedPrograms();
  }, []);

  // Map program codes to match material program values
  const programCodeMap = {
    'BART-NC2': 'bartending-nc-ii',
    'BARI-NC2': 'barista-training-nc-ii',
    'HOUSE-NC2': 'housekeeping-nc-ii',
    'FBS-NC2': 'food-beverage-services-nc-ii',
    'BPP-NC2': 'bread-pastry-production-nc-ii',
    'EM-NC3': 'events-management-nc-iii',
    'CCS-NC2': 'chefs-catering-services-nc-ii',
    'COOK-NC2': 'cookery-nc-ii',
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
      const mappedCode = programCodeMap[assigned.code];
      return mappedCode === program.value;
    });
  });

  const materialTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'document', label: 'Documents' },
    { value: 'video', label: 'Videos' },
    { value: 'presentation', label: 'Presentations' },
    { value: 'assessment', label: 'Assessments' }
  ];

  const materials = [
    {
      id: 1,
      title: 'Introduction to Bartending',
      program: 'bartending-nc-ii',
      type: 'document',
      format: 'pdf',
      size: '2.4 MB',
      uploadDate: '2025-10-01',
      description: 'Basic principles and techniques of bartending',
      downloads: 45,
      icon: <MdPictureAsPdf className="h-8 w-8 text-red-500" />
    },
    {
      id: 2,
      title: 'Advanced Cocktail Mixing',
      program: 'bartending-nc-ii',
      type: 'video',
      format: 'mp4',
      size: '120 MB',
      uploadDate: '2025-10-05',
      description: 'Professional cocktail preparation techniques',
      downloads: 38,
      icon: <MdVideoLibrary className="h-8 w-8 text-blue-500" />
    },
    {
      id: 3,
      title: 'Coffee Making Techniques',
      program: 'barista-training-nc-ii',
      type: 'video',
      format: 'mp4',
      size: '156 MB',
      uploadDate: '2025-09-28',
      description: 'Step-by-step guide to brewing perfect coffee',
      downloads: 32,
      icon: <MdVideoLibrary className="h-8 w-8 text-blue-500" />
    },
    {
      id: 4,
      title: 'Espresso Fundamentals',
      program: 'barista-training-nc-ii',
      type: 'document',
      format: 'pdf',
      size: '3.2 MB',
      uploadDate: '2025-09-30',
      description: 'Understanding espresso extraction and quality',
      downloads: 41,
      icon: <MdPictureAsPdf className="h-8 w-8 text-red-500" />
    },
    {
      id: 5,
      title: 'Room Cleaning Standards',
      program: 'housekeeping-nc-ii',
      type: 'presentation',
      format: 'pptx',
      size: '5.1 MB',
      uploadDate: '2025-09-25',
      description: 'Professional housekeeping guidelines',
      downloads: 28,
      icon: <MdDescription className="h-8 w-8 text-yellow-500" />
    },
    {
      id: 6,
      title: 'Linen Management',
      program: 'housekeeping-nc-ii',
      type: 'document',
      format: 'pdf',
      size: '1.8 MB',
      uploadDate: '2025-09-27',
      description: 'Best practices for linen care and inventory',
      downloads: 24,
      icon: <MdPictureAsPdf className="h-8 w-8 text-red-500" />
    },
    {
      id: 7,
      title: 'Customer Service Excellence',
      program: 'food-beverage-services-nc-ii',
      type: 'presentation',
      format: 'pptx',
      size: '4.5 MB',
      uploadDate: '2025-10-02',
      description: 'Delivering exceptional dining experiences',
      downloads: 36,
      icon: <MdDescription className="h-8 w-8 text-yellow-500" />
    },
    {
      id: 8,
      title: 'Pastry Basics',
      program: 'bread-pastry-production-nc-ii',
      type: 'video',
      format: 'mp4',
      size: '180 MB',
      uploadDate: '2025-09-29',
      description: 'Introduction to pastry making techniques',
      downloads: 52,
      icon: <MdVideoLibrary className="h-8 w-8 text-blue-500" />
    },
    {
      id: 9,
      title: 'Event Planning Essentials',
      program: 'events-management-nc-iii',
      type: 'document',
      format: 'pdf',
      size: '3.8 MB',
      uploadDate: '2025-10-03',
      description: 'Comprehensive guide to event coordination',
      downloads: 29,
      icon: <MdPictureAsPdf className="h-8 w-8 text-red-500" />
    },
    {
      id: 10,
      title: 'Catering Menu Design',
      program: 'chefs-catering-services-nc-ii',
      type: 'presentation',
      format: 'pptx',
      size: '6.2 MB',
      uploadDate: '2025-10-01',
      description: 'Creating appealing and practical catering menus',
      downloads: 34,
      icon: <MdDescription className="h-8 w-8 text-yellow-500" />
    },
    {
      id: 11,
      title: 'Basic Cooking Techniques',
      program: 'cookery-nc-ii',
      type: 'video',
      format: 'mp4',
      size: '145 MB',
      uploadDate: '2025-10-04',
      description: 'Fundamental culinary skills and methods',
      downloads: 47,
      icon: <MdVideoLibrary className="h-8 w-8 text-blue-500" />
    },
  ];

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
    return materials.filter(material => {
      const matchesProgram = material.program === programValue;
      const matchesType = selectedType === 'all' || material.type === selectedType;
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           material.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProgram && matchesType && matchesSearch;
    });
  };

  const handleUpload = (programValue) => {
    // Implement file upload logic for specific program
    console.log('Upload clicked for program:', programValue);
  };

  const handleDelete = (id) => {
    // Implement delete logic
    console.log('Delete clicked for id:', id);
  };

  const handleEdit = (id) => {
    // Implement edit logic
    console.log('Edit clicked for id:', id);
  };

  const handleDownload = (id) => {
    // Implement download logic
    console.log('Download clicked for id:', id);
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
                                {material.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">{material.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{material.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <MdDescription className="h-3 w-3 mr-1" />
                                    {material.format.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">{material.size}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(material.uploadDate).toLocaleDateString()}
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
                                onClick={() => handleEdit(material.id)}
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
    </div>
  );
};

export default CourseMaterials;
