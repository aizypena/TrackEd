import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdClose,
  MdAssignment,
  MdCalendarToday,
  MdPeople,
  MdSchool,
  MdTimer,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdFilterList,
  MdRefresh,
  MdDescription
} from 'react-icons/md';

const StaffExamManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state for create/edit
  const [formData, setFormData] = useState({
    exam_title: '',
    exam_code: '',
    program_id: '',
    batch_id: '',
    exam_type: 'written',
    exam_date: '',
    exam_time: '',
    duration: '',
    passing_score: '',
    total_score: '',
    venue: '',
    proctor: '',
    description: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchExams();
    fetchPrograms();
    fetchBatches();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/exams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setExams(data.data || []);
      } else {
        toast.error('Failed to load exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Programs data:', data);
      if (data.success) {
        setPrograms(data.data || []);
        console.log('Programs set:', data.data);
      } else {
        console.log('Programs fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Batches data:', data);
      if (data.success) {
        setBatches(data.data || []);
        console.log('Batches set:', data.data);
      } else {
        console.log('Batches fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/staff/exams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Exam created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchExams();
      } else {
        toast.error(data.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch(`http://localhost:8000/api/staff/exams/${selectedExam.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Exam updated successfully');
        setShowEditModal(false);
        setSelectedExam(null);
        resetForm();
        fetchExams();
      } else {
        toast.error(data.message || 'Failed to update exam');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch(`http://localhost:8000/api/staff/exams/${selectedExam.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Exam deleted successfully');
        setShowDeleteModal(false);
        setSelectedExam(null);
        fetchExams();
      } else {
        toast.error(data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      exam_title: '',
      exam_code: '',
      program_id: '',
      batch_id: '',
      exam_type: 'written',
      exam_date: '',
      exam_time: '',
      duration: '',
      passing_score: '',
      total_score: '',
      venue: '',
      proctor: '',
      description: '',
      status: 'scheduled'
    });
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setFormData({
      exam_title: exam.exam_title || '',
      exam_code: exam.exam_code || '',
      program_id: exam.program_id || '',
      batch_id: exam.batch_id || '',
      exam_type: exam.exam_type || 'written',
      exam_date: exam.exam_date || '',
      exam_time: exam.exam_time || '',
      duration: exam.duration || '',
      passing_score: exam.passing_score || '',
      total_score: exam.total_score || '',
      venue: exam.venue || '',
      proctor: exam.proctor || '',
      description: exam.description || '',
      status: exam.status || 'scheduled'
    });
    setShowEditModal(true);
  };

  const openViewModal = (exam) => {
    setSelectedExam(exam);
    setShowViewModal(true);
  };

  const openDeleteModal = (exam) => {
    setSelectedExam(exam);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdCalendarToday className="h-4 w-4" />,
        label: 'Scheduled'
      },
      ongoing: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Ongoing'
      },
      completed: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Completed'
      },
      cancelled: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-4 w-4" />,
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.scheduled;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getExamTypeBadge = (type) => {
    const typeConfig = {
      written: { className: 'bg-purple-100 text-purple-800', label: 'Written' },
      practical: { className: 'bg-orange-100 text-orange-800', label: 'Practical' },
      oral: { className: 'bg-teal-100 text-teal-800', label: 'Oral' },
      online: { className: 'bg-indigo-100 text-indigo-800', label: 'Online' }
    };

    const config = typeConfig[type?.toLowerCase()] || typeConfig.written;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Filter and search exams
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.exam_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.exam_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = programFilter === 'all' || exam.program_id === parseInt(programFilter);
    const matchesBatch = batchFilter === 'all' || exam.batch_id === parseInt(batchFilter);
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;

    return matchesSearch && matchesProgram && matchesBatch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: exams.length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    completed: exams.filter(e => e.status === 'completed').length
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <StaffSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
                <p className="text-sm text-gray-600 mt-1">Create, schedule, and manage exams</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              Create Exam
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Exams</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                </div>
                <MdAssignment className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
                </div>
                <MdCheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by exam title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Program Filter */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                color: '#000000 !important', 
                backgroundColor: '#ffffff !important'
              }}
            >
              <option value="all" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>
                All Programs {programs.length > 0 ? `(${programs.length})` : ''}
              </option>
              {programs.length === 0 ? (
                <option disabled style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>
                  No programs available
                </option>
              ) : (
                programs.map(program => (
                  <option 
                    key={program.id} 
                    value={program.id} 
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  >
                    {program.title || program.program_name || `Program ${program.id}`}
                  </option>
                ))
              )}
            </select>

            {/* Batch Filter */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                color: '#000000 !important', 
                backgroundColor: '#ffffff !important'
              }}
            >
              <option value="all" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>
                All Batches {batches.length > 0 ? `(${batches.length})` : ''}
              </option>
              {batches.length === 0 ? (
                <option disabled style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>
                  No batches available
                </option>
              ) : (
                batches.map(batch => (
                  <option 
                    key={batch.id} 
                    value={batch.id} 
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  >
                    {batch.batch_id || batch.batch_name || `Batch ${batch.id}`}
                  </option>
                ))
              )}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                color: '#000000 !important', 
                backgroundColor: '#ffffff !important'
              }}
            >
              <option value="all" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>All Status</option>
              <option value="scheduled" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Scheduled</option>
              <option value="ongoing" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Ongoing</option>
              <option value="completed" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Completed</option>
              <option value="cancelled" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <MdRefresh className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-gray-500">Loading exams...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentExams.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center">
                        <MdAssignment className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No exams found</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Create your first exam
                        </button>
                      </td>
                    </tr>
                  ) : (
                    currentExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{exam.exam_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{exam.exam_title}</div>
                          <div className="text-sm text-gray-500">{exam.venue || 'TBA'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getExamTypeBadge(exam.exam_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exam.program_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{exam.batch_name || 'All Batches'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exam.exam_date || 'TBA'}</div>
                          <div className="text-sm text-gray-500">{exam.exam_time || 'TBA'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{exam.duration ? `${exam.duration} mins` : 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(exam.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openViewModal(exam)}
                              className="text-blue-600 hover:text-blue-700"
                              title="View Details"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(exam)}
                              className="text-green-600 hover:text-green-700"
                              title="Edit Exam"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(exam)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Exam"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredExams.length)} of {filteredExams.length} exams
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded-lg text-sm ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Exam</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exam Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.exam_title}
                    onChange={(e) => setFormData({...formData, exam_title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter exam title"
                  />
                </div>

                {/* Exam Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.exam_code}
                    onChange={(e) => setFormData({...formData, exam_code: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., EXAM-2025-001"
                  />
                </div>

                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.exam_type}
                    onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="written">Written</option>
                    <option value="practical">Practical</option>
                    <option value="oral">Oral</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.program_id}
                    onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.program_name}</option>
                    ))}
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch (Optional)
                  </label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Batches</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.exam_date}
                    onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Exam Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.exam_time}
                    onChange={(e) => setFormData({...formData, exam_time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 120"
                  />
                </div>

                {/* Total Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_score}
                    onChange={(e) => setFormData({...formData, total_score: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 100"
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 75"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter venue"
                  />
                </div>

                {/* Proctor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proctor/Examiner
                  </label>
                  <input
                    type="text"
                    value={formData.proctor}
                    onChange={(e) => setFormData({...formData, proctor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter proctor name"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter exam description or instructions"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure to Create Modal */}
      {showEditModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Exam</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExam(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateExam} className="p-6 space-y-6">
              {/* Same form fields as Create Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.exam_title}
                    onChange={(e) => setFormData({...formData, exam_title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.exam_code}
                    onChange={(e) => setFormData({...formData, exam_code: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.exam_type}
                    onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="written">Written</option>
                    <option value="practical">Practical</option>
                    <option value="oral">Oral</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.program_id}
                    onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.program_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch (Optional)
                  </label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Batches</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.exam_date}
                    onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.exam_time}
                    onChange={(e) => setFormData({...formData, exam_time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_score}
                    onChange={(e) => setFormData({...formData, total_score: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proctor/Examiner
                  </label>
                  <input
                    type="text"
                    value={formData.proctor}
                    onChange={(e) => setFormData({...formData, proctor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExam(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Exam Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedExam(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedExam.exam_title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Code: {selectedExam.exam_code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(selectedExam.status)}
                  {getExamTypeBadge(selectedExam.exam_type)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Program</label>
                  <p className="mt-1 text-gray-900">{selectedExam.program_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Batch</label>
                  <p className="mt-1 text-gray-900">{selectedExam.batch_name || 'All Batches'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-gray-900">{selectedExam.exam_date || 'TBA'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="mt-1 text-gray-900">{selectedExam.exam_time || 'TBA'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="mt-1 text-gray-900">{selectedExam.duration ? `${selectedExam.duration} minutes` : 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Venue</label>
                  <p className="mt-1 text-gray-900">{selectedExam.venue || 'TBA'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Total Score</label>
                  <p className="mt-1 text-gray-900">{selectedExam.total_score || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Passing Score</label>
                  <p className="mt-1 text-gray-900">{selectedExam.passing_score || 'N/A'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Proctor/Examiner</label>
                  <p className="mt-1 text-gray-900">{selectedExam.proctor || 'Not assigned'}</p>
                </div>

                {selectedExam.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-gray-900">{selectedExam.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedExam);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete the exam <span className="font-semibold">"{selectedExam.exam_title}"</span>? 
                This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedExam(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExam}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffExamManagement;
