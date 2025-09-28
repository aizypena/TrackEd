import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard,
  MdPeople,
  MdSchool,
  MdAssignment,
  MdTrendingUp,
  MdSettings,
  MdReport,
  MdAnalytics,
  MdInsights,
  MdBarChart,
  MdShowChart,
  MdAssessment,
  MdSecurity,
  MdHistory,
  MdBackup,
  MdCardGiftcard,
  MdLocalLibrary,
  MdGroup,
  MdAttachMoney,
  MdVerified,
  MdBook,
  MdExpandMore,
  MdExpandLess,
  MdLogout,
  MdBusiness,
  MdAccountCircle,
  MdFileDownload,
} from 'react-icons/md';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize all menus as expanded but allow toggling
  const [expandedMenus, setExpandedMenus] = useState({
    'user-management': true,
    'program-management': true,
    'reports': true,
    'system': true
  });

  // Toggle menu expansion
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Get admin user info from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Menu structure based on TrackEd system requirements
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      icon: MdDashboard,
      path: '/admin/dashboard',
      badge: null
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: MdPeople,
      submenu: [
        { id: 'all-users', name: 'All Users', icon: MdPeople, path: '/admin/all-users' },
        { id: 'applications', name: 'Applications', icon: MdAssignment, path: '/admin/applications', badge: '23' },
        { id: 'enrollments', name: 'Enrollments', icon: MdSchool, path: '/admin/enrollments' }
      ]
    },
    {
      id: 'program-management',
      name: 'Program Management',
      icon: MdBook,
      submenu: [
        { id: 'courses', name: 'Course Programs', icon: MdLocalLibrary, path: '/admin/course-programs' },
        { id: 'batches', name: 'Batch Management', icon: MdGroup, path: '/admin/batch-management' },
        { id: 'tesda-vouchers', name: 'TESDA Vouchers', icon: MdCardGiftcard, path: '/admin/voucher-management' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports Management',
      icon: MdAssessment,
      submenu: [
        { id: 'enrollment-reports', name: 'Enrollment Reports', icon: MdSchool, path: '/admin/enrollment-reports' },
        { id: 'enrollment-trends', name: 'Enrollment Trends', icon: MdTrendingUp, path: '/admin/enrollment-trends' },
        { id: 'arima-forecasting', name: 'ARIMA Forecasting', icon: MdShowChart, path: '/admin/arima-forecasting', badge: 'NEW' },
        { id: 'assessment-reports', name: 'Assessment Results', icon: MdVerified, path: '/admin/assessment-results' },
        { id: 'inventory-reports', name: 'Inventory Usage', icon: MdLocalLibrary, path: '/admin/inventory-usage' },
        { id: 'student-reports', name: 'Student List', icon: MdPeople, path: '/admin/student-list' }
      ]
    },
    {
      id: 'system',
      name: 'System Management',
      icon: MdSettings,
      submenu: [
        { id: 'system-settings', name: 'System Settings', icon: MdSettings, path: '/admin/system-settings' },
        { id: 'system-logs', name: 'System Logs', icon: MdHistory, path: '/admin/system-logs' },
        { id: 'backup-restore', name: 'Backup & Restore', icon: MdBackup, path: '/admin/backup' }
      ]
    }
  ];

  // Handle navigation
  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      if (onClose) onClose(); // Close sidebar on mobile after navigation
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  // Check if current path matches menu item
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Check if any submenu item is active
  const hasActiveSubmenu = (submenu) => {
    return submenu?.some(item => isActiveRoute(item.path));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-80 h-screen bg-white shadow-lg flex flex-col
        ${isOpen ? 'fixed top-0 left-0 z-50 transform translate-x-0' : 'fixed top-0 left-0 z-50 transform -translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MdBusiness className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TrackEd Admin</h1>
              <p className="text-blue-100 text-sm">iTCMS Dashboard</p>
            </div>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MdAccountCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                {adminUser.name || 'System Administrator'}
              </p>
              <p className="text-gray-500 text-xs">
                {adminUser.email || 'admin@smi.edu.ph'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {/* Main Menu Item */}
                <div
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                    cursor-pointer
                    ${item.highlight ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : ''}
                    ${isActiveRoute(item.path) || hasActiveSubmenu(item.submenu) 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => {
                    if (item.submenu) {
                      toggleMenu(item.id);
                    } else if (item.path) {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 ${
                      item.highlight ? 'text-purple-600' : 
                      (isActiveRoute(item.path) || hasActiveSubmenu(item.submenu)) ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium text-sm ${
                      item.highlight ? 'text-purple-800' : ''
                    }`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.submenu && (
                    <div className="ml-2">
                      {expandedMenus[item.id] ? (
                        <MdExpandLess className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdExpandMore className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu Items */}
                {item.submenu && expandedMenus[item.id] && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.submenu.map((subItem) => (
                      <div
                        key={subItem.id}
                        className={`
                          flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200
                          ${isActiveRoute(subItem.path) 
                            ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        onClick={() => handleNavigation(subItem.path)}
                      >
                        <div className="flex items-center space-x-3">
                          <subItem.icon className={`h-4 w-4 ${
                            isActiveRoute(subItem.path) ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <span className="text-sm">{subItem.name}</span>
                        </div>
                        {subItem.badge && (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            subItem.badge === 'NEW' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subItem.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {/* System Status */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">System Operational</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center hover:cursor-pointer justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 border border-red-200"
          >
            <MdLogout className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>

          {/* SMI Institute Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              © 2025 SMI Institute Inc.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
