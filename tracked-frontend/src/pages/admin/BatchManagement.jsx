import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
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
} from 'react-icons/md';

const BatchManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data for programs
  const programs = [
    { id: 'bartending-nc-ii', name: 'Bartending NC II' },
    { id: 'barista-training-nc-ii', name: 'Barista Training NC II' },
    { id: 'housekeeping-nc-ii', name: 'Housekeeping NC II' },
    { id: 'food-beverage-nc-ii', name: 'Food and Beverage Services NC II' },
    { id: 'bread-pastry-nc-ii', name: 'Bread and Pastry Production NC II' },
    { id: 'events-management-nc-iii', name: 'Events Management NC III' },
    { id: 'chefs-catering-nc-ii', name: "Chef's Catering Services NC II" },
    { id: 'cookery-nc-ii', name: 'Cookery NC II' }
  ];

  // Mock data for batches
  const batches = [
    {
      id: 1,
      name: 'Batch 2025-B1',
      program: 'Bartending NC II',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      schedule: 'MWF 9:00 AM - 3:00 PM',
      instructor: 'John Smith',
      status: 'ongoing',
      enrolledStudents: 25,
      maxStudents: 30,
      completion: 45,
      classroom: 'Room 101',
      shifts: ['Morning']
    },
    {
      id: 2,
      name: 'Batch 2025-B2',
      program: 'Barista Training NC II',
      startDate: '2025-10-15',
      endDate: '2025-12-15',
      schedule: 'TTH 8:00 AM - 2:00 PM',
      instructor: 'Maria Garcia',
      status: 'scheduled',
      enrolledStudents: 15,
      maxStudents: 25,
      completion: 0,
      classroom: 'Room 102',
      shifts: ['Afternoon']
    },
    // Add more batches as needed
  ];

  const handleAddBatch = () => {
    setShowAddModal(true);
    setEditingBatch(null);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowAddModal(true);
  };

  const handleDeleteBatch = (batchId) => {
    // Implement delete logic
    console.log('Deleting batch:', batchId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ongoing':
        return <MdPlayCircleOutline className="h-4 w-4 mr-1" />;
      case 'scheduled':
        return <MdCalendarToday className="h-4 w-4 mr-1" />;
      case 'completed':
        return <MdCheckCircle className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <MdClose className="h-4 w-4 mr-1" />;
      default:
        return <MdAccessTime className="h-4 w-4 mr-1" />;
    }
  };

  const BatchModal = ({ isOpen, onClose, batch }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {batch ? 'Edit Batch' : 'Create New Batch'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.name}
                  placeholder="e.g., Batch 2025-B1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.program}
                >
                  {programs.map(program => (
                    <option key={program.id} value={program.name}>{program.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.startDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.endDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Students</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.maxStudents}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructor</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.instructor}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Classroom</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.classroom}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={batch?.status}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue={batch?.schedule}
                placeholder="e.g., MWF 9:00 AM - 3:00 PM"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {batch ? 'Update Batch' : 'Create Batch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setLoading(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
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
                      Batch Details
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
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {batch.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {batch.instructor}
                            </div>
                            <div className="text-xs text-gray-500">
                              {batch.classroom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{batch.program}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{batch.schedule}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {batch.enrolledStudents}/{batch.maxStudents}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(batch.enrolledStudents / batch.maxStudents) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                          {getStatusIcon(batch.status)}
                          {batch.status}
                        </span>
                        {batch.completion > 0 && (
                          <div className="mt-1">
                            <div className="text-xs text-gray-500">Completion</div>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${batch.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEditBatch(batch)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="text-red-600 hover:text-red-900"
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
          </div>
        </main>
      </div>

      {/* Add/Edit Batch Modal */}
      <BatchModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBatch(null);
        }}
        batch={editingBatch}
      />
    </div>
  );
};

export default BatchManagement;
