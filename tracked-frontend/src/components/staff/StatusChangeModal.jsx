import React, { useState } from 'react';
import { MdClose, MdWarning } from 'react-icons/md';

const StatusChangeModal = ({ isOpen, onClose, onConfirm, details, requiresReason = false }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      return; // Don't proceed if reason is required but empty
    }
    onConfirm(reason);
    setReason(''); // Reset reason after confirmation
  };

  const handleClose = () => {
    setReason(''); // Reset reason when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{details.title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MdWarning className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
              details.color === 'red' ? 'text-red-500' : 
              details.color === 'blue' ? 'text-blue-500' : 
              'text-orange-500'
            }`} />
            <p className="text-gray-600">{details.message}</p>
          </div>

          {requiresReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for this action..."
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {!reason.trim() && (
                <p className="mt-1 text-sm text-gray-500">A reason is required to proceed.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={requiresReason && !reason.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              details.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
              details.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {details.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
