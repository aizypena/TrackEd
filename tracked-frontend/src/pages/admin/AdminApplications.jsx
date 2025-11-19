
import React, { useEffect, useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import { MdMenu, MdVisibility, MdDescription, MdImage, MdPictureAsPdf, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';

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
  const [deletePassword, setDeletePassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApplications, setFilteredApplications] = useState([]);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use admin token for authentication
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://api.smitracked.cloud/api/admin/applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        const apps = data.applications || data.data || [];
        setApplications(apps);
        setFilteredApplications(apps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApplications(applications);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = applications.filter(app => {
        const firstName = (app.first_name || '').toLowerCase();
        const lastName = (app.last_name || '').toLowerCase();
        const email = (app.email || '').toLowerCase();
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               email.includes(searchLower);
      });
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  // Log action helper
  const logAction = async (action, description, level = 'info') => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('https://api.smitracked.cloud/api/log-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action,
          description,
          log_level: level
        })
      });
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  // Handle view documents
  const handleViewDocuments = async (applicantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.smitracked.cloud/api/admin/applicants/${applicantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch applicant details');
      const data = await response.json();
      setSelectedApplicant(data.applicant);
      setShowDocumentModal(true);
      
      // Log the action
      await logAction(
        'applicant_documents_viewed',
        `Viewed documents for applicant: ${data.applicant.first_name} ${data.applicant.last_name}`,
        'info'
      );
    } catch (err) {
      toast.error('Error loading applicant details: ' + err.message);
      await logAction(
        'applicant_documents_view_failed',
        `Failed to view documents for applicant ID: ${applicantId}`,
        'error'
      );
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

  // Get voucher eligibility badge
  const getVoucherEligibilityBadge = (voucherEligible) => {
    // Convert to number in case it comes as string from API
    const eligibilityValue = parseInt(voucherEligible) || 0;
    
    const eligibilityConfig = {
      0: { color: 'bg-gray-100 text-gray-800', text: 'Not Eligible' },
      1: { color: 'bg-green-100 text-green-800', text: 'Eligible' },
      2: { color: 'bg-orange-100 text-orange-800', text: 'Waitlisted' }
    };
    
    const config = eligibilityConfig[eligibilityValue] || eligibilityConfig[0];
    return config;
  };

  // Handle edit applicant
  const handleEditApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.smitracked.cloud/api/admin/applicants/${applicantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch applicant details');
      const data = await response.json();
      setSelectedApplicant(data.applicant);
      setShowEditModal(true);
      
      // Log the action
      await logAction(
        'applicant_edit_initiated',
        `Opened edit form for applicant: ${data.applicant.first_name} ${data.applicant.last_name}`,
        'info'
      );
    } catch (err) {
      toast.error('Error loading applicant details: ' + err.message);
      await logAction(
        'applicant_edit_failed',
        `Failed to load applicant for editing, ID: ${applicantId}`,
        'error'
      );
    }
  };

  // Handle delete applicant
  const handleDeleteApplicant = (applicant) => {
    setApplicantToDelete(applicant);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    // Validate password is entered
    if (!deletePassword) {
      alert('Please enter your password to confirm deletion');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      // First verify the admin password
      const verifyResponse = await fetch('https://api.smitracked.cloud/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        toast.error(errorData.message || 'Incorrect password');
        await logAction(
          'applicant_deletion_password_failed',
          `Failed password verification for deleting applicant: ${applicantToDelete.first_name} ${applicantToDelete.last_name}`,
          'warning'
        );
        return;
      }

      // If password is correct, proceed with deletion
      const deleteResponse = await fetch(`https://api.smitracked.cloud/api/admin/applicants/${applicantToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!deleteResponse.ok) throw new Error('Failed to delete applicant');
      
      // Remove from local state
      setApplications(applications.filter(app => app.id !== applicantToDelete.id));
      
      // Log successful deletion
      await logAction(
        'applicant_deleted',
        `Deleted applicant: ${applicantToDelete.first_name} ${applicantToDelete.last_name}`,
        'warning'
      );
      
      setShowDeleteConfirm(false);
      setApplicantToDelete(null);
      setDeletePassword('');
      toast.success('Applicant deleted successfully');
    } catch (err) {
      toast.error('Error deleting applicant: ' + err.message);
      await logAction(
        'applicant_deletion_failed',
        `Failed to delete applicant: ${applicantToDelete.first_name} ${applicantToDelete.last_name}`,
        'error'
      );
    }
  };

  // Handle update applicant
  const handleUpdateApplicant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.smitracked.cloud/api/admin/applicants/${selectedApplicant.id}`, {
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
      
      // Log successful update
      await logAction(
        'applicant_updated',
        `Updated applicant: ${selectedApplicant.first_name} ${selectedApplicant.last_name}`,
        'info'
      );
      
      setShowEditModal(false);
      setSelectedApplicant(null);
      toast.success('Applicant updated successfully');
    } catch (err) {
      toast.error('Error updating applicant: ' + err.message);
      await logAction(
        'applicant_update_failed',
        `Failed to update applicant: ${selectedApplicant.first_name} ${selectedApplicant.last_name}`,
        'error'
      );
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
            <>
              {/* Search Bar */}
              <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-sm text-gray-600 mt-2">
                    Found {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Applications Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Eligibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No applications match your search.' : 'No applications found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-semibold uppercase">
                                {app.first_name && app.last_name
                                  ? `${app.first_name.charAt(0)}${app.last_name.charAt(0)}`
                                  : 'NA'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {capitalizeName(app.first_name)} {capitalizeName(app.last_name)}
                            </div>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVoucherEligibilityBadge(app.voucher_eligible).color}`}>
                            {getVoucherEligibilityBadge(app.voucher_eligible).text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewDocuments(app.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Documents"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditApplicant(app.id)}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors"
                              title="Edit Applicant"
                            >
                              <MdEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplicant(app)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Applicant"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </>
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
                          href={`https://api.smitracked.cloud/api/storage-file/${selectedApplicant.valid_id}`}
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
                          href={`https://api.smitracked.cloud/api/storage-file/${selectedApplicant.transcript}`}
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
                          href={`https://api.smitracked.cloud/api/storage-file/${selectedApplicant.diploma}`}
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
                          href={`https://api.smitracked.cloud/api/storage-file/${selectedApplicant.passport_photo}`}
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
                <p className="text-sm text-red-600 mb-4">
                  This action cannot be undone. All applicant data and documents will be permanently deleted.
                </p>
                
                {/* Password Input */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your password to confirm:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your admin password"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setApplicantToDelete(null);
                    setDeletePassword('');
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
