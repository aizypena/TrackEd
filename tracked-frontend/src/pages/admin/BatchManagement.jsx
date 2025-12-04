import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import AddBatch from '../../components/admin/AddBatch';
import ViewBatchStudents from '../../components/admin/ViewBatchStudents';
import { batchAPI } from '../../services/batchAPI';
import { programAPI } from '../../services/programAPI';
import toast, { Toaster } from 'react-hot-toast';
import {
  MdMenu,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdGroup,
  MdCalendarToday,
  MdAccessTime,
  MdPeople,
  MdSchool,
  MdCheck,
  MdClose,
  MdRefresh,
  MdPlayCircleOutline,
  MdPauseCircleOutline,
  MdCheckCircle,
  MdVisibility,
  MdCheckCircleOutline,
  MdError,
} from 'react-icons/md';

const BatchManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Log action helper
  const logAction = async (action, description, level = 'info') => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await fetch('http://localhost:8000/api/log-action', {
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

  // Fetch batches and programs on mount
  useEffect(() => {
    fetchBatches();
    fetchPrograms();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getAll({
        program_id: filterProgram,
        status: filterStatus,
        search: searchQuery
      });
      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAll({ availability: 'available' });
      if (response.success) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Refresh batches when filters change
  useEffect(() => {
    fetchBatches();
  }, [filterProgram, filterStatus, searchQuery]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Refresh batches when filters change
  useEffect(() => {
    fetchBatches();
  }, [filterProgram, filterStatus, searchQuery]);

  const handleAddBatch = () => {
    setShowAddModal(true);
    setEditingBatch(null);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowAddModal(true);
  };

  const handleDeleteBatch = async (batchId) => {
    setBatchToDelete(batchId);
    setShowPasswordModal(true);
  };

  const verifyPasswordAndDelete = async () => {
    if (!passwordInput) {
      setModalError('Please enter your password');
      return;
    }

    setModalError(''); // Clear previous errors

    try {
      // Verify password first
      const token = sessionStorage.getItem('adminToken');
      const verifyResponse = await fetch('http://localhost:8000/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        const batch = batches.find(b => b.id === batchToDelete);
        // Log password verification failure
        await logAction(
          'batch_deletion_password_failed',
          `Failed password verification for deleting batch: ${batch?.batch_id || 'Unknown'}`,
          'warning'
        );
        
        setModalError('Incorrect password. Please try again.');
        setPasswordInput('');
        toast.error('Incorrect password');
        return;
      }

      // Password verified, proceed with deletion
      const batch = batches.find(b => b.id === batchToDelete);
      const response = await batchAPI.delete(batchToDelete);
      if (response.success) {
        // Log successful deletion
        await logAction(
          'batch_deleted',
          `Deleted batch: ${batch?.batch_id || 'Unknown'}`,
          'warning'
        );
        
        setSuccessMessage('Batch deleted successfully');
        toast.success('Batch deleted successfully');
        fetchBatches();
        setShowPasswordModal(false);
        setPasswordInput('');
        setBatchToDelete(null);
        setModalError('');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      const batch = batches.find(b => b.id === batchToDelete);
      
      // Log deletion failure
      await logAction(
        'batch_deletion_failed',
        `Failed to delete batch: ${batch?.batch_id || 'Unknown'}`,
        'error'
      );
      
      setModalError('Failed to delete batch. Please try again.');
      toast.error('Failed to delete batch');
    }
  };

  const cancelDelete = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setBatchToDelete(null);
    setModalError('');
  };

  const handleViewStudents = async (batch) => {
    try {
      setSelectedBatch(batch);
      const response = await batchAPI.getEnrolledStudents(batch.id);
      if (response.success) {
        setEnrolledStudents(response.data.students);
        setShowStudentsModal(true);
        
        // Log viewing students
        await logAction(
          'batch_students_viewed',
          `Viewed enrolled students for batch: ${batch.batch_id}`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast.error('Failed to load enrolled students');
      
      // Log viewing failure
      await logAction(
        'batch_students_view_failed',
        `Failed to view students for batch: ${batch.batch_id}`,
        'error'
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'not started':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ongoing':
        return <MdPlayCircleOutline className="h-4 w-4 mr-1" />;
      case 'not started':
        return <MdCalendarToday className="h-4 w-4 mr-1" />;
      case 'finished':
        return <MdCheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <MdAccessTime className="h-4 w-4 mr-1" />;
    }
  };

  const formatSchedule = (days, timeStart, timeEnd) => {
    const dayAbbr = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'Su'
    };
    const daysStr = days.map(d => dayAbbr[d] || d).join('');
    return `${daysStr} ${timeStart} - ${timeEnd}`;
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
                <h1 className="text-2xl font-semibold text-gray-900">Batch Management</h1>
                <p className="text-sm text-gray-500">Manage training batches and schedules</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleAddBatch}
                className="inline-flex items-center hover:cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MdAdd className="h-5 w-5 mr-2" />
                Create Batch
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
                    placeholder="Search batches..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Programs</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>{program.title}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="not started">Not Started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                </select>
                <button
                  onClick={fetchBatches}
                  className="p-2 text-gray-600 hover:cursor-pointer hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Batches List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vouchers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Loading batches...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No batches found.
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {batch.batch_id}
                          </div>
                          {batch.start_date && batch.end_date && (
                            <div className="text-xs text-gray-500">
                              {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{batch.program?.title || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {batch.trainer ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {batch.trainer.first_name} {batch.trainer.last_name}
                              </div>
                              <div className="text-gray-500 text-xs">{batch.trainer.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No trainer assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatSchedule(batch.schedule_days, batch.schedule_time_start, batch.schedule_time_end)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {batch.enrolled_students_count || 0}/{batch.max_students}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                            <div
                              className={`h-2.5 rounded-full ${
                                ((batch.enrolled_students_count || 0) / batch.max_students) >= 0.95
                                  ? 'bg-red-500'
                                  : ((batch.enrolled_students_count || 0) / batch.max_students) >= 0.80
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${((batch.enrolled_students_count || 0) / batch.max_students) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {batch.voucher_quantity > 0 ? (
                            <>
                              <div className="text-sm text-gray-900">
                                {batch.voucher_used_count || 0}/{batch.voucher_quantity}
                              </div>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    ((batch.voucher_used_count || 0) / batch.voucher_quantity) >= 0.95
                                      ? 'bg-red-500'
                                      : ((batch.voucher_used_count || 0) / batch.voucher_quantity) >= 0.80
                                      ? 'bg-yellow-500'
                                      : 'bg-green-600'
                                  }`}
                                  style={{ width: `${((batch.voucher_used_count || 0) / batch.voucher_quantity) * 100}%` }}
                                ></div>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No vouchers</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {getStatusIcon(batch.status)}
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleViewStudents(batch)}
                              className="text-green-600 hover:text-green-900"
                              title="View Students"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditBatch(batch)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Batch"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Batch"
                            >
                              <MdDelete className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Batch Modal */}
      <AddBatch
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBatch(null);
        }}
        batch={editingBatch}
        programs={programs}
        onSuccess={fetchBatches}
      />

      {/* View Students Modal */}
      <ViewBatchStudents
        isOpen={showStudentsModal}
        onClose={() => {
          setShowStudentsModal(false);
          setSelectedBatch(null);
          setEnrolledStudents([]);
        }}
        batch={selectedBatch}
        students={enrolledStudents}
      />

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-500"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                To delete this batch, please enter your admin password to confirm.
              </p>

              {/* Error Message */}
              {modalError && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                  <MdError className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{modalError}</p>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setModalError(''); // Clear error when typing
                }}
                onKeyPress={(e) => e.key === 'Enter' && verifyPasswordAndDelete()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyPasswordAndDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-green-50 border border-green-200">
            <MdCheckCircleOutline className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <Toaster position="top-right" />
    </div>
  );
};

export default BatchManagement;