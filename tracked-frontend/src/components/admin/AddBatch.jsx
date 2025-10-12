import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { batchAPI } from '../../services/batchAPI';

const AddBatch = ({ isOpen, onClose, batch, programs, onSuccess }) => {
  const [formData, setFormData] = useState({
    program_id: '',
    schedule_days: [],
    schedule_time_start: '',
    schedule_time_end: '',
    status: 'not started',
    start_date: '',
    end_date: '',
    max_students: 30
  });
  const [submitting, setSubmitting] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (batch) {
      setFormData({
        program_id: batch.program_id || '',
        schedule_days: batch.schedule_days || [],
        schedule_time_start: batch.schedule_time_start || '',
        schedule_time_end: batch.schedule_time_end || '',
        status: batch.status || 'not started',
        start_date: batch.start_date || '',
        end_date: batch.end_date || '',
        max_students: batch.max_students || 30
      });
    } else {
      setFormData({
        program_id: '',
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
      alert('Please select at least one day for the schedule');
      return;
    }

    try {
      setSubmitting(true);
      let response;
      
      if (batch) {
        response = await batchAPI.update(batch.id, formData);
      } else {
        response = await batchAPI.create(formData);
      }

      if (response.success) {
        alert(batch ? 'Batch updated successfully' : 'Batch created successfully');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Failed to save batch: ' + error.message);
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
