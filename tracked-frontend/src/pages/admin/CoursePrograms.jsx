import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
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

  // Mock data for programs
  const programs = [
    {
      id: 1,
      name: 'Bartending NC II',
      code: 'BART-NC2',
      description: 'Learn professional bartending skills and beverage service',
      duration: '3 months',
      qualification: 'NC II',
      status: 'active',
      enrolledStudents: 45,
      maxStudents: 50,
      schedule: 'MWF 9:00 AM - 3:00 PM',
      instructor: 'John Smith',
      requirements: [
        'Must be at least 18 years old',
        'High School Graduate',
        'Physically fit'
      ]
    },
    {
      id: 2,
      name: 'Barista Training NC II',
      code: 'BAR-NC2',
      description: 'Master the art of coffee preparation and service',
      duration: '2 months',
      qualification: 'NC II',
      status: 'active',
      enrolledStudents: 30,
      maxStudents: 40,
      schedule: 'TTH 8:00 AM - 2:00 PM',
      instructor: 'Maria Garcia',
      requirements: [
        'Must be at least 18 years old',
        'High School Graduate',
        'Food handling certificate'
      ]
    },
    // Add more programs as needed
  ];

  const handleAddProgram = () => {
    setShowAddModal(true);
    setEditingProgram(null);
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setShowAddModal(true);
  };

  const handleDeleteProgram = (programId) => {
    // Implement delete logic
    console.log('Deleting program:', programId);
  };

  const handleStatusChange = (programId, newStatus) => {
    // Implement status change logic
    console.log('Changing status:', programId, newStatus);
  };

  const ProgramModal = ({ isOpen, onClose, program }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {program ? 'Edit Program' : 'Add New Program'}
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
                <label className="block text-sm font-medium text-gray-700">Program Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Program Code</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.code}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification Level</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.qualification}
                >
                  <option value="NC II">NC II</option>
                  <option value="NC III">NC III</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.duration}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Students</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.maxStudents}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructor</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={program?.instructor}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
                defaultValue={program?.description}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                defaultValue={program?.schedule}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Requirements</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
                defaultValue={program?.requirements?.join('\n')}
                placeholder="Enter each requirement on a new line"
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
                {program ? 'Update Program' : 'Add Program'}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                      <p className="text-sm text-gray-500">{program.code}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        program.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {program.status === 'active' ? (
                        <MdCheck className="h-4 w-4 mr-1" />
                      ) : (
                        <MdClose className="h-4 w-4 mr-1" />
                      )}
                      {program.status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-600">{program.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Qualification</p>
                        <p className="text-sm font-medium text-gray-900">{program.qualification}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{program.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Enrolled</p>
                        <p className="text-sm font-medium text-gray-900">
                          {program.enrolledStudents}/{program.maxStudents}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Schedule</p>
                        <p className="text-sm font-medium text-gray-900">{program.schedule}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditProgram(program)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <MdEdit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <MdDelete className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
      />
    </div>
  );
};

export default CoursePrograms;
