import React, { useState, useEffect } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';

const ProgramModal = ({ isOpen, onClose, program, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    availability: 'available',
    career_opportunities: [''],
    core_competencies: ['']
  });

  // Update form data when program prop changes (for edit mode)
  useEffect(() => {
    if (isOpen) {
      if (program) {
        // Edit mode - populate form with program data
        setFormData({
          title: program.title || '',
          description: program.description || '',
          duration: program.duration || '',
          availability: program.availability || 'available',
          career_opportunities: program.career_opportunities || [''],
          core_competencies: program.core_competencies || ['']
        });
      } else {
        // Add mode - reset form to empty
        setFormData({
          title: '',
          description: '',
          duration: '',
          availability: 'available',
          career_opportunities: [''],
          core_competencies: ['']
        });
      }
    }
  }, [program, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    if (formData[field].length < 5) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty array items
    const cleanedData = {
      ...formData,
      duration: parseInt(formData.duration),
      career_opportunities: formData.career_opportunities.filter(item => item.trim() !== ''),
      core_competencies: formData.core_competencies.filter(item => item.trim() !== '')
    };

    // Validate
    if (!cleanedData.title || !cleanedData.description || !cleanedData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    if (cleanedData.duration < 1) {
      alert('Duration must be at least 1 hour');
      return;
    }

    onSave(cleanedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {program ? 'Edit Program' : 'Add New Program'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Program Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Availability <span className="text-red-500">*</span>
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Opportunities (max 5)
            </label>
            {formData.career_opportunities.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('career_opportunities', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Opportunity ${index + 1}`}
                />
                {formData.career_opportunities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('career_opportunities', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <MdClose className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {formData.career_opportunities.length < 5 && (
              <button
                type="button"
                onClick={() => addArrayItem('career_opportunities')}
                className="text-sm text-blue-600 hover:cursor-pointer hover:text-blue-700 flex items-center"
              >
                <MdAdd className="h-4 w-4 mr-1" />
                Add Opportunity
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Core Competencies (max 5)
            </label>
            {formData.core_competencies.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('core_competencies', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Competency ${index + 1}`}
                />
                {formData.core_competencies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('core_competencies', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <MdClose className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {formData.core_competencies.length < 5 && (
              <button
                type="button"
                onClick={() => addArrayItem('core_competencies')}
                className="text-sm text-blue-600 hover:cursor-pointer hover:text-blue-700 flex items-center"
              >
                <MdAdd className="h-4 w-4 mr-1" />
                Add Competency
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border hover:cursor-pointer border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 hover:cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {program ? 'Update Program' : 'Add Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramModal;
