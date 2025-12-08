import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { batchAPI } from '../../services/batchAPI';
import { userAPI } from '../../services/userAPI';
import { getStaffToken } from '../../utils/staffAuth';
import toast from 'react-hot-toast';

const AddBatch = ({ isOpen, onClose, batch, programs, onSuccess }) => {
  const [formData, setFormData] = useState({
    program_id: '',
    trainer_id: '',
    schedule_days: [],
    schedule_time_start: '',
    schedule_time_end: '',
    status: 'not started',
    start_date: '',
    end_date: '',
    max_students: 30
  });
  const [submitting, setSubmitting] = useState(false);
  const [trainers, setTrainers] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch trainers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTrainers();
    }
  }, [isOpen]);

  const fetchTrainers = async () => {
    try {
      // Try to get token from either staff or admin
      const token = getStaffToken() || sessionStorage.getItem('adminToken');
      
      const response = await fetch('https://api.smitracked.cloud/api/users?role=trainer&status=active', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Trainers fetched:', data.data);
        setTrainers(data.data || []);
      } else {
        console.error('Failed to fetch trainers:', data.message);
        toast.error('Failed to load trainers');
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
    }
  };

  useEffect(() => {
    if (batch) {
      // Format dates properly for the date input
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      // Format time to HH:mm (remove seconds if present)
      const formatTime = (timeString) => {
        if (!timeString) return '';
        // If time has seconds (HH:mm:ss), remove them
        return timeString.substring(0, 5);
      };

      setFormData({
        program_id: batch.program_id || '',
        trainer_id: batch.trainer_id || '',
        schedule_days: batch.schedule_days || [],
        schedule_time_start: formatTime(batch.schedule_time_start),
        schedule_time_end: formatTime(batch.schedule_time_end),
        status: batch.status || 'not started',
        start_date: formatDate(batch.start_date),
        end_date: formatDate(batch.end_date),
        max_students: batch.max_students || 30
      });
    } else {
      setFormData({
        program_id: '',
        trainer_id: '',
        schedule_days: [],
        schedule_time_start: '',
        schedule_time_end: '',
        status: 'not started',
        start_date: '',
        end_date: '',
        max_students: 30
      });
    }
  }, [batch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.schedule_days.length === 0) {
      toast.error('Please select at least one day for the schedule');
      return;
    }

    try {
      setSubmitting(true);
      let response;
      
      // Prepare data - convert empty strings to null for optional date fields
      const submitData = {
        ...formData,
        trainer_id: formData.trainer_id || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };
      
      // Log the data being sent
      console.log('Submitting batch data:', submitData);
      console.log('Trainer ID being sent:', submitData.trainer_id, typeof submitData.trainer_id);
      
      if (batch) {
        response = await batchAPI.update(batch.id, submitData);
      } else {
        response = await batchAPI.create(submitData);
      }

      // console.log('API Response:', response);

      if (response.success) {
        // Get staff user info for logging
        const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';
        
        // Get program name for better logging
        const programName = programs.find(p => p.id == submitData.program_id)?.title || 'Unknown Program';
        const batchId = response.data?.batch_id || batch?.batch_id || 'New Batch';
        
        // Log successful action
        await logAction(
          batch ? 'batch_updated' : 'batch_created',
          batch 
            ? `${staffName} updated batch ${batchId} (${programName}) - Status: ${submitData.status}, Max Students: ${submitData.max_students}` 
            : `${staffName} created new batch for ${programName} - Days: ${submitData.schedule_days.join(', ')}, Time: ${submitData.schedule_time_start}-${submitData.schedule_time_end}`,
          'info'
        );
        
        toast.success(batch ? 'Batch updated successfully!' : 'Batch created successfully!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        // Log failure
        await logAction(
          batch ? 'batch_update_failed' : 'batch_creation_failed',
          batch 
            ? `Failed to update batch: ${batch.batch_id}` 
            : `Failed to create batch for program ID: ${submitData.program_id}`,
          'error'
        );
        
        // Handle case where response comes back but success is false
        const errorMsg = response.message || 'Failed to save batch';
        if (response.errors) {
          Object.keys(response.errors).forEach(key => {
            toast.error(`${key}: ${response.errors[key].join(', ')}`);
          });
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      
      // Log failure
      await logAction(
        batch ? 'batch_update_failed' : 'batch_creation_failed',
        batch 
          ? `Failed to update batch: ${batch.batch_id}` 
          : `Failed to create batch`,
        'error'
      );
      
      // If the error has additional details, show them
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          toast.error(`${key}: ${error.errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.message || 'Failed to save batch');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Log action helper
  const logAction = async (action, description, level = 'info') => {
    try {
      // Try to get staff token first, fallback to admin token
      let token = getStaffToken();
      if (!token) {
        token = sessionStorage.getItem('adminToken');
      }
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:cursor-pointer"
            title='Close'
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {batch && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch ID</label>
              <input
                type="text"
                value={batch.batch_id}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Program *</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a program</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>{program.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Trainer</label>
            <select
              name="trainer_id"
              value={formData.trainer_id || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 capitalize"
            >
              <option value="">No trainer assigned</option>
              {trainers.length > 0 ? (
                trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id} className="capitalize">
                    {trainer.first_name && trainer.last_name 
                      ? `${trainer.first_name} ${trainer.last_name}` 
                      : trainer.name || trainer.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading trainers...</option>
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Assign a trainer to this batch {trainers.length > 0 && `(${trainers.length} available)`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days *</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    formData.schedule_days.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                name="schedule_time_start"
                value={formData.schedule_time_start}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                name="schedule_time_end"
                value={formData.schedule_time_end}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Students *</label>
              <input
                type="number"
                name="max_students"
                value={formData.max_students}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="not started">Not Started</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border hover:cursor-pointer border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 hover:cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (batch ? 'Update Batch' : 'Create Batch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatch;
