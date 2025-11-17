import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { staffLogout, getStaffUser } from '../../utils/staffAuth';
import { staffAPI } from '../../services/staffAPI';
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
  MdChevronRight,
  MdRefresh,
  MdLibraryBooks,
  MdReport
} from 'react-icons/md';

const StaffSidebar = ({ user: propUser, isOpen, onClose, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [user, setUser] = useState(() => {
    // Initialize with localStorage data immediately
    return propUser || getStaffUser();
  });
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch fresh user data from API on mount to get latest permissions
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Always start with localStorage/propUser to prevent flashing
      const initialUser = propUser || getStaffUser();
      if (initialUser) {
        setUser(initialUser);
      }

      // Then try to fetch fresh data from API in the background
      try {
        const response = await staffAPI.getProfile();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Error fetching staff profile:', error);
        // Keep the localStorage data if API fails
      }
    };

    fetchUserProfile();
  }, [propUser]);

  // Manual refresh function
  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    try {
      const response = await staffAPI.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
      name: 'Program Management',
      path: '/staff/programs',
      icon: <MdLibraryBooks className="h-5 w-5" />
    },
    {
      name: 'Training & Assessment',
      path: '/staff/training',
      icon: <MdAssignment className="h-5 w-5" />,
      subItems: [
        { name: 'Training Schedule', path: '/staff/training/schedule' },
        { name: 'Batch Management', path: '/staff/training/batches' },
        { name: 'Exam Management', path: '/staff/training/exams' },
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
      name: 'Enrollment Trends',
      path: '/staff/analytics/enrollment',
      icon: <MdAnalytics className="h-5 w-5" />
    },
    {
      name: 'Reports',
      path: '/staff/reports',
      icon: <MdDescription className="h-5 w-5" />,
      subItems: [
        { name: 'Enrollment Reports', path: '/staff/reports/enrollment' },
        { name: 'Student Reports', path: '/staff/reports/students' },
        { name: 'Assessment Results', path: '/staff/reports/assessments' },
        { name: 'Inventory Reports', path: '/staff/reports/inventory' },
        { name: 'Payment Reports', path: '/staff/reports/payments' }
      ]
    },
    {
      name: 'Contact Messages',
      path: '/staff/contact-messages',
      icon: <MdReport className="h-5 w-5" />
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

  // Filter navigation items based on permissions
  useEffect(() => {
    // Parse permissions - handle various formats
    let parsedPermissions = user?.permissions;
    
    // If it's an array (character array from double-encoded JSON), convert to string first
    if (Array.isArray(parsedPermissions)) {
      const permString = Object.values(parsedPermissions)
        .filter(val => typeof val === 'string' || typeof val === 'number')
        .join('');
      try {
        parsedPermissions = JSON.parse(permString);
      } catch (error) {
        console.error('Error parsing permissions from array:', error);
        parsedPermissions = null;
      }
    }
    // If it's an object but looks like a character array
    else if (parsedPermissions && typeof parsedPermissions === 'object' && !parsedPermissions.dashboard && parsedPermissions[0]) {
      const permString = Object.values(parsedPermissions)
        .filter(val => typeof val === 'string' || typeof val === 'number')
        .join('');
      try {
        parsedPermissions = JSON.parse(permString);
      } catch (error) {
        console.error('Error parsing permissions from object:', error);
        parsedPermissions = null;
      }
    }
    // If it's a plain string
    else if (typeof parsedPermissions === 'string') {
      try {
        parsedPermissions = JSON.parse(parsedPermissions);
      } catch (error) {
        console.error('Error parsing permissions string:', error);
        parsedPermissions = null;
      }
    }
    
    // Check if user has permissions defined and it's not null/empty
    if (parsedPermissions && typeof parsedPermissions === 'object' && Object.keys(parsedPermissions).length > 0) {
      const perms = parsedPermissions;
      
      // Create a deep copy of navigation items
      const filtered = navigationItems
        .map(item => {
          // Create a copy with sub-items cloned
          return {
            ...item,
            subItems: item.subItems ? item.subItems.map(sub => ({ ...sub })) : null
          };
        })
        .filter(item => {
          // Dashboard is always visible
          if (item.path === '/staff/dashboard') {
            return true;
          }
          
          // Map item names to permission keys
          const permKeyMap = {
            'Application & Enrollment': 'enrollments',
            'Student Records': 'students',
            'Program Management': 'programs',
            'Training & Assessment': 'training',
            'Inventory Management': 'inventory',
            'Enrollment Trends': 'analytics',
            'Reports': 'reports'
          };
          
          const permKey = permKeyMap[item.name];
          if (!permKey) {
            return true; // Show by default if no mapping
          }
          
          // Check if permission exists and is enabled
          if (typeof perms[permKey] === 'boolean') {
            // Simple boolean permission (like analytics, programs)
            return perms[permKey];
          } else if (perms[permKey] && typeof perms[permKey] === 'object' && perms[permKey].enabled === true) {
            // Group permission with sub-items
            
            // Filter sub-items based on permissions
            if (item.subItems) {
              const subKeyMap = {
                'Applications': 'applications',
                'Enrollment Records': 'records',
                'Document Management': 'documents',
                'Student Profiles': 'profiles',
                'Academic Records': 'academics',
                'Payment Records': 'payments',
                'Training Schedule': 'schedule',
                'Batch Management': 'batches',
                'Exam Management': 'exams',
                'Assessment Results': 'assessments',
                'Equipment': 'equipment',
                'Stock Transactions': 'transactions',
                'Enrollment Reports': 'enrollment',
                'Student Reports': 'students',
                'Inventory Reports': 'inventory',
                'Payment Reports': 'payments'
              };
              
              const filteredSubItems = item.subItems.filter(subItem => {
                const subKey = subKeyMap[subItem.name];
                const permValue = perms[permKey]?.[subKey];
                const hasPermission = subKey && permValue === true;
                return hasPermission;
              });
              
              item.subItems = filteredSubItems;
              return item.subItems.length > 0;
            }
            return true;
          } else {
            // If no specific permission defined, hide it
            return false;
          }
        });
      
      setFilteredNavItems(filtered);
    } else {
      // If no permissions set, show all (backward compatibility)
      setFilteredNavItems(navigationItems);
    }
  }, [user]);

  // Auto-expand sections when their sub-items are active
  useEffect(() => {
    const newExpandedSections = {};
    const itemsToCheck = filteredNavItems.length > 0 ? filteredNavItems : navigationItems;
    itemsToCheck.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => isActivePath(subItem.path));
        if (hasActiveSubItem) {
          newExpandedSections[item.name] = true;
        }
      }
    });
    setExpandedSections(prev => ({ ...prev, ...newExpandedSections }));
  }, [location.pathname, filteredNavItems]);

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
                <p className="text-xs text-blue-200">Staff Portal</p>
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
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'Staff'}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {user?.email || ''}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-tracked-secondary text-white rounded">
                    Staff
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {(filteredNavItems.length > 0 ? filteredNavItems : navigationItems).map((item) => (
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