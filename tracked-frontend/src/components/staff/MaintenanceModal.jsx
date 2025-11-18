import { useState } from 'react';
import { 
  MdClose,
  MdBuild,
  MdCalendarToday,
  MdDescription
} from 'react-icons/md';
import { equipmentAPI } from '../../services/equipmentAPI';

const MaintenanceModal = ({ isOpen, onClose, equipment, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  // Get current date in Philippine timezone
  const getPhilippineDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const year = phTime.getFullYear();
    const month = String(phTime.getMonth() + 1).padStart(2, '0');
    const day = String(phTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    type: 'routine',
    date: getPhilippineDate(),
    next_maintenance_date: '',
    performed_by: '',
    cost: '',
    notes: '',
    condition_after: 'good',
    mark_as_under_maintenance: false
  });

  if (!isOpen || !equipment) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.performed_by.trim()) {
      onError('Please enter who performed the maintenance');
      return;
    }

    if (!formData.notes.trim()) {
      onError('Please enter maintenance notes/description');
      return;
    }

    try {
      setLoading(true);

      // Call API to record maintenance
      const response = await equipmentAPI.recordMaintenance(equipment.id, {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0
      });

      if (response.success) {
        onSuccess({
          equipmentCode: equipment.equipment_code,
          equipmentName: equipment.name,
          maintenanceType: formData.type,
          performedBy: formData.performed_by,
          notes: formData.notes,
          conditionAfter: formData.condition_after
        });
        onClose();
      } else {
        onError(response.message || 'Failed to record maintenance');
      }
    } catch (error) {
      console.error('Error recording maintenance:', error);
      onError(error.message || 'Failed to record maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
        {/* Modal Header */}
        <div className="bg-orange-600 p-6 text-white sticky top-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MdBuild className="h-6 w-6" />
                Record Maintenance
              </h2>
              <p className="text-orange-100">{equipment.name}</p>
              <p className="text-orange-100 text-sm">{equipment.equipment_code}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-700 rounded-full p-2"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Equipment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900">{equipment.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Condition</p>
                <p className="font-medium text-gray-900 capitalize">{equipment.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="font-medium text-gray-900">{equipment.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-medium text-gray-900 capitalize">{equipment.status}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="routine">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Safety Inspection</option>
                <option value="calibration">Calibration</option>
                <option value="cleaning">Deep Cleaning</option>
                <option value="upgrade">Upgrade/Modification</option>
              </select>
            </div>

            {/* Maintenance Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MdCalendarToday className="inline h-4 w-4 mr-1" />
                  Maintenance Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MdCalendarToday className="inline h-4 w-4 mr-1" />
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  name="next_maintenance_date"
                  value={formData.next_maintenance_date}
                  onChange={handleInputChange}
                  min={formData.date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Performed By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performed By *
              </label>
              <input
                type="text"
                name="performed_by"
                value={formData.performed_by}
                onChange={handleInputChange}
                placeholder="Enter technician or staff name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Condition After Maintenance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition After Maintenance *
              </label>
              <select
                name="condition_after"
                value={formData.condition_after}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Mark as Under Maintenance */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="mark_as_under_maintenance"
                  checked={formData.mark_as_under_maintenance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mark_as_under_maintenance: e.target.checked
                  }))}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Mark equipment as under maintenance</span>
                  <p className="text-xs text-gray-600 mt-1">
                    Check this if the equipment requires ongoing maintenance and should not be available for assignment.
                  </p>
                </div>
              </label>
            </div>

            {/* Maintenance Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdDescription className="inline h-4 w-4 mr-1" />
                Maintenance Notes/Description *
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Describe what was done, parts replaced, issues found, etc."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about what was inspected, cleaned, repaired, or replaced.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Recording...
                </>
              ) : (
                <>
                  <MdBuild className="h-5 w-5" />
                  Record Maintenance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
