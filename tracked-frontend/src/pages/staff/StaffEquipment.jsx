import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import AddEditEquipmentModal from '../../components/staff/AddEditEquipmentModal';
import { equipmentAPI } from '../../services/equipmentAPI';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdPrint,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdClose,
  MdBuild,
  MdSettings,
  MdInventory,
  MdCalendarToday,
  MdLocationOn,
  MdAssignment,
  MdHistory,
  MdQrCode,
  MdFilterList,
  MdViewModule,
  MdViewList
} from 'react-icons/md';

const StaffEquipment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({
    totalEquipment: 0,
    available: 0,
    inUse: 0,
    needsMaintenance: 0
  });

  // Fetch equipment on mount and when filters change
  useEffect(() => {
    fetchEquipment();
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [searchTerm, categoryFilter, statusFilter, locationFilter, sortBy]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getAll({
        category: categoryFilter,
        status: statusFilter,
        location: locationFilter,
        search: searchTerm,
        sort_by: sortBy,
        sort_order: 'asc'
      });
      
      if (response.success) {
        setEquipment(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await equipmentAPI.getCategories();
      console.log('Categories response:', response); // Debug log
      if (response.success) {
        setCategories(response.data);
        console.log('Categories set:', response.data); // Debug log
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load program categories');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await equipmentAPI.getLocations();
      console.log('Locations response:', response); // Debug log
      if (response.success) {
        setLocations(response.data);
        console.log('Locations set:', response.data); // Debug log
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setErrorMessage('Failed to load locations');
    }
  };

  const calculateStats = (data) => {
    const calculated = {
      totalEquipment: data.reduce((sum, item) => sum + item.quantity, 0),
      available: data.reduce((sum, item) => sum + item.available, 0),
      inUse: data.reduce((sum, item) => sum + item.in_use, 0),
      needsMaintenance: data.filter(item => item.status === 'maintenance' || item.status === 'damaged').length
    };
    setStats(calculated);
  };

  // Auto-hide messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowAddModal(true);
  };

  const handleEditEquipment = (item) => {
    setEditingEquipment(item);
    setShowAddModal(true);
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      const response = await equipmentAPI.delete(id);
      if (response.success) {
        setSuccessMessage('Equipment deleted successfully');
        fetchEquipment();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setErrorMessage('Failed to delete equipment: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Available'
      },
      inUse: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdAssignment className="h-4 w-4" />,
        label: 'In Use'
      },
      maintenance: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdBuild className="h-4 w-4" />,
        label: 'Maintenance'
      },
      damaged: {
        className: 'bg-red-100 text-red-800',
        icon: <MdError className="h-4 w-4" />,
        label: 'Damaged'
      },
      retired: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdClose className="h-4 w-4" />,
        label: 'Retired'
      }
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      excellent: { className: 'bg-green-100 text-green-800', label: 'Excellent' },
      good: { className: 'bg-blue-100 text-blue-800', label: 'Good' },
      fair: { className: 'bg-yellow-100 text-yellow-800', label: 'Fair' },
      poor: { className: 'bg-red-100 text-red-800', label: 'Poor' }
    };

    const config = conditionConfig[condition] || conditionConfig.good;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Filtered equipment is now handled by API, so we just use equipment directly
  const filteredEquipment = equipment;

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
                <h1 className="text-xl font-bold">Equipment Management</h1>
                <p className="text-sm text-blue-100">Track and manage training equipment inventory</p>
              </div>
            </div>
            <button 
              onClick={handleAddEquipment}
              className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline hover:cursor-pointer">Add Equipment</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdInventory className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Equipment</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalEquipment}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Available</p>
                  <p className="text-xl font-bold text-green-600">{stats.available}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdAssignment className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">In Use</p>
                  <p className="text-xl font-bold text-purple-600">{stats.inUse}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MdWarning className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Needs Attention</p>
                  <p className="text-xl font-bold text-orange-600">{stats.needsMaintenance}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
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
                  <option value="available">Available</option>
                  <option value="inUse">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
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
                  <option value="name">Name (A-Z)</option>
                  <option value="category">Category</option>
                  <option value="quantity">Quantity</option>
                  <option value="value">Value</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={fetchEquipment}
                  disabled={loading}
                  className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdDownload className="h-5 w-5" />
                  Export
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-tracked-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title="Grid View"
                >
                  <MdViewModule className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-tracked-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title="List View"
                >
                  <MdViewList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Card Header */}
                    <div className="bg-tracked-primary p-4 text-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-blue-100">{item.equipment_code}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      {/* Brand & Model */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        <p className="text-xs text-gray-500">{item.model}</p>
                      </div>

                      {/* Category & Location */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MdSettings className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MdLocationOn className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{item.location}</span>
                        </div>
                      </div>

                      {/* Quantity Status */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Availability</span>
                          <span className="font-semibold text-gray-800">{item.available}/{item.quantity}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <p className="font-bold text-green-600">{item.available}</p>
                            <p className="text-gray-500">Available</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-blue-600">{item.inUse}</p>
                            <p className="text-gray-500">In Use</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-red-600">{item.maintenance + item.damaged}</p>
                            <p className="text-gray-500">Issues</p>
                          </div>
                        </div>
                      </div>

                      {/* Condition */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Condition</p>
                        {getConditionBadge(item.condition)}
                      </div>

                      {/* Value */}
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">Unit Value</p>
                        <p className="text-lg font-bold text-tracked-primary">{formatCurrency(item.value)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setSelectedEquipment(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors text-sm"
                        >
                          <MdVisibility className="h-4 w-4" />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditEquipment(item)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <MdInventory className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg">No equipment found matching your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipment Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEquipment.length > 0 ? (
                      filteredEquipment.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.equipment_code}</div>
                            <div className="text-xs text-gray-500 mt-1">{item.brand} - {item.model}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <MdLocationOn className="h-4 w-4 text-gray-400" />
                              {item.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{item.available}/{item.quantity}</div>
                            <div className="flex gap-2 mt-1 text-xs">
                              <span className="text-green-600">✓ {item.available}</span>
                              <span className="text-blue-600">● {item.in_use}</span>
                              {(item.maintenance + item.damaged) > 0 && (
                                <span className="text-red-600">⚠ {item.maintenance + item.damaged}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getConditionBadge(item.condition)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-tracked-primary">{formatCurrency(item.value)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedEquipment(item)}
                                className="text-tracked-primary hover:text-tracked-secondary"
                                title="View Details"
                              >
                                <MdVisibility className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditEquipment(item)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Edit Equipment"
                              >
                                <MdEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEquipment(item.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete Equipment"
                              >
                                <MdDelete className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          No equipment found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-tracked-primary p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedEquipment.name}</h2>
                  <p className="text-blue-100">{selectedEquipment.equipment_code}</p>
                  <p className="text-blue-100 mt-1">{selectedEquipment.brand} - {selectedEquipment.model}</p>
                  <div className="flex gap-2 mt-3">
                    {getStatusBadge(selectedEquipment.status)}
                    {getConditionBadge(selectedEquipment.condition)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <MdClose className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Equipment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEquipment.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEquipment.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Serial Number</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEquipment.serial_number}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Unit Value</p>
                  <p className="text-lg font-bold text-tracked-primary">{formatCurrency(selectedEquipment.value)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEquipment.purchase_date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-lg font-bold text-tracked-primary">
                    {formatCurrency(selectedEquipment.value * selectedEquipment.quantity)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-800">{selectedEquipment.description}</p>
              </div>

              {/* Availability Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdInventory className="h-5 w-5 text-tracked-primary" />
                  Availability Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedEquipment.quantity}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Quantity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedEquipment.available}</p>
                    <p className="text-xs text-gray-600 mt-1">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedEquipment.inUse}</p>
                    <p className="text-xs text-gray-600 mt-1">In Use</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{selectedEquipment.maintenance}</p>
                    <p className="text-xs text-gray-600 mt-1">Maintenance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedEquipment.damaged}</p>
                    <p className="text-xs text-gray-600 mt-1">Damaged</p>
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdBuild className="h-5 w-5 text-tracked-primary" />
                  Maintenance Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Last Maintenance</p>
                    <p className="text-lg font-bold text-gray-800">{selectedEquipment.last_maintenance || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Maintenance</p>
                    <p className="text-lg font-bold text-gray-800">{selectedEquipment.next_maintenance || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Maintenance History */}
              {selectedEquipment.maintenance_history && selectedEquipment.maintenance_history.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdHistory className="h-5 w-5 text-tracked-primary" />
                    Maintenance History
                  </h3>
                  <div className="space-y-3">
                    {selectedEquipment.maintenance_history.map((record, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MdCalendarToday className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{record.date}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                record.type === 'Routine' ? 'bg-blue-100 text-blue-800' :
                                record.type === 'Repair' ? 'bg-yellow-100 text-yellow-800' :
                                record.type === 'Safety Inspection' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {record.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{record.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                  <MdEdit className="h-5 w-5" />
                  Edit Equipment
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MdQrCode className="h-5 w-5" />
                  Generate QR
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <MdBuild className="h-5 w-5" />
                  Schedule Maintenance
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  <MdPrint className="h-5 w-5" />
                  Print Label
                </button>
                <button 
                  onClick={() => setSelectedEquipment(null)}
                  className="ml-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Equipment Modal */}
      {showAddModal && (
        <AddEditEquipmentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingEquipment(null);
          }}
          equipment={editingEquipment}
          categories={categories}
          locations={locations}
          onSuccess={() => {
            fetchEquipment();
            setShowAddModal(false);
            setEditingEquipment(null);
            setSuccessMessage(editingEquipment ? 'Equipment updated successfully' : 'Equipment added successfully');
          }}
          onError={(message) => setErrorMessage(message)}
        />
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-green-50 border border-green-200">
            <MdCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="ml-2 text-green-600 hover:text-green-800">
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-red-50 border border-red-200">
            <MdError className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="ml-2 text-red-600 hover:text-red-800">
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffEquipment;
