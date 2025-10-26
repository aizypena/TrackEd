import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import UploadMaterial from '../../components/admin/UploadMaterial';
import ViewMaterial from '../../components/admin/ViewMaterial';
import {
  MdMenu,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdDownload,
  MdVisibility,
  MdFolder,
  MdInsertDriveFile,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdImage,
  MdDescription,
  MdSchool,
  MdDateRange,
  MdPerson,
  MdAttachFile,
  MdUpload
} from 'react-icons/md';

const AdminCourseMaterials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: 'Introduction to Bartending',
      description: 'Comprehensive guide to bartending basics and fundamentals',
      program: 'Bartending NC II',
      type: 'PDF',
      fileSize: '2.5 MB',
      uploadDate: '2025-10-20',
      uploadedBy: 'Admin User',
      downloads: 45,
      status: 'active'
    },
    {
      id: 2,
      title: 'Coffee Brewing Techniques',
      description: 'Video tutorial on various coffee brewing methods',
      program: 'Barista Training NC II',
      type: 'Video',
      fileSize: '125 MB',
      uploadDate: '2025-10-18',
      uploadedBy: 'Admin User',
      downloads: 78,
      status: 'active'
    },
    {
      id: 3,
      title: 'Housekeeping Standards Manual',
      description: 'Complete manual for housekeeping standards and procedures',
      program: 'Housekeeping NC II',
      type: 'PDF',
      fileSize: '5.8 MB',
      uploadDate: '2025-10-15',
      uploadedBy: 'Admin User',
      downloads: 62,
      status: 'active'
    },
    {
      id: 4,
      title: 'Food Service Presentation',
      description: 'PowerPoint presentation on professional food service',
      program: 'Food and Beverage Services NC II',
      type: 'PPT',
      fileSize: '8.3 MB',
      uploadDate: '2025-10-12',
      uploadedBy: 'Admin User',
      downloads: 34,
      status: 'active'
    },
    {
      id: 5,
      title: 'Pastry Techniques',
      description: 'Image gallery of professional pastry techniques',
      program: 'Bread and Pastry Production NC II',
      type: 'Images',
      fileSize: '15.2 MB',
      uploadDate: '2025-10-10',
      uploadedBy: 'Admin User',
      downloads: 89,
      status: 'active'
    },
    {
      id: 6,
      title: 'Event Planning Checklist',
      description: 'Comprehensive checklist for event planning and management',
      program: 'Events Management NC III',
      type: 'Document',
      fileSize: '1.2 MB',
      uploadDate: '2025-10-08',
      uploadedBy: 'Admin User',
      downloads: 56,
      status: 'active'
    }
  ]);

  const programs = [
    'Bartending NC II',
    'Barista Training NC II',
    'Housekeeping NC II',
    'Food and Beverage Services NC II',
    'Bread and Pastry Production NC II',
    'Events Management NC III',
    "Chef's Catering Services NC II",
    'Cookery NC II'
  ];

  const materialTypes = ['PDF', 'Video', 'PPT', 'Document', 'Images', 'Audio'];

  const handleUploadMaterial = () => {
    setShowUploadModal(true);
    setEditingMaterial(null);
  };

  const handleViewMaterial = (material) => {
    setViewingMaterial(material);
    setShowViewModal(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowUploadModal(true);
  };

  const handleDeleteMaterial = (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    setMaterials(materials.filter(m => m.id !== materialId));
    alert('Material deleted successfully');
  };

  const handleDownloadMaterial = (material) => {
    alert(`Downloading: ${material.title}`);
    // Here you would implement actual download logic
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <MdPictureAsPdf className="h-12 w-12 text-red-500" />;
      case 'Video':
        return <MdVideoLibrary className="h-12 w-12 text-purple-500" />;
      case 'Images':
        return <MdImage className="h-12 w-12 text-blue-500" />;
      case 'PPT':
      case 'Document':
        return <MdDescription className="h-12 w-12 text-orange-500" />;
      default:
        return <MdInsertDriveFile className="h-12 w-12 text-gray-500" />;
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = filterProgram === 'all' || material.program === filterProgram;
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesProgram && matchesType;
  });

  const stats = {
    totalMaterials: materials.length,
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    activePrograms: [...new Set(materials.map(m => m.program))].length,
    recentUploads: materials.filter(m => {
      const uploadDate = new Date(m.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate >= weekAgo;
    }).length
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Course Materials Management</h2>
                <p className="text-sm text-gray-600">Upload and manage learning materials for LMS</p>
              </div>
            </div>
            <button
              onClick={handleUploadMaterial}
              className="inline-flex items-center px-4 py-2 hover:cursor-pointer bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
            >
              <MdAdd className="h-5 w-5 mr-2" />
              Upload Material
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Materials</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMaterials}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdFolder className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Across all programs</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalDownloads}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MdDownload className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">All-time downloads</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Programs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activePrograms}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdSchool className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">With materials</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.recentUploads}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <MdUpload className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Program Filter */}
              <div>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {materialTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Refresh */}
              <div>
                <button
                  onClick={() => setLoading(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <MdRefresh className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Materials List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {getFileIcon(material.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{material.title}</div>
                            <div className="text-sm text-gray-500">{material.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.program}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {material.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.fileSize}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.downloads}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewMaterial(material)}
                            className="text-green-600 hover:text-green-900 hover:cursor-pointer"
                            title="View"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadMaterial(material)}
                            className="text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                            title="Download"
                          >
                            <MdDownload className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditMaterial(material)}
                            className="text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                            title="Edit"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                            title="Delete"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <MdFolder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a new material.</p>
              <div className="mt-6">
                <button
                  onClick={handleUploadMaterial}
                  className="inline-flex items-center px-4 py-2 bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
                >
                  <MdAdd className="h-5 w-5 mr-2" />
                  Upload Material
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upload/Edit Material Modal */}
      <UploadMaterial
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
        programs={programs}
        materialTypes={materialTypes}
        onSuccess={(data) => {
          console.log('Material submitted:', data);
          setLoading(true);
          setTimeout(() => setLoading(false), 1000);
        }}
      />

      {/* View Material Modal */}
      <ViewMaterial
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingMaterial(null);
        }}
        material={viewingMaterial}
        onDownload={handleDownloadMaterial}
      />
    </div>
  );
};

export default AdminCourseMaterials;
