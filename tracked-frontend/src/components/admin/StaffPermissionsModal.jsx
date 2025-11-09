import { useState, useEffect } from 'react';
import { MdClose, MdCheck, MdExpandMore, MdChevronRight } from 'react-icons/md';

const StaffPermissionsModal = ({ isOpen, onClose, userData, onSave }) => {
  const [permissions, setPermissions] = useState({
    dashboard: true, // Always enabled
    enrollments: {
      enabled: false,
      applications: false,
      records: false,
      documents: false
    },
    students: {
      enabled: false,
      profiles: false,
      academics: false,
      payments: false
    },
    training: {
      enabled: false,
      schedule: false,
      batches: false,
      assessments: false
    },
    inventory: {
      enabled: false,
      equipment: false,
      transactions: false
    },
    analytics: false,
    reports: {
      enabled: false,
      enrollment: false,
      students: false,
      assessments: false,
      inventory: false,
      payments: false
    }
  });

  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (userData?.permissions) {
      setPermissions(userData.permissions);
    } else {
      // Reset to default if no permissions
      setPermissions({
        dashboard: true,
        enrollments: {
          enabled: false,
          applications: false,
          records: false,
          documents: false
        },
        students: {
          enabled: false,
          profiles: false,
          academics: false,
          payments: false
        },
        training: {
          enabled: false,
          schedule: false,
          batches: false,
          assessments: false
        },
        inventory: {
          enabled: false,
          equipment: false,
          transactions: false
        },
        analytics: false,
        reports: {
          enabled: false,
          enrollment: false,
          students: false,
          assessments: false,
          inventory: false,
          payments: false
        }
      });
    }
  }, [userData, isOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleParentToggle = (parent) => {
    if (typeof permissions[parent] === 'boolean') {
      const newValue = !permissions[parent];
      setPermissions(prev => ({
        ...prev,
        [parent]: newValue
      }));
    } else {
      const currentEnabled = permissions[parent]?.enabled || false;
      const newEnabled = !currentEnabled;
      
      const newState = { ...permissions[parent], enabled: newEnabled };
      
      // Toggle all children
      Object.keys(newState).forEach(key => {
        if (key !== 'enabled') {
          newState[key] = newEnabled;
        }
      });
      
      setPermissions(prev => ({
        ...prev,
        [parent]: newState
      }));
    }
  };

  const handleChildToggle = (parent, child) => {
    const currentValue = permissions[parent]?.[child] || false;
    const newValue = !currentValue;
    
    const newState = {
      ...permissions[parent],
      [child]: newValue
    };
    
    // Check if any child is enabled
    const anyChildEnabled = Object.keys(newState)
      .filter(key => key !== 'enabled')
      .some(key => newState[key]);
    
    newState.enabled = anyChildEnabled;
    
    setPermissions(prev => ({
      ...prev,
      [parent]: newState
    }));
  };

  const handleSave = () => {
    onSave(permissions);
  };

  if (!isOpen) return null;

  const permissionConfig = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'View dashboard and statistics',
      type: 'single'
    },
    {
      id: 'enrollments',
      label: 'Application & Enrollment',
      description: 'Manage applications and enrollments',
      type: 'group',
      children: [
        { id: 'applications', label: 'Applications' },
        { id: 'records', label: 'Enrollment Records' },
        { id: 'documents', label: 'Document Management' }
      ]
    },
    {
      id: 'students',
      label: 'Student Records',
      description: 'Access student information',
      type: 'group',
      children: [
        { id: 'profiles', label: 'Student Profiles' },
        { id: 'academics', label: 'Academic Records' },
        { id: 'payments', label: 'Payment Records' }
      ]
    },
    {
      id: 'training',
      label: 'Training & Assessment',
      description: 'Manage training programs',
      type: 'group',
      children: [
        { id: 'schedule', label: 'Training Schedule' },
        { id: 'batches', label: 'Batch Management' },
        { id: 'assessments', label: 'Assessment Results' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory Management',
      description: 'Manage equipment and supplies',
      type: 'group',
      children: [
        { id: 'equipment', label: 'Equipment' },
        { id: 'transactions', label: 'Stock Transactions' }
      ]
    },
    {
      id: 'analytics',
      label: 'Enrollment Trends',
      description: 'View analytics and trends',
      type: 'single'
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'Generate and view reports',
      type: 'group',
      children: [
        { id: 'enrollment', label: 'Enrollment Reports' },
        { id: 'students', label: 'Student Reports' },
        { id: 'assessments', label: 'Assessment Results' },
        { id: 'inventory', label: 'Inventory Reports' },
        { id: 'payments', label: 'Payment Reports' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white my-10">
          {/* Header */}
          <div className="bg-tracked-primary px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Configure Staff Permissions
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:cursor-pointer"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>

          {/* Staff Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Configuring permissions for: <span className="font-semibold text-gray-900">
                {userData?.first_name} {userData?.last_name}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Enable or disable access to specific features in the staff portal
            </p>
          </div>

          {/* Permissions List */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh] bg-white">
            <div className="space-y-3">
              {permissionConfig.map((permission) => (
                <div key={permission.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Parent Permission */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {permission.type === 'group' && (
                          <button
                            onClick={() => toggleSection(permission.id)}
                            className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                          >
                            {expandedSections[permission.id] ? (
                              <MdExpandMore className="h-5 w-5" />
                            ) : (
                              <MdChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {permission.label}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          permission.type === 'single'
                            ? permissions[permission.id]
                            : permissions[permission.id]?.enabled
                        }
                        onChange={() => handleParentToggle(permission.id)}
                        disabled={permission.id === 'dashboard'}
                        className="sr-only"
                      />
                      <div className={`
                        relative w-11 h-6 rounded-full transition-colors
                        ${(permission.type === 'single' ? permissions[permission.id] : permissions[permission.id]?.enabled)
                          ? 'bg-tracked-primary'
                          : 'bg-gray-200'}
                        ${permission.id === 'dashboard' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}>
                        <div className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                          ${(permission.type === 'single' ? permissions[permission.id] : permissions[permission.id]?.enabled)
                            ? 'translate-x-5'
                            : 'translate-x-0'}
                        `} />
                      </div>
                    </label>
                  </div>

                  {/* Child Permissions */}
                  {permission.type === 'group' && expandedSections[permission.id] && (
                    <div className="bg-white border-t border-gray-200">
                      {permission.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between px-4 py-3 pl-16 hover:bg-gray-50"
                        >
                          <span className="text-sm text-gray-700">{child.label}</span>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[permission.id]?.[child.id] || false}
                              onChange={() => handleChildToggle(permission.id, child.id)}
                              disabled={!permissions[permission.id]?.enabled}
                              className="sr-only"
                            />
                            <div className={`
                              relative w-9 h-5 rounded-full transition-colors
                              ${permissions[permission.id]?.[child.id]
                                ? 'bg-tracked-secondary'
                                : 'bg-gray-200'}
                              ${!permissions[permission.id]?.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}>
                              <div className={`
                                absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform
                                ${permissions[permission.id]?.[child.id]
                                  ? 'translate-x-4'
                                  : 'translate-x-0'}
                              `} />
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-tracked-primary rounded-md hover:bg-tracked-primary-dark hover:cursor-pointer"
            >
              <MdCheck className="inline-block h-5 w-5 mr-1" />
              Save Permissions
            </button>
          </div>
        </div>
      </div>
  );
};

export default StaffPermissionsModal;
