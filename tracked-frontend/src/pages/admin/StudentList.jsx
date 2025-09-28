import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdPrint,
  MdRefresh,
  MdSchool,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdLocationOn,
  MdMoreVert,
} from 'react-icons/md';

const StudentList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for programs
  const programs = [
    { id: 'bartending-nc-ii', name: 'Bartending NC II' },
    { id: 'barista-training-nc-ii', name: 'Barista Training NC II' },
    { id: 'housekeeping-nc-ii', name: 'Housekeeping NC II' },
    { id: 'food-beverage-nc-ii', name: 'Food and Beverage Services NC II' },
    { id: 'bread-pastry-nc-ii', name: 'Bread and Pastry Production NC II' },
    { id: 'events-management-nc-iii', name: 'Events Management NC III' },
    { id: 'chefs-catering-nc-ii', name: 'Chef\'s Catering Services NC II' },
    { id: 'cookery-nc-ii', name: 'Cookery NC II' },
  ];

  // Mock data for batches
  const batches = [
    { id: '2025-a', name: 'Batch 2025-A' },
    { id: '2025-b', name: 'Batch 2025-B' },
    { id: '2025-c', name: 'Batch 2025-C' },
  ];

  // Mock data for students
  const students = [
    {
      id: 'STU-2025-001',
      name: 'Juan Dela Cruz',
      program: 'Bartending NC II',
      batch: 'Batch 2025-A',
      email: 'juan.delacruz@email.com',
      phone: '+63 912 345 6789',
      address: 'Makati City, Metro Manila',
      enrollmentDate: '2025-08-15',
      status: 'Active',
      progress: 75,
      attendance: 95,
    },
    {
      id: 'STU-2025-002',
      name: 'Maria Santos',
      program: 'Cookery NC II',
      batch: 'Batch 2025-A',
      email: 'maria.santos@email.com',
      phone: '+63 923 456 7890',
      address: 'Quezon City, Metro Manila',
      enrollmentDate: '2025-08-15',
      status: 'Active',
      progress: 82,
      attendance: 98,
    },
    {
      id: 'STU-2025-003',
      name: 'Antonio Reyes',
      program: 'Barista Training NC II',
      batch: 'Batch 2025-B',
      email: 'antonio.reyes@email.com',
      phone: '+63 934 567 8901',
      address: 'Pasig City, Metro Manila',
      enrollmentDate: '2025-09-01',
      status: 'Dropped',
      progress: 60,
      attendance: 85,
    },
  ];

  const handleExport = (format) => {
    console.log('Exporting in format:', format);
  };

  const handlePrint = () => {
    console.log('Printing student list');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl font-semibold text-gray-900">Student Lists</h1>
                <p className="text-sm text-gray-500">View and manage enrolled students</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export List
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdPrint className="h-5 w-5 mr-2" />
                Print List
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Programs</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Batches</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 min-w-[300px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students by name or ID..."
                      className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Program & Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.program}</div>
                          <div className="text-sm text-gray-500">{student.batch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm text-gray-900">Progress: {student.progress}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Attendance: {student.attendance}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MdMoreVert className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {students.length} students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentList;
