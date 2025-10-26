import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { batchAPI } from '../../services/batchAPI';
import { voucherAPI } from '../../services/voucherAPI';
import { programAPI } from '../../services/programAPI';
import { userAPI } from '../../services/userAPI';

const IssueVoucher = ({ isOpen, onClose, voucher, programs, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Voucher fields
    quantity: voucher?.quantity || '',
    issueDate: voucher?.issueDate || '',
    status: voucher?.status || 'active',
    
    // Batch fields (for creating new batch)
    programId: voucher?.programId || '',
    trainerId: voucher?.trainerId || '',
    scheduleDays: voucher?.scheduleDays || [],
    scheduleTimeStart: voucher?.scheduleTimeStart || '08:00',
    scheduleTimeEnd: voucher?.scheduleTimeEnd || '17:00',
    batchStatus: voucher?.batchStatus || 'not started',
    startDate: voucher?.startDate || '',
    endDate: voucher?.endDate || '',
    maxStudents: voucher?.maxStudents || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch programs and trainers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPrograms();
      fetchTrainers();
    }
  }, [isOpen]);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAll();
      if (response.success) {
        // Filter to show only available programs
        const availableOnly = response.data.filter(program => program.availability === 'available');
        setAvailablePrograms(availableOnly);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
      setAvailablePrograms([]); // Set to empty array on error
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await userAPI.getTrainers();
      if (response.success) {
        setAvailableTrainers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
      setAvailableTrainers([]); // Set to empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.scheduleDays.length === 0) {
      toast.error('Please select at least one schedule day');
      return;
    }

    // Validate voucher quantity doesn't exceed batch capacity
    if (parseInt(formData.quantity) > parseInt(formData.maxStudents)) {
      toast.error(`Voucher quantity (${formData.quantity}) cannot exceed batch capacity (${formData.maxStudents})`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Step 1: Create the batch first
      const batchData = {
        program_id: formData.programId,
        trainer_id: formData.trainerId,
        schedule_days: formData.scheduleDays,
        schedule_time_start: formData.scheduleTimeStart,
        schedule_time_end: formData.scheduleTimeEnd,
        status: formData.batchStatus,
        start_date: formData.startDate,
        end_date: formData.endDate,
        max_students: parseInt(formData.maxStudents)
      };
      
      const batchResponse = await batchAPI.create(batchData);
      
      if (!batchResponse.success) {
        throw new Error(batchResponse.message || 'Failed to create batch');
      }
      
      const createdBatch = batchResponse.data;
      
      // Step 2: Create the voucher linked to the batch
      const voucherData = {
        batch_id: createdBatch.batch_id,
        quantity: parseInt(formData.quantity),
        issue_date: formData.issueDate,
        status: formData.status
      };
      
      const voucherResponse = await voucherAPI.create(voucherData);

      if (voucherResponse.success) {
        toast.success('Batch and voucher created successfully!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        // If voucher creation fails, we might want to delete the batch
        toast.error('Batch created but voucher issuance failed. Please try issuing voucher separately.');
        if (onSuccess) onSuccess(); // Refresh the list anyway
        onClose();
      }
    } catch (error) {
      console.error('Error creating batch and voucher:', error);
      
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          toast.error(`${key}: ${error.errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.message || 'Failed to create batch and voucher');
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
            Create Batch & Issue Voucher
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
          {/* Batch Information Section */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b">Batch Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Program *</label>
                <select
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a program</option>
                  {availablePrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Trainer *</label>
                <select
                  name="trainerId"
                  value={formData.trainerId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a trainer</option>
                  {availableTrainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.first_name} {trainer.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                <input
                  type="time"
                  name="scheduleTimeStart"
                  value={formData.scheduleTimeStart}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time *</label>
                <input
                  type="time"
                  name="scheduleTimeEnd"
                  value={formData.scheduleTimeEnd}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Students (Batch Capacity) *</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 30"
                  min="1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Total capacity of the batch (all students)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Status *</label>
                <select
                  name="batchStatus"
                  value={formData.batchStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="not started">Not Started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days *</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        formData.scheduleDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {formData.scheduleDays.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Please select at least one day</p>
                )}
              </div>
            </div>
          </div>

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
                  max={formData.maxStudents || undefined}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number of vouchers to issue (must be ≤ max students: {formData.maxStudents || 'not set'})
                </p>
                {formData.quantity && formData.maxStudents && parseInt(formData.quantity) > parseInt(formData.maxStudents) && (
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

            {/* Explanation Card */}
            {/* <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Understanding the Difference</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Max Students:</strong> Total batch capacity (all students, voucher or not)</li>
                      <li><strong>Voucher Quantity:</strong> Number of subsidized/free slots available</li>
                      <li><strong>Example:</strong> Batch of 30 students, but only 20 vouchers = 20 free slots + 10 paying students</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will create a new batch with <strong>{formData.maxStudents || '0'} total slots</strong> and 
              issue <strong>{formData.quantity || '0'} vouchers</strong> for subsidized enrollment. 
              The remaining {formData.maxStudents && formData.quantity ? Math.max(0, parseInt(formData.maxStudents) - parseInt(formData.quantity)) : '0'} slots 
              will be available for self-funded students.
            </p>
          </div>
          
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
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Batch & Issue Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueVoucher;
