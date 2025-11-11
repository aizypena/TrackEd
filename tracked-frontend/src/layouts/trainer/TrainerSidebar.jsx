import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trainerLogout, getTrainerUser } from '../../utils/trainerAuth';
import { 
  MdDashboard, 
  MdSchool, 
  MdUpload, 
  MdPeopleAlt,
  MdGrade,
  MdAssignment,
  MdVerified,
  MdMenu,
  MdClose,
  MdPerson,
  MdLogout,
  MdBook,
  MdCampaign,
} from 'react-icons/md';

const TrainerSidebar = ({ isOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const trainerUser = getTrainerUser();
    setUser(trainerUser);
  }, []);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/trainer-lms/dashboard',
      icon: <MdDashboard className="h-5 w-5" />
    },
    {
      name: 'Announcements',
      path: '/trainer-lms/announcements',
      icon: <MdCampaign className="h-5 w-5" />
    },
    {
      name: 'Course Materials',
      path: '/trainer-lms/course-materials',
      icon: <MdUpload className="h-5 w-5" />
    },
    {
      name: 'Attendance',
      path: '/trainer-lms/attendance',
      icon: <MdPeopleAlt className="h-5 w-5" />
    },
    {
      name: 'Exam Management',
      path: '/trainer-lms/exams',
      icon: <MdBook className="h-5 w-5" />
    },
    {
      name: 'Grade Management',
      path: '/trainer-lms/grades',
      icon: <MdGrade className="h-5 w-5" />
    },
    {
      name: 'Assessments',
      path: '/trainer-lms/assessment-management',
      icon: <MdAssignment className="h-5 w-5" />
    },
    {
      name: 'Assessment Results',
      path: '/trainer-lms/assessments',
      icon: <MdAssignment className="h-5 w-5" />
    },
    {
      name: 'Certification',
      path: '/trainer-lms/certification',
      icon: <MdVerified className="h-5 w-5" />,
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-tracked-primary shadow-lg border-r border-tracked-primary-dark
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tracked-primary-dark">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 overflow-hidden rounded-lg bg-white p-1">
                <img 
                  src="/smi-logo.jpg" 
                  alt="SMI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SMI TrackEd</h2>
                <p className="text-xs text-blue-200">Trainer Portal</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-tracked-primary-dark hover:cursor-pointer"
            >
              <MdMenu className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-tracked-primary-dark"
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-b border-tracked-primary-dark">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-tracked-secondary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'T'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'Trainer'}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {user?.email || 'trainer@smiinstitute.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-tracked-secondary text-white rounded">
                    Trainer
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative
                  ${isActivePath(item.path)
                    ? 'bg-tracked-secondary text-white shadow-lg border-l-4 border-tracked-secondary-light'
                    : 'text-blue-100 hover:text-white hover:bg-tracked-primary-dark'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className={`${isCollapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {isActivePath(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-tracked-secondary-light rounded-r-full"></div>
                )}
                {!isCollapsed && (
                  <>
                    <span className={`flex-1 ${isActivePath(item.path) ? 'font-semibold' : ''}`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-tracked-primary-dark">
          {!isCollapsed && (
            <div className="space-y-2">
              <Link
                to="/trainer-lms/profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 rounded-md hover:text-white hover:bg-tracked-primary-dark transition-colors"
              >
                <MdPerson className="mr-3 h-4 w-4" />
                Profile Settings
              </Link>
              
              <button
                onClick={trainerLogout}
                className="w-full flex items-center hover:cursor-pointer px-3 py-2 text-sm font-medium text-red-300 rounded-md hover:text-red-100 hover:bg-red-600 transition-colors"
              >
                <MdLogout className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="space-y-2">
              <button
                onClick={trainerLogout}
                className="w-full flex justify-center p-2 text-red-600 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <MdLogout className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainerSidebar;