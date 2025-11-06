import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import AddEditEquipmentModal from '../../components/staff/AddEditEquipmentModal';
import ViewEquipmentModal from '../../components/staff/ViewEquipmentModal';
import DeleteConfirmationModal from '../../components/staff/DeleteConfirmationModal';
import AssignEquipmentModal from '../../components/staff/AssignEquipmentModal';
import ManageAssignmentsModal from '../../components/staff/ManageAssignmentsModal';
import { equipmentAPI } from '../../services/equipmentAPI';
import { getStaffToken } from '../../utils/staffAuth';
import axios from 'axios';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdClose,
  MdBuild,
  MdInventory,
  MdLocationOn,
  MdAssignment
} from 'react-icons/md';

const StaffEquipment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [assigningEquipment, setAssigningEquipment] = useState(null);
  const [managingEquipment, setManagingEquipment] = useState(null);
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

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch('https://api.smitracked.cloud/api/log-action', {
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
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load program categories');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await equipmentAPI.getLocations();
      if (response.success) {
        setLocations(response.data);
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

  const handleDeleteEquipment = (item) => {
    // Open the delete confirmation modal
    setDeletingEquipment(item);
  };

  const handleAssignEquipment = (item) => {
    // Open the assign equipment modal
    setSelectedEquipment(null); // Close view modal if open
    setAssigningEquipment(item);
  };

  const handleManageAssignments = (item) => {
    // Open the manage assignments modal
    setSelectedEquipment(null); // Close view modal if open
    setManagingEquipment(item);
  };

  const handleConfirmDelete = async (password) => {
    if (!deletingEquipment) return;

    try {
      // Get the logged-in user's email from localStorage
      // Check for staff user first, then admin user
      const staffUserStr = localStorage.getItem('staffUser');
      const adminUserStr = localStorage.getItem('adminUser');
      
      let user = null;
      if (staffUserStr) {
        user = JSON.parse(staffUserStr);
      } else if (adminUserStr) {
        user = JSON.parse(adminUserStr);
      }

      if (!user) {
        throw new Error('User session not found. Please log in again.');
      }
      
      const email = user.email;

      if (!email) {
        throw new Error('User email not found. Please log in again.');
      }

      // Verify the user's password
      const API_URL = 'https://api.smitracked.cloud/api';
      const loginResponse = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      if (!loginResponse.data.success) {
        throw new Error('Invalid password');
      }

      // If password is valid, proceed with deletion
      const response = await equipmentAPI.delete(deletingEquipment.id);
      if (response.success) {
        // Get staff user info for logging
        const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

        // Log the deletion
        await logSystemAction(
          'equipment_deleted',
          `${staffName} deleted equipment ${deletingEquipment.equipment_code} (${deletingEquipment.name}) - Category: ${deletingEquipment.category}, Quantity: ${deletingEquipment.quantity}`,
          'warning'
        );

        setSuccessMessage('Equipment deleted successfully');
        setDeletingEquipment(null);
        fetchEquipment();
      } else {
        throw new Error(response.message || 'Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      // Re-throw the error so the modal can display it
      throw new Error(error.response?.data?.message || error.message || 'Failed to authenticate or delete equipment');
    }
  };

  // Helper function for status badges (used in grid/list views)
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

  // Helper function for condition badges (used in grid/list views)
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

  // Helper function for currency formatting (used in grid/list views)
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
              className="flex items-center gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors cursor-pointer"
            >
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Add Equipment</span>
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
            </div>
          </div>

          {/* List View */}
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
                            <div className="flex gap-2 text-xs">
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
                                onClick={() => handleDeleteEquipment(item)}
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
        </div>
      </div>

      {/* View Equipment Detail Modal */}
      <ViewEquipmentModal
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
        equipment={selectedEquipment}
        onEdit={handleEditEquipment}
        onAssign={handleAssignEquipment}
        onManageAssignments={handleManageAssignments}
      />

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
          onSuccess={async (actionType, equipmentData) => {
            // Get staff user info for logging
            const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
            const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

            if (actionType === 'created') {
              await logSystemAction(
                'equipment_added',
                `${staffName} added new equipment ${equipmentData.equipment_code} (${equipmentData.name}) - Category: ${equipmentData.category}, Quantity: ${equipmentData.quantity}, Value: ₱${equipmentData.value}`,
                'info'
              );
            } else if (actionType === 'updated') {
              await logSystemAction(
                'equipment_updated',
                `${staffName} updated equipment ${equipmentData.equipment_code} (${equipmentData.name}) - Category: ${equipmentData.category}, Status: ${equipmentData.status}`,
                'info'
              );
            }

            fetchEquipment();
            setShowAddModal(false);
            setEditingEquipment(null);
            setSuccessMessage(actionType === 'updated' ? 'Equipment updated successfully' : 'Equipment added successfully');
          }}
          onError={(message) => setErrorMessage(message)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingEquipment}
        onClose={() => setDeletingEquipment(null)}
        onConfirm={handleConfirmDelete}
        equipmentName={deletingEquipment?.name}
      />

      {/* Assign Equipment Modal */}
      <AssignEquipmentModal
        isOpen={!!assigningEquipment}
        onClose={() => setAssigningEquipment(null)}
        equipment={assigningEquipment}
        onSuccess={async (assignmentData) => {
          // Get staff user info for logging
          const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
          const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

          await logSystemAction(
            'equipment_assigned',
            `${staffName} assigned ${assignmentData.quantity}x ${assignmentData.equipmentCode} (${assignmentData.equipmentName}) to ${assignmentData.userName} - Purpose: ${assignmentData.purpose}`,
            'info'
          );

          setSuccessMessage('Equipment assigned successfully');
          setAssigningEquipment(null);
          fetchEquipment();
        }}
        onError={(message) => setErrorMessage(message)}
      />

      {/* Manage Assignments Modal */}
      <ManageAssignmentsModal
        isOpen={!!managingEquipment}
        onClose={() => setManagingEquipment(null)}
        equipment={managingEquipment}
        onSuccess={async (returnData) => {
          // Get staff user info for logging
          const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
          const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

          await logSystemAction(
            'equipment_returned',
            `${staffName} processed return of ${returnData.quantity}x ${returnData.equipmentCode} (${returnData.equipmentName}) from ${returnData.userName} - Condition: ${returnData.returnCondition}${returnData.returnNotes ? `, Notes: ${returnData.returnNotes}` : ''}`,
            'info'
          );

          setSuccessMessage('Equipment returned successfully');
          setManagingEquipment(null);
          fetchEquipment();
        }}
        onError={(message) => setErrorMessage(message)}
      />

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
