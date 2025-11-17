import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import { 
  MdPeople, 
  MdAssignment, 
  MdUpload, 
  MdGrade, 
  MdCheckCircle, 
  MdMenu 
} from 'react-icons/md';

const TrainerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dashboardCards = [
    {
      title: 'Active Students',
      count: '24',
      description: 'Currently enrolled students',
      icon: <MdPeople className="h-8 w-8 text-blue-600" />,
      path: '/trainer/attendance'
    },
    {
      title: 'Pending Assessments',
      count: '12',
      description: 'Assessments to be graded',
      icon: <MdAssignment className="h-8 w-8 text-yellow-600" />,
      path: '/trainer-lms/assessment-management'
    },
    {
      title: 'Course Materials',
      count: '8',
      description: 'Uploaded learning materials',
      icon: <MdUpload className="h-8 w-8 text-green-600" />,
      path: '/trainer-lms/course-materials'
    },
    {
      title: 'Grades',
      count: '15',
      description: 'Pending grade entries',
      icon: <MdGrade className="h-8 w-8 text-purple-600" />,
      path: '/trainer-lms/grades'
    },
    {
      title: 'Certification Requests',
      count: '3',
      description: 'Students ready for certification',
      icon: <MdCheckCircle className="h-8 w-8 text-red-600" />,
      path: '/trainer-lms/certification'
    }
  ];

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
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Trainer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back, Trainer</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
                  <span className="text-2xl font-bold text-gray-900">{card.count}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                <a
                  href={card.path}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;