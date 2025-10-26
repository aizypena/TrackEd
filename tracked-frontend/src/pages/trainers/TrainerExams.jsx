import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdAssignment,
  MdRecordVoiceOver,
  MdComputer,
  MdRemoveRedEye,
  MdFilterList,
  MdAccessTime,
  MdPeople,
  MdCheckCircle,
} from 'react-icons/md';

const TrainerExams = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const examTypes = [
    { value: 'written', label: 'Written Test', icon: MdAssignment, color: 'blue' },
    { value: 'oral', label: 'Oral Questioning', icon: MdRecordVoiceOver, color: 'green' },
    { value: 'demonstration', label: 'Demonstration', icon: MdComputer, color: 'purple' },
    { value: 'observation', label: 'Observation', icon: MdRemoveRedEye, color: 'orange' },
  ];

  const programs = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II' },
  ];

  // Mock data
  const [exams, setExams] = useState([
    {
      id: 1,
      title: 'Bartending Fundamentals Written Test',
      type: 'written',
      program: 'bartending-nc-ii',
      totalQuestions: 50,
      duration: 60,
      passingScore: 85,
      status: 'active',
      createdAt: '2025-10-20',
      assignedStudents: 25,
      completedCount: 18
    },
    {
      id: 2,
      title: 'Coffee Preparation Oral Assessment',
      type: 'oral',
      program: 'barista-training-nc-ii',
      totalQuestions: 20,
      duration: 30,
      passingScore: 85,
      status: 'active',
      createdAt: '2025-10-18',
      assignedStudents: 20,
      completedCount: 15
    },
    {
      id: 3,
      title: 'Cocktail Making Demonstration',
      type: 'demonstration',
      program: 'bartending-nc-ii',
      totalQuestions: 10,
      duration: 45,
      passingScore: 85,
      status: 'active',
      createdAt: '2025-10-15',
      assignedStudents: 25,
      completedCount: 20
    },
    {
      id: 4,
      title: 'Professional Behavior Observation',
      type: 'observation',
      program: 'housekeeping-nc-ii',
      totalQuestions: 15,
      duration: 120,
      passingScore: 85,
      status: 'draft',
      createdAt: '2025-10-12',
      assignedStudents: 0,
      completedCount: 0
    }
  ]);

  const filteredExams = exams.filter(exam => {
    const matchesType = selectedType === 'all' || exam.type === selectedType;
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
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

  const handleCreateExam = () => {
    setShowCreateModal(true);
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(e => e.id !== examId));
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
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
              onClick={handleCreateExam}
              className="inline-flex items-center px-4 py-2 bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
            >
              <MdAdd className="h-5 w-5 mr-2" />
              Create Exam
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Exam Types</option>
                  {examTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {examTypes.map((type) => {
              const typeExams = exams.filter(e => e.type === type.value);
              const activeCount = typeExams.filter(e => e.status === 'active').length;
              return (
                <div key={type.value} className={`bg-white rounded-lg shadow-sm border-l-4 border-${type.color}-500 p-4`}>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{type.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{typeExams.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{activeCount} active</p>
                  </div>
                </div>
              );
            })}
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
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
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
                          <div className={`flex-shrink-0 h-10 w-10 bg-${getTypeColor(exam.type)}-100 rounded-lg flex items-center justify-center`}>
                            {getTypeIcon(exam.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                            <div className="text-sm text-gray-500">Created {new Date(exam.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(exam.type)}-100 text-${getTypeColor(exam.type)}-800`}>
                          {examTypes.find(t => t.value === exam.type)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {programs.find(p => p.value === exam.program)?.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MdAccessTime className="h-4 w-4 mr-1 text-gray-400" />
                          {exam.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MdPeople className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {exam.completedCount}/{exam.assignedStudents}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(exam.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
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
                  onClick={handleCreateExam}
                  className="inline-flex items-center px-4 py-2 bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
                >
                  <MdAdd className="h-5 w-5 mr-2" />
                  Create Exam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerExams;
