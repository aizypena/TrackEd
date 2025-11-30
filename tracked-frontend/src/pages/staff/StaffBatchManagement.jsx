import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import AddBatch from '../../components/admin/AddBatch';
import ViewBatchStudents from '../../components/admin/ViewBatchStudents';
import { batchAPI } from '../../services/batchAPI';
import { programAPI } from '../../services/programAPI';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdMenu,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdPeople,
  MdCalendarToday,
  MdCheckCircle,
  MdWarning,
  MdPending,
  MdCancel,
  MdRefresh,
  MdDownload,
  MdPrint,
  MdGroup,
  MdSchool,
  MdAssignment,
  MdTrendingUp,
  MdClose,
  MdPersonAdd,
  MdSchedule,
  MdLocationOn,
  MdPlayCircleOutline,
  MdPauseCircleOutline,
  MdAccessTime
} from 'react-icons/md';

const StaffBatchManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Fetch batches and programs on mount
  useEffect(() => {
    fetchBatches();
    fetchPrograms();
  }, []);

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch('https://api.smitracked.cloud/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          log_level: logLevel,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log system action');
      }
    } catch (error) {
      console.error('Error logging system action:', error);
    }
  };

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
      // Get batch info before deletion for logging
      const batch = batches.find(b => b.id === batchId);
      const response = await batchAPI.delete(batchId);
      if (response.success) {
        // Get staff user info for logging
        const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

        // Log the deletion
        await logSystemAction(
          'batch_deleted',
          `${staffName} deleted batch ${batch?.batch_id || batchId} (${batch?.program?.title || 'Unknown Program'})`,
          'warning'
        );

        toast.success('Batch deleted successfully');
        fetchBatches();
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch: ' + error.message);
    }
  };

  const handleViewStudents = async (batch) => {
    try {
      setSelectedBatch(batch);
      const response = await batchAPI.getEnrolledStudents(batch.id);
      if (response.success) {
        setEnrolledStudents(response.data.students);
        setShowStudentsModal(true);

        // Get staff user info for logging
        const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';

        // Log the view action
        await logSystemAction(
          'batch_students_viewed',
          `${staffName} viewed students for batch ${batch.batch_id} (${batch.program?.title || 'Unknown Program'}) - ${response.data.students.length} students enrolled`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast.error('Failed to fetch enrolled students: ' + error.message);
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

  const stats = {
    totalBatches: batches.length,
    activeBatches: batches.filter(b => b.status === 'ongoing').length,
    totalStudents: batches.reduce((sum, b) => sum + (b.enrolled_students_count || 0), 0),
    completedBatches: batches.filter(b => b.status === 'finished').length,
    totalVouchers: batches.reduce((sum, b) => sum + (b.voucher_available || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Batch Management</h1>
                <p className="text-sm text-blue-100">Manage training batches and student groups</p>
              </div>
            </div>
            <button 
              onClick={handleAddBatch}
              className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-tracked-secondary hover:bg-opacity-90 rounded-md transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">Create Batch</span>
            </button>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdGroup className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Batches</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalBatches}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Batches</p>
                  <p className="text-xl font-bold text-green-600">{stats.activeBatches}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdPeople className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students</p>
                  <p className="text-xl font-bold text-purple-600">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-full">
                  <MdAssignment className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Vouchers</p>
                  <p className="text-xl font-bold text-amber-600">{stats.totalVouchers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <MdSchool className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-xl font-bold text-gray-600">{stats.completedBatches}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Program Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.title}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Status</option>
                  <option value="not started">Not Started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={fetchBatches}
                disabled={loading}
                className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
              >
                <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Batches Table */}
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
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${((batch.enrolled_students_count || 0) / batch.max_students) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {batch.voucher_quantity > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {batch.voucher_used_count || 0}/{batch.voucher_quantity}
                              </div>
                              <div className="text-xs text-gray-500">
                                {batch.voucher_available || 0} available
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
                            </div>
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
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
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

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default StaffBatchManagement;
