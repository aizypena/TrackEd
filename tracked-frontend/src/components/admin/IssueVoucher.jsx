import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { batchAPI } from '../../services/batchAPI';
import { voucherAPI } from '../../services/voucherAPI';
import { systemLogAPI } from '../../services/systemLogAPI';

const IssueVoucher = ({ isOpen, onClose, voucher, programs, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Voucher fields
    batchId: voucher?.batch_id || '',
    quantity: voucher?.quantity || '',
    issueDate: voucher?.issueDate || '',
    status: voucher?.status || 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Update form data when voucher prop changes (for editing)
  useEffect(() => {
    if (voucher) {
      // Format date to YYYY-MM-DD for date input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setFormData({
        batchId: voucher.batch_id || '',
        quantity: voucher.quantity || '',
        issueDate: formatDateForInput(voucher.issue_date),
        status: voucher.status || 'active'
      });
    } else {
      // Reset form for creating new voucher
      setFormData({
        batchId: '',
        quantity: '',
        issueDate: '',
        status: 'active'
      });
    }
  }, [voucher]);

  // Fetch batches when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBatches();
    }
  }, [isOpen]);

  const fetchBatches = async () => {
    try {
      // Fetch both batches and vouchers
      const [batchResponse, voucherResponse] = await Promise.all([
        batchAPI.getAll(),
        voucherAPI.getAll()
      ]);

      if (batchResponse.success) {
        // Filter to show only batches that are not completed or cancelled
        const activeBatches = batchResponse.data.filter(
          batch => batch.status !== 'completed' && batch.status !== 'cancelled'
        );

        // If vouchers were fetched successfully, filter out batches that already have vouchers
        if (voucherResponse.success) {
          const batchesWithVouchers = new Set(
            voucherResponse.data.map(voucher => voucher.batch_id)
          );
          
          // Only show batches that don't have vouchers yet
          const batchesWithoutVouchers = activeBatches.filter(
            batch => !batchesWithVouchers.has(batch.batch_id)
          );
          
          setAvailableBatches(batchesWithoutVouchers);
        } else {
          // If voucher fetch failed, show all active batches
          setAvailableBatches(activeBatches);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
      setAvailableBatches([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If batch is selected, find and set the selected batch details
    if (name === 'batchId') {
      const batch = availableBatches.find(b => b.batch_id === value);
      setSelectedBatch(batch || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we're editing an existing voucher
    if (voucher) {
      // Edit mode - update existing voucher
      try {
        setSubmitting(true);
        
        const updateData = {
          quantity: parseInt(formData.quantity),
          issue_date: formData.issueDate,
          status: formData.status
        };
        
        const response = await voucherAPI.update(voucher.id, updateData);
        
        if (response.success) {
          // Log the action
          await systemLogAPI.logAction(
            'voucher_updated',
            `Updated voucher ${voucher.voucher_id}: quantity=${formData.quantity}, status=${formData.status}`,
            'info'
          );
          
          toast.success('Voucher updated successfully!');
          onClose();
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        console.error('Error updating voucher:', error);
        
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
            toast.error(`${key}: ${error.errors[key].join(', ')}`);
          });
        } else {
          toast.error(error.message || 'Failed to update voucher');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }
    
    // Create mode - validation for new voucher
    if (!formData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    // Validate voucher quantity doesn't exceed batch capacity
    if (selectedBatch && parseInt(formData.quantity) > parseInt(selectedBatch.max_students)) {
      toast.error(`Voucher quantity (${formData.quantity}) cannot exceed batch capacity (${selectedBatch.max_students})`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create the voucher for the selected batch
      const voucherData = {
        batch_id: formData.batchId,
        quantity: parseInt(formData.quantity),
        issue_date: formData.issueDate,
        status: formData.status
      };
      
      const voucherResponse = await voucherAPI.create(voucherData);

      if (voucherResponse.success) {
        // Log the action
        await systemLogAPI.logAction(
          'voucher_issued',
          `Issued ${formData.quantity} vouchers to batch ${formData.batchId} (${selectedBatch?.program?.title || 'Unknown Program'})`,
          'info'
        );
        
        toast.success('Voucher issued successfully!');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error issuing voucher:', error);
      
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          toast.error(`${key}: ${error.errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.message || 'Failed to issue voucher');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {voucher ? 'Edit Voucher' : 'Issue Voucher to Existing Batch'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:cursor-pointer"
            title="Close"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Show batch selection only when creating new */}
          {!voucher && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b">Select Batch</h4>
              <div className="space-y-4">
                {availableBatches.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No Available Batches</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          All active batches already have vouchers issued. Please create a new batch first or check if existing vouchers need to be deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch *</label>
                    <select
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select an existing batch</option>
                      {availableBatches.map(batch => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_id} - {batch.program?.title || 'Unknown Program'} 
                          {' '}({batch.status})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a batch to issue vouchers to. Only batches without existing vouchers are shown.
                    </p>
                  </div>
                )}

                {/* Show selected batch details */}
                {selectedBatch && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Batch Details</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Program:</span>
                        <p className="font-medium text-gray-900">{selectedBatch.program?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Trainer:</span>
                        <p className="font-medium text-gray-900">
                          {selectedBatch.trainer?.first_name} {selectedBatch.trainer?.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Students:</span>
                        <p className="font-medium text-gray-900">{selectedBatch.max_students}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-medium text-gray-900 capitalize">{selectedBatch.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Start Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedBatch.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">End Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedBatch.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Schedule:</span>
                        <p className="font-medium text-gray-900">
                          {selectedBatch.schedule_days?.join(', ')} | {selectedBatch.schedule_time_start} - {selectedBatch.schedule_time_end}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voucher Information Section */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b">Voucher Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Voucher Quantity (Subsidized Slots) *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20"
                  min="1"
                  max={selectedBatch?.max_students || undefined}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number of vouchers to issue {selectedBatch ? `(max: ${selectedBatch.max_students})` : '(select a batch first)'}
                </p>
                {formData.quantity && selectedBatch && parseInt(formData.quantity) > parseInt(selectedBatch.max_students) && (
                  <p className="mt-1 text-xs text-red-500">
                    ⚠️ Voucher quantity cannot exceed batch capacity
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Voucher Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          {selectedBatch && formData.quantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will issue <strong>{formData.quantity} vouchers</strong> to the selected batch 
                (Batch {selectedBatch.batch_id} - {selectedBatch.program?.title}). 
                The batch has a total capacity of <strong>{selectedBatch.max_students} students</strong>.
                {parseInt(formData.quantity) < parseInt(selectedBatch.max_students) && (
                  <span> The remaining {parseInt(selectedBatch.max_students) - parseInt(formData.quantity)} slots will be available for self-funded students.</span>
                )}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!voucher && availableBatches.length === 0)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? (voucher ? 'Updating...' : 'Issuing...') 
                : (voucher ? 'Update Voucher' : 'Issue Voucher')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueVoucher;
