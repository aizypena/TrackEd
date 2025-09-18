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
  MdLogout,
  MdDownload,
  MdPlayArrow,
  MdCheckCircle
} from 'react-icons/md';

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/smi-lms-dashboard',
      icon: <MdDashboard className="h-5 w-5" />
    },
    {
      name: 'My Courses',
      path: '/smi-lms-dashboard/courses',
      icon: <MdSchool className="h-5 w-5" />
    },
    {
      name: 'Course Materials',
      path: '/smi-lms-dashboard/materials',
      icon: <MdFolder className="h-5 w-5" />
    },
    {
      name: 'Class Schedule',
      path: '/smi-lms-dashboard/schedule',
      icon: <MdSchedule className="h-5 w-5" />
    },
    {
      name: 'Attendance',
      path: '/smi-lms-dashboard/attendance',
      icon: <MdFactCheck className="h-5 w-5" />
    },
    {
      name: 'Assessments',
      path: '/smi-lms-dashboard/assessments',
      icon: <MdQuiz className="h-5 w-5" />,
      badge: 3
    },
    {
      name: 'Assessment Results',
      path: '/smi-lms-dashboard/results',
      icon: <MdStars className="h-5 w-5" />
    },
    {
      name: 'Certificates',
      path: '/smi-lms-dashboard/certificates',
      icon: <MdWorkspacePremium className="h-5 w-5" />,
      badge: 2
    }
  ];

  const quickActions = [
    {
      name: 'View Course Materials',
      icon: <MdDownload className="h-4 w-4" />,
      action: () => console.log('View Course Materials')
    },
    {
      name: 'Take Assessment',
      icon: <MdQuiz className="h-4 w-4" />,
      action: () => console.log('Take Assessment')
    },
    {
      name: 'Check Attendance',
      icon: <MdCheckCircle className="h-4 w-4" />,
      action: () => console.log('Check Attendance')
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
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
        bg-white shadow-lg border-r border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/smi-logo.jpg" 
                alt="SMI Logo" 
                className="h-8 w-auto"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">SMI LMS</h2>
                <p className="text-xs text-gray-500">Learning Portal</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <MdMenu className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'student@smiinstitute.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Student Access
                  </span>
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    LMS Portal
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
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className={`${isCollapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
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

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="mt-2 space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={action.action}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-3">{action.icon}</span>
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="space-y-2">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <MdPerson className="mr-3 h-4 w-4" />
                Profile Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors"
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
