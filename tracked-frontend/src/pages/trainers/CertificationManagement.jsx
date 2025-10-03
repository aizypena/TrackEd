import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdWarning,
  MdPersonSearch,
  MdSchool,
  MdStar,
  MdStarHalf,
  MdAccessTime,
  MdBarChart,
  MdSend
} from 'react-icons/md';

const CertificationManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
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

  const certificationStatus = [
    { value: 'eligible', label: 'Eligible for Certification' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'recommended', label: 'Recommended' },
    { value: 'not-eligible', label: 'Not Eligible' },
  ];

  const students = [
    {
      id: 1,
      name: 'John Doe',
      studentId: 'STU-2025-001',
      program: 'bartending-nc-ii',
      section: 'morning-a',
      progress: {
        attendance: 95,
        overallGrade: 92,
        practicalAssessments: 90,
        theoreticalAssessments: 94,
        completedModules: 12,
        totalModules: 12
      },
      certification: {
        status: 'eligible',
        remarks: '',
        lastUpdated: '2025-09-30T10:00:00',
        requirements: {
          attendance: true,
          grades: true,
          practicals: true,
          theoretical: true,
          modules: true
        }
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      studentId: 'STU-2025-002',
      program: 'barista-training-nc-ii',
      section: 'morning-b',
      progress: {
        attendance: 88,
        overallGrade: 85,
        practicalAssessments: 86,
        theoreticalAssessments: 84,
        completedModules: 10,
        totalModules: 12
      },
      certification: {
        status: 'pending',
        remarks: 'Pending completion of remaining modules',
        lastUpdated: '2025-09-29T14:30:00',
        requirements: {
          attendance: true,
          grades: true,
          practicals: true,
          theoretical: true,
          modules: false
        }
      }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      studentId: 'STU-2025-003',
      program: 'housekeeping-nc-ii',
      section: 'afternoon-a',
      progress: {
        attendance: 78,
        overallGrade: 82,
        practicalAssessments: 80,
        theoreticalAssessments: 84,
        completedModules: 11,
        totalModules: 12
      },
      certification: {
        status: 'not-eligible',
        remarks: 'Attendance below required threshold',
        lastUpdated: '2025-09-28T15:45:00',
        requirements: {
          attendance: false,
          grades: true,
          practicals: true,
          theoretical: true,
          modules: false
        }
      }
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'all' || student.certification.status === selectedStatus;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesSection && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible':
        return 'text-green-600 bg-green-50';
      case 'recommended':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'not-eligible':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'eligible':
        return <MdCheckCircle className="h-5 w-5" />;
      case 'recommended':
        return <MdSchool className="h-5 w-5" />;
      case 'pending':
        return <MdPendingActions className="h-5 w-5" />;
      case 'not-eligible':
        return <MdWarning className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getRequirementIcon = (isComplete) => {
    return isComplete ? (
      <MdCheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <MdCancel className="h-5 w-5 text-red-500" />
    );
  };

  const handleRecommendation = (studentId, action) => {
    console.log('Certification action:', { studentId, action });
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
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Certification Management</h1>
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

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  {certificationStatus.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
          <div className="grid grid-cols-1 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.studentId}</p>
                      <p className="text-sm text-gray-500">
                        {programs.find(p => p.value === student.program)?.label}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.certification.status)}`}>
                        {getStatusIcon(student.certification.status)}
                        <span className="ml-2 capitalize">{student.certification.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Progress Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Progress Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Attendance</div>
                          <div className="mt-1 flex items-center">
                            <span className="text-2xl font-semibold text-gray-900">{student.progress.attendance}%</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Overall Grade</div>
                          <div className="mt-1 flex items-center">
                            <span className="text-2xl font-semibold text-gray-900">{student.progress.overallGrade}%</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Practical</div>
                          <div className="mt-1 flex items-center">
                            <span className="text-2xl font-semibold text-gray-900">{student.progress.practicalAssessments}%</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Theoretical</div>
                          <div className="mt-1 flex items-center">
                            <span className="text-2xl font-semibold text-gray-900">{student.progress.theoreticalAssessments}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Module Completion</div>
                        <div className="mt-2">
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block text-blue-600">
                                  {Math.round((student.progress.completedModules / student.progress.totalModules) * 100)}%
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-blue-600">
                                  {student.progress.completedModules}/{student.progress.totalModules}
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                              <div
                                style={{ width: `${(student.progress.completedModules / student.progress.totalModules) * 100}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certification Requirements */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Certification Requirements</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Minimum Attendance (85%)</span>
                          {getRequirementIcon(student.certification.requirements.attendance)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Overall Grades (75%)</span>
                          {getRequirementIcon(student.certification.requirements.grades)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Practical Assessments</span>
                          {getRequirementIcon(student.certification.requirements.practicals)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Theoretical Assessments</span>
                          {getRequirementIcon(student.certification.requirements.theoretical)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">All Modules Completed</span>
                          {getRequirementIcon(student.certification.requirements.modules)}
                        </div>
                      </div>

                      {/* Remarks */}
                      {student.certification.remarks && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Remarks</h4>
                          <p className="mt-1 text-sm text-gray-500">{student.certification.remarks}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex space-x-3">
                        {student.certification.status === 'eligible' && (
                          <button
                            onClick={() => handleRecommendation(student.id, 'recommend')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MdSchool className="h-5 w-5 mr-2" />
                            Recommend for Certification
                          </button>
                        )}
                        {student.certification.status === 'pending' && (
                          <button
                            onClick={() => handleRecommendation(student.id, 'review')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MdPersonSearch className="h-5 w-5 mr-2" />
                            Review Progress
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationManagement;
