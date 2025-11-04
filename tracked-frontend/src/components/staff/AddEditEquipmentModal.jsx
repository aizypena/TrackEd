import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { equipmentAPI } from '../../services/equipmentAPI';

const AddEditEquipmentModal = ({ isOpen, onClose, equipment, categories, locations, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    equipment_code: '',
    name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    quantity: 1,
    location: '',
    status: 'available',
    condition: 'good',
    purchase_date: '',
    last_maintenance: '',
    next_maintenance: '',
    value: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  // Shared input className for smooth transitions
  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary transition-all duration-200 hover:border-gray-400";
  const selectClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary transition-all duration-200 hover:border-gray-400 cursor-pointer";

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_code: equipment.equipment_code || '',
        name: equipment.name || '',
        category: equipment.category || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        quantity: equipment.quantity || 1,
        available: equipment.available || equipment.quantity || 1,
        in_use: equipment.in_use || 0,
        maintenance: equipment.maintenance || 0,
        damaged: equipment.damaged || 0,
        location: equipment.location || '',
        status: equipment.status || 'available',
        condition: equipment.condition || 'good',
        purchase_date: equipment.purchase_date || '',
        last_maintenance: equipment.last_maintenance || '',
        next_maintenance: equipment.next_maintenance || '',
        value: equipment.value || '',
        description: equipment.description || ''
      });
    } else {
      // Reset form for new equipment
      setFormData({
        equipment_code: '',
        name: '',
        category: '',
        brand: '',
        model: '',
        serial_number: '',
        quantity: 1,
        location: '',
        status: 'available',
        condition: 'good',
        purchase_date: '',
        last_maintenance: '',
        next_maintenance: '',
        value: '',
        description: ''
      });
    }
  }, [equipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (equipment) {
        response = await equipmentAPI.update(equipment.id, formData);
      } else {
        response = await equipmentAPI.create(formData);
      }

      if (response.success) {
        // Pass the action type and equipment data to onSuccess for logging
        onSuccess(equipment ? 'updated' : 'created', response.data || formData);
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      onError(error.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 animate-slideUp shadow-2xl">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {equipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-white hover:cursor-pointer rounded-full p-2"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipment Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="equipment_code"
                value={formData.equipment_code}
                onChange={handleChange}
                required
                disabled={!!equipment}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                placeholder="e.g., EQP-WLD-001"
              />
              {equipment && (
                <p className="text-xs text-gray-500 mt-1">Equipment code cannot be changed</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary transition-all duration-200"
                placeholder="e.g., Arc Welding Machine"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Program) <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="">
                  {categories && categories.length > 0 ? 'Select a program...' : 'Loading programs...'}
                </option>
                {categories && categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No programs available</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the training program this equipment belongs to
                {categories && categories.length === 0 && ' (Programs not loaded)'}
              </p>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className={inputClassName}
                placeholder="e.g., Lincoln Electric"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className={inputClassName}
                placeholder="e.g., Power MIG 260"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g., U1170512345"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className={inputClassName}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                list="locations-list"
                className={inputClassName}
                placeholder="e.g., Workshop A"
              />
              <datalist id="locations-list">
                {locations.map((loc, index) => (
                  <option key={index} value={loc} />
                ))}
              </datalist>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="available">Available</option>
                <option value="inUse">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Value (PHP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputClassName}
                placeholder="e.g., 85000.00"
              />
            </div>

            {/* Last Maintenance */}
            {equipment && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance</label>
                <input
                  type="date"
                  name="last_maintenance"
                  value={formData.last_maintenance}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            )}

            {/* Next Maintenance */}
            {equipment && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Maintenance</label>
                <input
                  type="date"
                  name="next_maintenance"
                  value={formData.next_maintenance}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`${inputClassName} resize-none`}
                placeholder="Enter equipment description..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm hover:cursor-pointer font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 hover:cursor-pointer text-sm font-medium text-white bg-tracked-primary hover:bg-tracked-secondary rounded-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEquipmentModal;
