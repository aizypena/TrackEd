import React, { useState } from 'react';
import { MdClose, MdDelete, MdWarning } from 'react-icons/md';

const DeleteEnrollmentModal = ({ isOpen, onClose, enrollment, onDelete }) => {
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setDeleting(true);
    setError('');
    
    try {
      await onDelete(enrollment.user_id, password);
      // Reset form
      setPassword('');
      onClose();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      setError(error.message || 'Failed to delete enrollment. Please check your password and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen || !enrollment) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <MdWarning className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Message */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                You are about to delete the following student enrollment:
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Name:</span> {enrollment.name}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Student ID:</span> {enrollment.id}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Program:</span> {enrollment.program || 'N/A'}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Batch:</span> {enrollment.batch || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. All student data, grades, attendance records, and related information will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your admin password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your password"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 hover:cursor-pointer border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting || !password}
              className="inline-flex items-center hover:cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <MdDelete className="h-4 w-4 mr-2" />
                  Delete Enrollment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteEnrollmentModal;
