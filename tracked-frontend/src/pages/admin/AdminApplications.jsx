
import React, { useEffect, useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import { MdMenu, MdVisibility, MdDescription, MdImage, MdPictureAsPdf, MdEdit, MdDelete } from 'react-icons/md';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState(null);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use admin token for authentication
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:8000/api/admin/applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        setApplications(data.applications || data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // Handle view documents
  const handleViewDocuments = async (applicantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/applicants/${applicantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch applicant details');
      const data = await response.json();
      setSelectedApplicant(data.applicant);
      setShowDocumentModal(true);
    } catch (err) {
      alert('Error loading applicant details: ' + err.message);
    }
  };

  const getDocumentIcon = (docType) => {
    if (!docType) return <MdDescription className="w-5 h-5" />;
    const lower = docType.toLowerCase();
    if (lower.includes('pdf')) return <MdPictureAsPdf className="w-5 h-5" />;
    if (lower.includes('image') || lower.includes('jpg') || lower.includes('png')) return <MdImage className="w-5 h-5" />;
    return <MdDescription className="w-5 h-5" />;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Handle edit applicant
  const handleEditApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/applicants/${applicantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch applicant details');
      const data = await response.json();
      setSelectedApplicant(data.applicant);
      setShowEditModal(true);
    } catch (err) {
      alert('Error loading applicant details: ' + err.message);
    }
  };

  // Handle delete applicant
  const handleDeleteApplicant = (applicant) => {
    setApplicantToDelete(applicant);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/applicants/${applicantToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete applicant');
      
      // Remove from local state
      setApplications(applications.filter(app => app.id !== applicantToDelete.id));
      setShowDeleteConfirm(false);
      setApplicantToDelete(null);
      alert('Applicant deleted successfully');
    } catch (err) {
      alert('Error deleting applicant: ' + err.message);
    }
  };

  // Handle update applicant
  const handleUpdateApplicant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/applicants/${selectedApplicant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: selectedApplicant.first_name,
          last_name: selectedApplicant.last_name,
          email: selectedApplicant.email,
          phone: selectedApplicant.phone,
          application_status: selectedApplicant.application_status
        })
      });
      
      if (!response.ok) throw new Error('Failed to update applicant');
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplicant.id ? { ...app, ...selectedApplicant } : app
      ));
      
      setShowEditModal(false);
      setSelectedApplicant(null);
      alert('Applicant updated successfully');
    } catch (err) {
      alert('Error updating applicant: ' + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop: Always visible, Mobile: Toggle */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Applications Management</h2>
              <p className="text-sm text-gray-600 mt-1">Review and manage applicant submissions</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <MdMenu className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">No applications found.</td>
                    </tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {capitalizeName(app.first_name)} {capitalizeName(app.last_name)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm text-gray-900">{app.email || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{app.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.course_program || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.application_status)}`}>
                            {formatStatus(app.application_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDocuments(app.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="View Documents"
                            >
                              <MdVisibility className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditApplicant(app.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                              title="Edit Applicant"
                            >
                              <MdEdit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteApplicant(app)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Delete Applicant"
                            >
                              <MdDelete className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Document Modal */}
        {showDocumentModal && selectedApplicant && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {capitalizeName(selectedApplicant.first_name)} {capitalizeName(selectedApplicant.last_name)}'s Documents
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Program: {selectedApplicant.course_program || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedApplicant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Applicant Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Applicant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-900">{selectedApplicant.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedApplicant.application_status)}`}>
                        {formatStatus(selectedApplicant.application_status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date Submitted:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Valid ID */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon('id')}
                          <span className="font-medium text-gray-900">Valid ID</span>
                        </div>
                        {selectedApplicant.valid_id && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {selectedApplicant.valid_id ? (
                        <a
                          href={`http://localhost:8000/storage/${selectedApplicant.valid_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
                        >
                          <MdVisibility className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No document uploaded</span>
                      )}
                    </div>

                    {/* Transcript */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon('transcript')}
                          <span className="font-medium text-gray-900">Transcript of Records</span>
                        </div>
                        {selectedApplicant.transcript && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {selectedApplicant.transcript ? (
                        <a
                          href={`http://localhost:8000/storage/${selectedApplicant.transcript}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
                        >
                          <MdVisibility className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No document uploaded</span>
                      )}
                    </div>

                    {/* Diploma */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon('diploma')}
                          <span className="font-medium text-gray-900">Diploma/Certificate</span>
                        </div>
                        {selectedApplicant.diploma && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {selectedApplicant.diploma ? (
                        <a
                          href={`http://localhost:8000/storage/${selectedApplicant.diploma}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
                        >
                          <MdVisibility className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No document uploaded</span>
                      )}
                    </div>

                    {/* Passport Photo */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon('photo')}
                          <span className="font-medium text-gray-900">Passport Photo</span>
                        </div>
                        {selectedApplicant.passport_photo && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                      {selectedApplicant.passport_photo ? (
                        <a
                          href={`http://localhost:8000/storage/${selectedApplicant.passport_photo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
                        >
                          <MdVisibility className="w-4 h-4 mr-1" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No document uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedApplicant(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedApplicant && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Applicant</h3>
                  <p className="text-sm text-gray-600 mt-1">Update applicant information</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedApplicant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateApplicant} className="p-6">
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={selectedApplicant.first_name || ''}
                      onChange={(e) => setSelectedApplicant({...selectedApplicant, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={selectedApplicant.last_name || ''}
                      onChange={(e) => setSelectedApplicant({...selectedApplicant, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedApplicant.email || ''}
                      onChange={(e) => setSelectedApplicant({...selectedApplicant, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={selectedApplicant.phone || ''}
                      onChange={(e) => setSelectedApplicant({...selectedApplicant, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Application Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Status
                    </label>
                    <select
                      value={selectedApplicant.application_status || 'pending'}
                      onChange={(e) => setSelectedApplicant({...selectedApplicant, application_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedApplicant(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && applicantToDelete && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-red-900">Confirm Delete</h3>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the application for{' '}
                  <span className="font-semibold">
                    {capitalizeName(applicantToDelete.first_name)} {capitalizeName(applicantToDelete.last_name)}
                  </span>?
                </p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. All applicant data and documents will be permanently deleted.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setApplicantToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Applicant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
