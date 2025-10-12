import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { batchAPI } from '../../services/batchAPI';
import { voucherAPI } from '../../services/voucherAPI';

const IssueVoucher = ({ isOpen, onClose, voucher, programs, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: voucher?.quantity || '',
    issueDate: voucher?.issueDate || '',
    status: voucher?.status || 'pending',
    batchId: voucher?.batchId || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [batches, setBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  // Fetch batches when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBatches();
      fetchVouchers();
    }
  }, [isOpen]);

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await voucherAPI.getAll();
      if (response.success) {
        // Get batch IDs that already have vouchers
        const usedBatchIds = response.data.map(v => v.batch_id);
        
        // Filter batches - if editing, allow current batch; otherwise exclude used batches
        const filtered = batches.filter(batch => 
          voucher ? (batch.batch_id === voucher.batch_id || !usedBatchIds.includes(batch.batch_id)) 
                  : !usedBatchIds.includes(batch.batch_id)
        );
        setAvailableBatches(filtered);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  // Update available batches when batches change
  useEffect(() => {
    if (batches.length > 0) {
      fetchVouchers();
    }
  }, [batches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const submitData = {
        batch_id: formData.batchId,
        quantity: parseInt(formData.quantity),
        issue_date: formData.issueDate,
        status: formData.status
      };
      
      let response;
      if (voucher) {
        response = await voucherAPI.update(voucher.id, submitData);
      } else {
        response = await voucherAPI.create(submitData);
      }

      if (response.success) {
        toast.success(voucher ? 'Voucher updated successfully!' : 'Voucher issued successfully!');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      
      if (error.errors) {
        // Check for unique constraint error
        if (error.errors.batch_id) {
          toast.error('A voucher has already been issued for this batch. Please select a different batch.');
        } else {
          Object.keys(error.errors).forEach(key => {
            toast.error(`${key}: ${error.errors[key].join(', ')}`);
          });
        }
      } else {
        toast.error(error.message || 'Failed to save voucher');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {voucher ? 'Edit Voucher' : 'Issue New Voucher'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:cursor-pointer"
            title="Close"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch *</label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a batch</option>
                {availableBatches.map(batch => (
                  <option key={batch.id} value={batch.batch_id}>
                    {batch.batch_id} - {batch.program?.title || 'Unknown Program'}
                  </option>
                ))}
              </select>
              {!voucher && availableBatches.length === 0 && batches.length > 0 && (
                <p className="mt-1 text-xs text-red-500">All batches already have vouchers issued</p>
              )}
              {!voucher && availableBatches.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">Only batches without vouchers are shown</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50"
                min="1"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Number of vouchers to issue</p>
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
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="issued">Issued</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (voucher ? 'Update Voucher' : 'Issue Voucher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueVoucher;
