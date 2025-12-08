import React, { useState, useEffect } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import { getStaffToken } from '../../utils/staffAuth';
import toast from 'react-hot-toast';

const EditEnrollmentModal = ({ isOpen, onClose, enrollment, programs, batches, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: '',
    program_id: '',
    batch_id: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (enrollment) {
      // Find the matching program - check both title and name fields
      const matchingProgram = programs.find(p => 
        p.title === enrollment.program || p.name === enrollment.program
      );
      
      // Find the matching batch
      const matchingBatch = batches.find(b => b.batch_id === enrollment.batch);
      
      setFormData({
        status: enrollment.status?.toLowerCase() || '',
        program_id: matchingProgram ? matchingProgram.id : '',
        batch_id: matchingBatch ? matchingBatch.id : ''
      });
    }
  }, [enrollment, batches, programs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If program changes, clear the batch selection
    if (name === 'program_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        batch_id: '' // Reset batch when program changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Filter batches based on selected program
  const filteredBatches = formData.program_id 
    ? batches.filter(batch => batch.program_id == formData.program_id)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = getStaffToken();
      const response = await fetch(`https://api.smitracked.cloud/api/staff/enrollments/${enrollment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Enrollment updated successfully!');
        onUpdate(); // Refresh the enrollments list
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Check if form is valid (if program is selected, batch must be selected too)
  const isFormValid = !formData.program_id || (formData.program_id && formData.batch_id);

  if (!isOpen || !enrollment) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Enrollment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900 font-medium">{enrollment.student_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Student ID:</span>
                <span className="ml-2 text-gray-900 font-medium">{enrollment.student_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Enrollment ID:</span>
                <span className="ml-2 text-gray-900 font-medium">{enrollment.enrollment_id}</span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Enrollment Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tracked-primary focus:border-tracked-primary"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tracked-primary focus:border-tracked-primary"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.title || program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleChange}
                  disabled={!formData.program_id}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tracked-primary focus:border-tracked-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.program_id ? 'Select Batch' : 'Select a program first'}
                  </option>
                  {filteredBatches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_id}
                    </option>
                  ))}
                </select>
                {formData.program_id && filteredBatches.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No batches available for this program
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:cursor-pointer border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isFormValid}
              className="inline-flex items-center hover:cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-tracked-primary hover:bg-tracked-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracked-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <MdSave className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEnrollmentModal;
