import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdSchool,
  MdSearch,
  MdFilterList,
  MdAdd,
  MdEdit,
  MdDelete,
  MdEmail,
  MdPhone,
  MdMenu,
  MdDownload,
  MdRefresh,
  MdWarning,
  MdCheckCircle,
  MdAccessTime,
  MdBlock,
  MdCalendarToday,
  MdPayment,
  MdPeople,
  MdLocalLibrary,
  MdVisibility
} from 'react-icons/md';

const Enrollments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for initial UI development
  const enrollmentStats = {
    total: 156,
    active: 98,
    pending: 45,
    completed: 13
  };

  const programs = [
    { id: 'bartending-nc-ii', name: 'Bartending NC II' },
    { id: 'barista-training-nc-ii', name: 'Barista Training NC II' },
    { id: 'housekeeping-nc-ii', name: 'Housekeeping NC II' },
    { id: 'food-beverage-services-nc-ii', name: 'Food and Beverage Services NC II' },
    { id: 'bread-pastry-production-nc-ii', name: 'Bread and Pastry Production NC II' }
  ];

  const enrollments = [
    {
      id: 1,
      student: { name: 'Juan Dela Cruz', email: 'juan@example.com', phone: '09171234567' },
      program: 'Bartending NC II',
      status: 'active',
      enrollmentDate: '2025-09-15',
      paymentStatus: 'paid',
      batch: 'Batch 2025-B'
    },
    // Add more mock data as needed
  ];

  const handleRefresh = () => {
    // Implement refresh logic
    console.log('Refreshing enrollment data...');
  };

  const handleExport = () => {
    // Implement export logic
    console.log('Exporting enrollment data...');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <MdCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <MdAccessTime className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <MdSchool className="w-5 h-5 text-blue-600" />;
      default:
        return <MdBlock className="w-5 h-5 text-gray-600" />;
    }
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
                <h1 className="text-2xl font-semibold text-gray-900">Enrollments</h1>
                <p className="text-sm text-gray-500">Manage student enrollments and program assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <MdRefresh className="h-5 w-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <MdDownload className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-semibold text-gray-900">{enrollmentStats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdPeople className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-semibold text-green-600">{enrollmentStats.active}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Enrollments</p>
                  <p className="text-2xl font-semibold text-yellow-600">{enrollmentStats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <MdAccessTime className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Programs</p>
                  <p className="text-2xl font-semibold text-blue-600">{enrollmentStats.completed}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <MdSchool className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 min-w-0 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search enrollments..."
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MdAdd className="h-5 w-5 mr-2" />
                  New Enrollment
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <MdWarning className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enrollments Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {enrollment.student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student.name}
                            </div>
                            <div className="text-sm text-gray-500 flex flex-col">
                              <span className="flex items-center">
                                <MdEmail className="h-4 w-4 mr-1" />
                                {enrollment.student.email}
                              </span>
                              <span className="flex items-center">
                                <MdPhone className="h-4 w-4 mr-1" />
                                {enrollment.student.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdLocalLibrary className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{enrollment.program}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {getStatusIcon(enrollment.status)}
                          <span className="ml-1 capitalize">{enrollment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MdCalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.paymentStatus === 'paid' 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-yellow-50 text-yellow-800'
                        }`}>
                          <MdPayment className="h-4 w-4 mr-1" />
                          {enrollment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{enrollment.batch}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Enrollment"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Delete Enrollment"
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
    </div>
  );
};

export default Enrollments;
