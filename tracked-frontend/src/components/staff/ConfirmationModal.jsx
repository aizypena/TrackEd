import React from 'react';
import { MdClose, MdWarning } from 'react-icons/md';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'blue' }) => {
  if (!isOpen) return null;

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-lg bg-white/30 transition-all"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal panel */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full pointer-events-auto">
          {/* Header */}
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <MdWarning className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${colorClasses[confirmColor]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${confirmColor}-500 sm:text-sm transition-colors`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
