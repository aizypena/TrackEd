import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import AddBatch from '../../components/admin/AddBatch';
import ViewBatchStudents from '../../components/admin/ViewBatchStudents';
import { batchAPI } from '../../services/batchAPI';
import { programAPI } from '../../services/programAPI';
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
      alert('Failed to fetch batches: ' + error.message);
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
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      const response = await batchAPI.delete(batchId);
      if (response.success) {
        alert('Batch deleted successfully');
        fetchBatches();
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch: ' + error.message);
    }
  };

  const handleViewStudents = async (batch) => {
    try {
      setSelectedBatch(batch);
      const response = await batchAPI.getEnrolledStudents(batch.id);
      if (response.success) {
        setEnrolledStudents(response.data.students);
        setShowStudentsModal(true);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      alert('Failed to fetch enrolled students: ' + error.message);
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
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment
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
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Loading batches...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${((batch.enrolled_students_count || 0) / batch.max_students) * 100}%` }}
                            ></div>
                          </div>
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
    </div>
  );
};

export default BatchManagement;
