import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import ProgramModal from '../../components/admin/ProgramModal';
import Toast from '../../components/Toast';
import { programAPI } from '../../services/programAPI';
import toast from 'react-hot-toast';
import {
  MdMenu,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdSchool,
  MdAccessTime,
  MdPeople,
  MdBookmark,
  MdCheck,
  MdClose,
  MdRefresh,
} from 'react-icons/md';

const CoursePrograms = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  const [toastState, setToastState] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

  const showToastMessage = (message, type = 'success') => {
    setToastState({ show: true, message, type });
  };

  const hideToast = () => {
    setToastState({ ...toastState, show: false });
  };

  // Log action helper
  const logAction = async (action, description, level = 'info') => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('https://api.smitracked.cloud/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action,
          description,
          log_level: level
        })
      });
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  // Fetch programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await programAPI.getAll();
      if (response.success) {
        setPrograms(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = () => {
    setShowAddModal(true);
    setEditingProgram(null);
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setShowAddModal(true);
  };

  const handleDeleteProgram = (program) => {
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      // First verify the admin password
      const verifyResponse = await fetch('https://api.smitracked.cloud/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        toast.error(errorData.message || 'Incorrect password');
        await logAction(
          'program_deletion_password_failed',
          `Failed password verification for deleting program: ${programToDelete.title}`,
          'warning'
        );
        return;
      }

      // If password is correct, proceed with deletion
      const response = await programAPI.delete(programToDelete.id);
      if (response.success) {
        // Log successful deletion
        await logAction(
          'program_deleted',
          `Deleted program: ${programToDelete.title}`,
          'warning'
        );
        
        // Refresh programs list
        fetchPrograms();
        toast.success('Program deleted successfully!');
        setShowDeleteConfirm(false);
        setProgramToDelete(null);
        setDeletePassword('');
      }
    } catch (err) {
      // Log deletion failure
      await logAction(
        'program_deletion_failed',
        `Failed to delete program: ${programToDelete?.title || 'Unknown'}`,
        'error'
      );
      toast.error('Error deleting program: ' + err.message);
      console.error('Error deleting program:', err);
    }
  };

  const handleSaveProgram = async (programData) => {
    try {
      let response;
      if (editingProgram) {
        response = await programAPI.update(editingProgram.id, programData);
        
        if (response.success) {
          // Log successful update
          await logAction(
            'program_updated',
            `Updated program: ${programData.title}`,
            'info'
          );
        }
      } else {
        response = await programAPI.create(programData);
        
        if (response.success) {
          // Log successful creation
          await logAction(
            'program_created',
            `Created new program: ${programData.title}`,
            'info'
          );
        }
      }

      if (response.success) {
        setShowAddModal(false);
        setEditingProgram(null);
        showToastMessage(response.message, 'success');
        
        // Refresh the page after successful edit
        if (editingProgram) {
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Wait 1 second to show toast message
        } else {
          fetchPrograms(); // Just refresh data for new programs
        }
      }
    } catch (err) {
      // Log save failure
      await logAction(
        editingProgram ? 'program_update_failed' : 'program_creation_failed',
        `Failed to ${editingProgram ? 'update' : 'create'} program: ${programData.title}`,
        'error'
      );
      showToastMessage('Error saving program: ' + err.message, 'error');
      console.error('Error saving program:', err);
    }
  };

  // Filter programs based on search and availability
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || program.availability === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                <h1 className="text-2xl font-semibold text-gray-900">Course Programs</h1>
                <p className="text-sm text-gray-500">Manage training programs and courses</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleAddProgram}
                className="inline-flex hover:cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MdAdd className="h-5 w-5 mr-2" />
                Add Program
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 min-w-0 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search programs..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <button
                  onClick={fetchPrograms}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <MdRefresh className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading programs...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPrograms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MdSchool className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new program'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={handleAddProgram}
                  className="mt-4 inline-flex hover:cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <MdAdd className="h-5 w-5 mr-2" />
                  Add Program
                </button>
              )}
            </div>
          )}

          {/* Programs Grid */}
          {!loading && filteredPrograms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MdAccessTime className="h-4 w-4 mr-1" />
                            {program.duration} hours
                          </p>
                          {program.pricing && (
                            <p className="text-sm font-medium text-blue-600">
                              ₱{parseFloat(program.pricing).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          program.availability === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {program.availability === 'available' ? (
                          <MdCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <MdClose className="h-4 w-4 mr-1" />
                        )}
                        {program.availability}
                      </span>
                    </div>
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">{program.description}</p>
                      
                      {program.career_opportunities && program.career_opportunities.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Career Opportunities:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {program.career_opportunities.slice(0, 3).map((opp, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span className="line-clamp-1">{opp}</span>
                              </li>
                            ))}
                            {program.career_opportunities.length > 3 && (
                              <li className="text-blue-600">+{program.career_opportunities.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {program.core_competencies && program.core_competencies.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Core Competencies:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {program.core_competencies.slice(0, 3).map((comp, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span className="line-clamp-1">{comp}</span>
                              </li>
                            ))}
                            {program.core_competencies.length > 3 && (
                              <li className="text-blue-600">+{program.core_competencies.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex flex-row items-stretch justify-end gap-3">
                      <button
                        onClick={() => handleEditProgram(program)}
                        className="flex items-center justify-center px-4 py-2 h-10 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <MdEdit className="h-4 w-4 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program)}
                        className="flex items-center justify-center px-4 py-2 h-10 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <MdDelete className="h-4 w-4 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Program Modal */}
      <ProgramModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProgram(null);
        }}
        program={editingProgram}
        onSave={handleSaveProgram}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && programToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 backdrop-blur-sm transition-opacity" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={() => {
              setShowDeleteConfirm(false);
              setProgramToDelete(null);
              setDeletePassword('');
            }}
          />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-red-900">Confirm Delete</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the program{' '}
                <span className="font-semibold">"{programToDelete.title}"</span>?
              </p>
              <p className="text-sm text-red-600 mb-4">
                This action cannot be undone. All program data will be permanently deleted.
              </p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Your admin password"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      confirmDelete();
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProgramToDelete(null);
                  setDeletePassword('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastState.message}
        type={toastState.type}
        isVisible={toastState.show}
        onClose={hideToast}
      />
    </div>
  );
};

export default CoursePrograms;
