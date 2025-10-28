import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdSchool, 
  MdFolder, 
  MdSchedule, 
  MdFactCheck, 
  MdQuiz, 
  MdStars, 
  MdWorkspacePremium,
  MdMenu,
  MdClose,
  MdPerson,
  MdLogout
} from 'react-icons/md';
import { studentLogout } from '../../utils/studentAuth';

const Sidebar = ({ user, isOpen, onClose, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/smi-lms/dashboard',
      icon: <MdDashboard className="h-5 w-5" />
    },
    {
      name: 'Class Schedule',
      path: '/smi-lms/schedule',
      icon: <MdSchedule className="h-5 w-5" />
    },
    {
      name: 'Attendance',
      path: '/smi-lms/attendance',
      icon: <MdFactCheck className="h-5 w-5" />
    },
    {
      name: 'Assessments',
      path: '/smi-lms/assessments',
      icon: <MdQuiz className="h-5 w-5" />,
      badge: 3
    },
    {
      name: 'Assessment Results',
      path: '/smi-lms/assessment-results',
      icon: <MdStars className="h-5 w-5" />
    },
    {
      name: 'Certificates',
      path: '/smi-lms/certificates',
      icon: <MdWorkspacePremium className="h-5 w-5" />,
      badge: 2
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    studentLogout();
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
                <h2 className="text-lg font-bold text-white">SMI LMS</h2>
                <p className="text-xs text-blue-200">Learning Portal</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                if (setSidebarOpen) setSidebarOpen(!isCollapsed);
              }}
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
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'Student'}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {user?.email || 'student@smiinstitute.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-tracked-secondary text-white rounded">
                    {user?.student_id || 'Student'}
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
                    {isActivePath(item.path) && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-tracked-secondary-light rounded-full"></div>
                      </div>
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
                to="/smi-lms/profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 rounded-md hover:text-white hover:bg-tracked-primary-dark transition-colors"
              >
                <MdPerson className="mr-3 h-4 w-4" />
                Profile Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex hover:cursor-pointer items-center px-3 py-2 text-sm font-medium text-red-300 rounded-md hover:text-red-100 hover:bg-red-600 transition-colors"
              >
                <MdLogout className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="space-y-2">
              <button
                onClick={handleLogout}
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

export default Sidebar;
