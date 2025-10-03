import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
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
  MdDescription
} from 'react-icons/md';

const CourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const programs = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II' },
  ];

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
      id: 3,
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
    // Add more materials as needed
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesProgram = selectedProgram === 'all' || material.program === selectedProgram;
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesType && matchesSearch;
  });

  const handleUpload = () => {
    // Implement file upload logic
    console.log('Upload clicked');
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
            <button
              onClick={handleUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <MdAdd className="h-5 w-5 mr-2" />
              Upload Material
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {material.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
                      <p className="text-sm text-gray-500">{material.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-gray-500">
                          {programs.find(p => p.value === material.program)?.label}
                        </span>
                        <span className="text-xs text-gray-500">{material.size}</span>
                        <span className="text-xs text-gray-500">
                          Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {material.downloads} downloads
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(material.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Download"
                    >
                      <MdDownload className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(material.id)}
                      className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full"
                      title="Edit"
                    >
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete"
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterials;
