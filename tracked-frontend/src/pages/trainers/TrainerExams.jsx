import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import CreateExamModal from '../../components/trainer/CreateExamModal';
import EditExamModal from '../../components/trainer/EditExamModal';
import ConfirmPasswordModal from '../../components/trainer/ConfirmPasswordModal';
import { quizService } from '../../services/quizService';
import batchService from '../../services/batchService';
import {
  MdMenu,
  MdAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdAssignment,
  MdAccessTime,
  MdPeople,
} from 'react-icons/md';

const TrainerExams = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const examTypes = [
    { value: 'written', label: 'Written Test', icon: MdAssignment, color: 'blue' },
  ];

  // Load exams and batches on component mount
  useEffect(() => {
    loadExams();
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const response = await batchService.getTrainerBatches();
      if (response.success && Array.isArray(response.data)) {
        // Transform batches data to match dropdown format
        const formattedBatches = response.data.map(batch => ({
          value: batch.batch_id,
          label: `${batch.batch_id} - ${batch.program_name}`,
          batch_id: batch.batch_id,
          program_name: batch.program_name,
          status: batch.status,
          student_count: batch.student_count,
          start_date: batch.start_date,
          end_date: batch.end_date
        }));
        setBatches(formattedBatches);
      }
    } catch (err) {
      console.error('Error loading batches:', err);
      toast.error('Failed to load batches');
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizService.getQuizzes();
      if (response.success) {
        setExams(response.data || []);
      }
    } catch (err) {
      console.error('Error loading exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTypeIcon = (type) => {
    const examType = examTypes.find(t => t.value === type);
    return examType ? <examType.icon className="h-5 w-5" /> : <MdAssignment className="h-5 w-5" />;
  };

  const getTypeColor = (type) => {
    const examType = examTypes.find(t => t.value === type);
    return examType?.color || 'gray';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Archived</span>;
      default:
        return null;
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      // Only send the status field
      const response = await quizService.updateQuiz(examId, {
        status: newStatus
      });

      if (response.success) {
        // Update local state
        setExams(exams.map(e => 
          e.id === examId ? { ...e, status: newStatus } : e
        ));
        toast.success('Status updated successfully!', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleCreateExam = async (quizData) => {
    try {
      const response = await quizService.createQuiz(quizData);
      if (response.success) {
        await loadExams(); // Reload exams list
        toast.success('Exam created successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Error creating exam:', err);
      
      // Show specific validation errors if available
      if (err.errors && typeof err.errors === 'object') {
        Object.keys(err.errors).forEach(field => {
          const errorMessages = Array.isArray(err.errors[field]) 
            ? err.errors[field].join(', ') 
            : err.errors[field];
          toast.error(`${field}: ${errorMessages}`, {
            duration: 5000,
            position: 'top-right',
          });
        });
      } else {
        toast.error(err.message || 'Failed to create exam', {
          duration: 4000,
          position: 'top-right',
        });
      }
      
      throw new Error(err.message || 'Failed to create exam');
    }
  };

  const handleViewExam = (examId) => {
    navigate(`/trainer-lms/exams/${examId}`);
  };

  const handleEditExam = async (examId) => {
    try {
      // Fetch the full exam details including questions
      const response = await quizService.getQuiz(examId);
      if (response.success) {
        setExamToEdit(response.data);
        setShowEditModal(true);
      }
    } catch (err) {
      console.error('Error loading exam details:', err);
      toast.error('Failed to load exam details', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUpdateExam = async (examId, quizData) => {
    try {
      const response = await quizService.updateQuiz(examId, quizData);
      if (response.success) {
        await loadExams(); // Reload exams list
        toast.success('Exam updated successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Error updating exam:', err);
      
      // Show specific validation errors if available
      if (err.errors && typeof err.errors === 'object') {
        Object.keys(err.errors).forEach(field => {
          const errorMessages = Array.isArray(err.errors[field]) 
            ? err.errors[field].join(', ') 
            : err.errors[field];
          toast.error(`${field}: ${errorMessages}`, {
            duration: 5000,
            position: 'top-right',
          });
        });
      } else {
        toast.error(err.message || 'Failed to update exam', {
          duration: 4000,
          position: 'top-right',
        });
      }
      
      throw new Error(err.message || 'Failed to update exam');
    }
  };

  const handleDeleteExam = async (examId) => {
    setExamToDelete(examId);
    setShowPasswordModal(true);
  };

  const handleConfirmDelete = async (password) => {
    try {
      // Verify password first
      const token = localStorage.getItem('trainerToken');
      const verifyResponse = await axios.post(
        'https://api.smitracked.cloud/api/trainer/verify-password',
        { password },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!verifyResponse.data.success) {
        throw new Error('Incorrect password');
      }

      // Password verified, now delete the exam
      const response = await quizService.deleteQuiz(examToDelete);
      if (response.success) {
        await loadExams();
        toast.success('Exam deleted successfully!', {
          duration: 3000,
          position: 'top-right',
        });
        setShowPasswordModal(false);
        setExamToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      if (err.response?.status === 401 || err.message === 'Incorrect password') {
        throw new Error('Incorrect password. Please try again.');
      }
      throw new Error('Failed to delete exam. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Toaster />
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 ml-2">Exam Management</h1>
                <p className="text-sm text-gray-600 ml-2">Create and manage exams for all assessment types</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 hover:cursor-pointer bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
            >
              <MdAdd className="h-5 w-5 mr-2" />
              Create Exam
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search exams..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{exams.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All written tests</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Exams</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{exams.filter(e => e.status === 'active').length}</p>
                    <p className="text-xs text-gray-500 mt-1">Currently available</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border-l-4 border-gray-500 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft Exams</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{exams.filter(e => e.status === 'draft').length}</p>
                    <p className="text-xs text-gray-500 mt-1">In preparation</p>
                  </div>
                </div>
              </div>

          {/* Exams List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MdAssignment className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                            <div className="text-sm text-gray-500">Created {new Date(exam.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {batches.find(b => b.value === exam.batch_id)?.batch_id || exam.batch_id || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.total_questions || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MdAccessTime className="h-4 w-4 mr-1 text-gray-400" />
                          {exam.time_limit} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdPeople className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {exam.completed_count || 0}/{exam.assigned_students || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={exam.status}
                          onChange={(e) => handleStatusChange(exam.id, e.target.value)}
                          className={`text-xs font-medium rounded-md px-3 py-1.5 border-0 focus:ring-2 focus:ring-offset-1 cursor-pointer ${
                            exam.status === 'active' 
                              ? 'bg-green-100 text-green-800 focus:ring-green-500' 
                              : exam.status === 'draft'
                              ? 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                              : 'bg-red-100 text-red-800 focus:ring-red-500'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewExam(exam.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditExam(exam.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
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

          {filteredExams.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <MdAssignment className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new exam.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 hover:cursor-pointer bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
                >
                  <MdAdd className="h-5 w-5 mr-2" />
                  Create Exam
                </button>
              </div>
            </div>
          )}
          </>
        )}
        </div>
      </div>

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateExam}
        examType="written"
        batches={batches}
      />

      {/* Edit Exam Modal */}
      <EditExamModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setExamToEdit(null);
        }}
        onSuccess={handleUpdateExam}
        examData={examToEdit}
        batches={batches}
      />

      {/* Confirm Password Modal for Delete */}
      <ConfirmPasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setExamToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Exam Deletion"
        message="This action cannot be undone. Please enter your password to confirm deletion of this exam."
      />
    </div>
  );
};

export default TrainerExams;
