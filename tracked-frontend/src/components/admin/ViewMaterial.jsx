import React from 'react';
import { MdClose, MdDownload, MdSchool, MdDateRange, MdPerson, MdAttachFile, MdDescription, MdFolder } from 'react-icons/md';

const ViewMaterial = ({ isOpen, onClose, material, onDownload }) => {
  if (!isOpen || !material) return null;

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Video':
        return 'bg-purple-100 text-purple-800';
      case 'Images':
        return 'bg-blue-100 text-blue-800';
      case 'PPT':
        return 'bg-orange-100 text-orange-800';
      case 'Document':
        return 'bg-green-100 text-green-800';
      case 'Audio':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MdDescription className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Material Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Title and Type */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{material.title}</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getFileTypeColor(material.type)}`}>
                {material.type}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">{material.description}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MdSchool className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-500">Program</span>
              </div>
              <p className="text-gray-900 font-medium">{material.program}</p>
            </div>

            {/* File Size */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MdAttachFile className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-500">File Size</span>
              </div>
              <p className="text-gray-900 font-medium">{material.fileSize}</p>
            </div>

            {/* Upload Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MdDateRange className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-500">Upload Date</span>
              </div>
              <p className="text-gray-900 font-medium">
                {new Date(material.uploadDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Uploaded By */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MdPerson className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-500">Uploaded By</span>
              </div>
              <p className="text-gray-900 font-medium">{material.uploadedBy}</p>
            </div>
          </div>

          {/* Download Statistics */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MdDownload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Downloads</p>
                  <p className="text-2xl font-bold text-blue-900">{material.downloads}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  material.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {material.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Section (placeholder) */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <MdFolder className="mx-auto h-16 w-16 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">File preview not available</p>
              <p className="text-xs text-gray-500 mt-1">Download the file to view its contents</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onDownload) {
                onDownload(material);
              } else {
                alert('Download functionality will be implemented');
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-tracked-primary text-white rounded-lg hover:bg-tracked-secondary transition-colors"
          >
            <MdDownload className="h-5 w-5 mr-2" />
            Download Material
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMaterial;
