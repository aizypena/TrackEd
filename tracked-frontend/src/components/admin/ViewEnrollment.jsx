import React from 'react';
import {
  MdClose,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCalendarToday,
  MdPerson,
  MdCake,
  MdWc,
  MdPayment,
  MdLocalLibrary,
  MdCheckCircle,
  MdAccessTime,
  MdBlock,
  MdGroups
} from 'react-icons/md';

const ViewEnrollment = ({ isOpen, onClose, enrollment }) => {
  if (!isOpen || !enrollment) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <MdCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <MdAccessTime className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <MdSchool className="w-5 h-5 text-blue-600" />;
      default:
        return <MdBlock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Modal panel */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="bg-tracked-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-tracked-primary">
                    {enrollment.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-semibold">{enrollment.name || 'N/A'}</h3>
                  <p className="text-tracked-secondary text-sm font-medium">{enrollment.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors hover:cursor-pointer"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MdPerson className="h-5 w-5 mr-2 text-tracked-primary" />
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-sm text-gray-900 font-medium">{enrollment.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MdEmail className="h-4 w-4 mr-2 text-gray-400" />
                      {enrollment.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MdPhone className="h-4 w-4 mr-2 text-gray-400" />
                      {enrollment.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                    <p className="text-sm text-gray-900 flex items-start">
                      <MdLocationOn className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{enrollment.address || 'N/A'}</span>
                    </p>
                  </div>
                  {enrollment.date_of_birth && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <MdCake className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(enrollment.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {enrollment.gender && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                      <p className="text-sm text-gray-900 flex items-center capitalize">
                        <MdWc className="h-4 w-4 mr-2 text-gray-400" />
                        {enrollment.gender}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enrollment Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MdSchool className="h-5 w-5 mr-2 text-tracked-primary" />
                  Enrollment Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Student ID</label>
                    <p className="text-sm text-gray-900 font-medium">{enrollment.id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Program</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MdLocalLibrary className="h-4 w-4 mr-2 text-gray-400" />
                      {enrollment.program || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Batch</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MdGroups className="h-4 w-4 mr-2 text-gray-400" />
                      {enrollment.batch || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {getStatusIcon(enrollment.status)}
                      <span className="ml-1 capitalize">{enrollment.status || 'N/A'}</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Payment Method</label>
                    <div className="mt-1">
                      {enrollment.payment_method ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800">
                          <MdPayment className="h-4 w-4 mr-1" />
                          {enrollment.payment_method}
                        </span>
                      ) : enrollment.voucher_eligible ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800">
                          <MdPayment className="h-4 w-4 mr-1" />
                          Voucher (Not Paid)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-800">
                          <MdPayment className="h-4 w-4 mr-1" />
                          No Payment
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Enrollment Date</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MdCalendarToday className="h-4 w-4 mr-2 text-gray-400" />
                      {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Progress */}
            {enrollment.attendance !== undefined && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MdSchool className="h-5 w-5 mr-2 text-tracked-primary" />
                  Academic Progress
                </h4>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                    Attendance Rate
                  </label>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.attendance || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 min-w-[45px]">
                      {enrollment.attendance || 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              title='Close'
              className="px-6 py-2 bg-tracked-primary border border-transparent hover:cursor-pointer rounded-md text-sm font-medium text-white hover:bg-tracked-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracked-primary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEnrollment;
