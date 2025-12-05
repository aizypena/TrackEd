import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdRefresh,
  MdVerified,
  MdPerson,
  MdSchool,
  MdCalendarToday,
  MdGrade,
  MdAccessTime,
  MdVisibility,
  MdPrint,
} from 'react-icons/md';

const AdminCertificates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // State for data
  const [certificates, setCertificates] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    issued: 0,
    thisMonth: 0
  });

  // Fetch certificates data from backend
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/certificates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCertificates(data.certificates || []);
          setPrograms(data.programs || []);
          setStats(data.stats || {
            total: 0,
            issued: 0,
            thisMonth: 0
          });
        } else {
          toast.error('Failed to load certificates');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to load data (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Filter certificates based on selected filters
  const filteredCertificates = certificates.filter(cert => {
    const matchesProgram = selectedProgram === 'all' || cert.program_id === parseInt(selectedProgram);
    const matchesStatus = selectedStatus === 'all' || cert.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      cert.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.program_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesProgram && matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    // Create CSV content
    const headers = ['Certificate Number', 'Student Name', 'Program', 'Grade', 'Attendance', 'Issued Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCertificates.map(cert => [
        cert.certificate_number,
        `"${cert.student_name}"`,
        `"${cert.program_name}"`,
        cert.grade,
        `${cert.attendance_rate}%`,
        cert.issued_date,
        cert.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Certificates exported successfully');
  };

  const handleRefresh = () => {
    fetchCertificates();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
                <p className="text-sm text-gray-500">View and manage student certificates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdRefresh className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdVerified className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active/Issued</p>
                    <p className="text-2xl font-bold text-green-600">{stats.issued}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MdVerified className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issued This Month</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MdCalendarToday className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by student name, certificate number, or program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Program Filter */}
                <div className="sm:w-48">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Programs</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="sm:w-40">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="issued">Issued</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <MdVerified className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedProgram !== 'all' || selectedStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No certificates have been issued yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certificate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issued Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issued By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MdVerified className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {cert.certificate_number}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <MdPerson className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{cert.student_name}</p>
                                <p className="text-xs text-gray-500">{cert.student_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MdSchool className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{cert.program_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MdGrade className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                {cert.grade ? `${cert.grade}%` : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MdAccessTime className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">
                                {cert.attendance_rate ? `${cert.attendance_rate}%` : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MdCalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{formatDate(cert.issued_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                              {cert.status || 'Issued'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cert.issued_by_name || 'System'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Results count */}
            {!loading && filteredCertificates.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Showing {filteredCertificates.length} of {certificates.length} certificates
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminCertificates;
