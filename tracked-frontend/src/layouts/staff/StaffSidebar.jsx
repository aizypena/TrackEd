import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { staffLogout } from '../../utils/staffAuth';
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdAssignment,
  MdInventory,
  MdAnalytics,
  MdDescription,
  MdPerson,
  MdMenu,
  MdClose,
  MdLogout,
  MdExpandMore,
  MdChevronRight
} from 'react-icons/md';

const StaffSidebar = ({ isOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/staff/dashboard',
      icon: <MdDashboard className="h-5 w-5" />
    },
    {
      name: 'Application & Enrollment',
      path: '/staff/enrollments',
      icon: <MdPeople className="h-5 w-5" />,
      subItems: [
        { name: 'Applications', path: '/staff/enrollments/applications' },
        { name: 'Enrollment Records', path: '/staff/enrollments/records' },
        { name: 'Document Management', path: '/staff/enrollments/documents' }
      ]
    },
    {
      name: 'Student Records',
      path: '/staff/students',
      icon: <MdSchool className="h-5 w-5" />,
      subItems: [
        { name: 'Student Profiles', path: '/staff/students/profiles' },
        { name: 'Academic Records', path: '/staff/students/academics' },
        { name: 'Payment Records', path: '/staff/students/payments' }
      ]
    },
    {
      name: 'Training & Assessment',
      path: '/staff/training',
      icon: <MdAssignment className="h-5 w-5" />,
      subItems: [
        { name: 'Training Schedule', path: '/staff/training/schedule' },
        { name: 'Batch Management', path: '/staff/training/batches' },
        { name: 'Assessment Results', path: '/staff/training/assessments' }
      ]
    },
    {
      name: 'Inventory Management',
      path: '/staff/inventory',
      icon: <MdInventory className="h-5 w-5" />,
      subItems: [
        { name: 'Equipment', path: '/staff/inventory/equipment' },
        { name: 'Stock Transactions', path: '/staff/inventory/transactions' }
      ]
    },
    {
      name: 'Entrollment Trends',
      path: '/staff/analytics/enrollment',
      icon: <MdAnalytics className="h-5 w-5" />
    },
    {
      name: 'Reports',
      path: '/staff/reports',
      icon: <MdDescription className="h-5 w-5" />,
      subItems: [
        { name: 'Enrollment Reports', path: '/staff/reports/enrollment' },
        { name: 'Student Progress', path: '/staff/reports/progress' },
        { name: 'Training Outcomes', path: '/staff/reports/outcomes' },
        { name: 'Inventory Reports', path: '/staff/reports/inventory' }
      ]
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
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
        bg-tracked-primary shadow-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
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
                <p className="text-xs text-blue-200">Staff Portal</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-white hover:bg-tracked-primary-dark"
          >
            {isCollapsed ? <MdMenu /> : <MdClose />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => (
            <div key={item.name} className="mb-2">
              {item.subItems ? (
                // Collapsible section
                <>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left hover:cursor-pointer
                      ${isActivePath(item.path) 
                        ? 'bg-tracked-secondary text-white' 
                        : 'text-blue-100 hover:bg-tracked-secondary hover:bg-opacity-90 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {!isCollapsed && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      expandedSections[item.name] 
                        ? <MdExpandMore className="h-5 w-5" />
                        : <MdChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  
                  {!isCollapsed && expandedSections[item.name] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`
                            block px-3 py-1.5 text-sm rounded-md transition-colors hover:cursor-pointer
                            ${isActivePath(subItem.path)
                              ? 'bg-tracked-secondary bg-opacity-90 text-white'
                              : 'text-blue-200 hover:bg-tracked-secondary hover:bg-opacity-75 hover:text-white'}
                          `}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular link (Dashboard)
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md transition-colors hover:cursor-pointer
                    ${isActivePath(item.path) 
                      ? 'bg-tracked-secondary text-white' 
                      : 'text-blue-100 hover:bg-tracked-secondary hover:bg-opacity-90 hover:text-white'}
                  `}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-tracked-primary-dark">
          <Link
            to="/staff/profile"
            className="flex items-center px-3 py-2 text-blue-100 rounded-md hover:bg-tracked-secondary hover:bg-opacity-90 hover:text-white hover:cursor-pointer"
          >
            <MdPerson className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Profile Settings</span>}
          </Link>
          <button
            className="w-full mt-2 flex items-center hover:cursor-pointer px-3 py-2 text-red-300 rounded-md hover:bg-tracked-secondary hover:bg-opacity-90 hover:text-white"
            onClick={staffLogout}
          >
            <MdLogout className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default StaffSidebar;