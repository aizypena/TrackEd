import React from 'react';
import { 
  MdClose, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdVerified,
  MdBlock,
  MdDateRange,
  MdSchool,
  MdPerson,
  MdSupervisorAccount,
  MdPeople
} from 'react-icons/md';

function ViewUser({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <MdSupervisorAccount className="h-5 w-5 text-purple-600" />;
      case 'instructor':
        return <MdSchool className="h-5 w-5 text-blue-600" />;
      case 'student':
        return <MdPerson className="h-5 w-5 text-green-600" />;
      default:
        return <MdPeople className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MdVerified className="h-5 w-5 text-green-600" />;
      case 'inactive':
        return <MdBlock className="h-5 w-5 text-red-600" />;
      default:
        return <MdDateRange className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:cursor-pointer"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* User Basic Info */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-600">
                {`${user.first_name[0]}${user.last_name[0]}`}
              </span>
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-gray-900">
                {`${user.first_name} ${user.last_name}`}
              </h3>
              <div className="mt-1 flex items-center">
                {getRoleIcon(user.role)}
                <span className="ml-2 text-sm text-gray-500 capitalize">{user.role}</span>
              </div>
              <div className="mt-1 flex items-center">
                {getStatusIcon(user.status)}
                <span className="ml-2 text-sm text-gray-500 capitalize">{user.status}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MdEmail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MdPhone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.phone_number}</span>
              </div>
              <div className="flex items-center text-sm">
                <MdLocationOn className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.address}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Program/Course</h4>
              <p className="text-sm text-gray-600">{user.course_program || 'Not assigned'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Member Since</h4>
              <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
            </div>
            {user.last_login_at && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Last Login</h4>
                <p className="text-sm text-gray-600">{formatDate(user.last_login_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center hover:cursor-pointer rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewUser;
