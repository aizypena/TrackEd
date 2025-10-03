import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdDownload,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdPendingActions,
  MdCalendarToday,
  MdDescription,
  MdBarChart
} from 'react-icons/md';

const TrainerAssessments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const programs = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II' },
  ];

  const sections = [
    { value: 'morning-a', label: 'Morning A - 8:00 AM to 12:00 PM' },
    { value: 'morning-b', label: 'Morning B - 9:00 AM to 1:00 PM' },
    { value: 'afternoon-a', label: 'Afternoon A - 1:00 PM to 5:00 PM' },
    { value: 'afternoon-b', label: 'Afternoon B - 2:00 PM to 6:00 PM' },
  ];

  const assessments = [
    { value: 'midterm', label: 'Midterm Assessment' },
    { value: 'practical-1', label: 'Practical Assessment 1' },
    { value: 'practical-2', label: 'Practical Assessment 2' },
    { value: 'final', label: 'Final Assessment' },
  ];

  const students = [
    {
      id: 1,
      name: 'John Doe',
      studentId: 'STU-2025-001',
      program: 'bartending-nc-ii',
      section: 'morning-a',
      assessments: {
        'midterm': {
          status: 'completed',
          score: 92,
          totalItems: 100,
          submittedAt: '2025-09-15T10:30:00',
          feedback: 'Excellent understanding of core concepts.'
        },
        'practical-1': {
          status: 'completed',
          score: 88,
          totalItems: 100,
          submittedAt: '2025-09-20T14:15:00',
          feedback: 'Good practical skills, needs minor improvement in timing.'
        },
        'practical-2': {
          status: 'ongoing',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        },
        'final': {
          status: 'pending',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        }
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      studentId: 'STU-2025-002',
      program: 'barista-training-nc-ii',
      section: 'morning-b',
      assessments: {
        'midterm': {
          status: 'completed',
          score: 95,
          totalItems: 100,
          submittedAt: '2025-09-15T09:45:00',
          feedback: 'Outstanding performance across all areas.'
        },
        'practical-1': {
          status: 'completed',
          score: 90,
          totalItems: 100,
          submittedAt: '2025-09-20T13:30:00',
          feedback: 'Excellent practical skills and technique.'
        },
        'practical-2': {
          status: 'ongoing',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        },
        'final': {
          status: 'pending',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        }
      }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      studentId: 'STU-2025-003',
      program: 'housekeeping-nc-ii',
      section: 'afternoon-a',
      assessments: {
        'midterm': {
          status: 'completed',
          score: 85,
          totalItems: 100,
          submittedAt: '2025-09-15T11:00:00',
          feedback: 'Good performance, room for improvement in theory.'
        },
        'practical-1': {
          status: 'completed',
          score: 87,
          totalItems: 100,
          submittedAt: '2025-09-20T15:00:00',
          feedback: 'Solid practical skills demonstrated.'
        },
        'practical-2': {
          status: 'ongoing',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        },
        'final': {
          status: 'pending',
          score: null,
          totalItems: 100,
          submittedAt: null,
          feedback: null
        }
      }
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesSection && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'ongoing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="h-5 w-5" />;
      case 'ongoing':
        return <MdAccessTime className="h-5 w-5" />;
      case 'pending':
        return <MdPendingActions className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Assessment Results</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                <MdDownload className="h-5 w-5 mr-2" />
                Export Results
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Type Filter */}
              <div className="relative">
                <select
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Assessments</option>
                  {assessments.map((assessment) => (
                    <option key={assessment.value} value={assessment.value}>
                      {assessment.label}
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
                  placeholder="Search students..."
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    assessments.map((assessment) => {
                      const assessmentData = student.assessments[assessment.value];
                      if (selectedAssessment !== 'all' && selectedAssessment !== assessment.value) {
                        return null;
                      }
                      return (
                        <tr key={`${student.id}-${assessment.value}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.studentId}</div>
                              <div className="text-xs text-gray-400">
                                {programs.find(p => p.value === student.program)?.label}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{assessment.label}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessmentData.status)}`}>
                                {getStatusIcon(assessmentData.status)}
                                <span className="ml-1 capitalize">{assessmentData.status}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {assessmentData.score ? (
                              <span className={`text-sm font-medium ${getScoreColor(assessmentData.score)}`}>
                                {assessmentData.score}/{assessmentData.totalItems}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(assessmentData.submittedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {assessmentData.feedback || '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerAssessments;
