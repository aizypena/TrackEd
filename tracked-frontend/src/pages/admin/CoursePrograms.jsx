import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import ProgramModal from '../../components/admin/ProgramModal';
import Toast from '../../components/Toast';
import { programAPI } from '../../services/programAPI';
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
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

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }
    
    try {
      const response = await programAPI.delete(programId);
      if (response.success) {
        // Refresh programs list
        fetchPrograms();
        showToast('Program deleted successfully!', 'success');
      }
    } catch (err) {
      showToast('Error deleting program: ' + err.message, 'error');
      console.error('Error deleting program:', err);
    }
  };

  const handleSaveProgram = async (programData) => {
    try {
      let response;
      if (editingProgram) {
        response = await programAPI.update(editingProgram.id, programData);
      } else {
        response = await programAPI.create(programData);
      }

      if (response.success) {
        setShowAddModal(false);
        setEditingProgram(null);
        fetchPrograms();
        showToast(response.message, 'success');
      }
    } catch (err) {
      showToast('Error saving program: ' + err.message, 'error');
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MdAccessTime className="h-4 w-4 mr-1" />
                          {program.duration} hours
                        </p>
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
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => handleEditProgram(program)}
                        className="inline-flex items-center hover:cursor-pointer px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <MdEdit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="inline-flex hover:cursor-pointer items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <MdDelete className="h-4 w-4 mr-1" />
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

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />
    </div>
  );
};

export default CoursePrograms;
