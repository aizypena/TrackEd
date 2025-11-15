import { 
  MdClose,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdBuild,
  MdInventory,
  MdCalendarToday,
  MdEdit,
  MdPrint,
  MdLocationOn,
  MdAssignment
} from 'react-icons/md';

const ViewEquipmentModal = ({ isOpen, onClose, equipment, onEdit, onAssign, onManageAssignments, onMaintenance, onCompleteMaintenance }) => {
  if (!isOpen || !equipment) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Available'
      },
      inUse: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'In Use'
      },
      maintenance: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdBuild className="h-4 w-4" />,
        label: 'Maintenance'
      },
      damaged: {
        className: 'bg-red-100 text-red-800',
        icon: <MdError className="h-4 w-4" />,
        label: 'Damaged'
      },
      retired: {
        className: 'bg-gray-100 text-gray-800',
        icon: <MdClose className="h-4 w-4" />,
        label: 'Retired'
      }
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      excellent: { className: 'bg-green-100 text-green-800', label: 'Excellent' },
      good: { className: 'bg-blue-100 text-blue-800', label: 'Good' },
      fair: { className: 'bg-yellow-100 text-yellow-800', label: 'Fair' },
      poor: { className: 'bg-red-100 text-red-800', label: 'Poor' }
    };

    const config = conditionConfig[condition] || conditionConfig.good;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white sticky top-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{equipment.name}</h2>
              <p className="text-blue-100">{equipment.equipment_code}</p>
              <p className="text-blue-100 mt-1">{equipment.brand} - {equipment.model}</p>
              <div className="flex gap-2 mt-3">
                {getStatusBadge(equipment.status)}
                {getConditionBadge(equipment.condition)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white rounded-full p-2 hover:cursor-pointer"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Equipment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-bold text-gray-800">{equipment.category}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-lg font-bold text-gray-800">{equipment.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Serial Number</p>
              <p className="text-lg font-bold text-gray-800">{equipment.serial_number}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Unit Value</p>
              <p className="text-lg font-bold text-tracked-primary">{formatCurrency(equipment.value)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
              <p className="text-lg font-bold text-gray-800">{formatDate(equipment.purchase_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-lg font-bold text-tracked-primary">
                {formatCurrency(equipment.value * equipment.quantity)}
              </p>
            </div>
          </div>

          {/* Description */}
          {equipment.description && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
              <p className="text-gray-800">{equipment.description}</p>
            </div>
          )}

          {/* Availability Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdInventory className="h-5 w-5 text-tracked-primary" />
              Availability Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{equipment.quantity}</p>
                <p className="text-xs text-gray-600 mt-1">Total Quantity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{equipment.available}</p>
                <p className="text-xs text-gray-600 mt-1">Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{equipment.in_use || equipment.inUse || 0}</p>
                <p className="text-xs text-gray-600 mt-1">In Use</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{equipment.maintenance || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Maintenance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{equipment.damaged || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Damaged</p>
              </div>
            </div>
          </div>

          {/* Maintenance Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdBuild className="h-5 w-5 text-tracked-primary" />
              Maintenance Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Last Maintenance</p>
                <p className="text-lg font-bold text-gray-800">{formatDate(equipment.last_maintenance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Maintenance</p>
                <p className="text-lg font-bold text-gray-800">{formatDate(equipment.next_maintenance)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200">
            {equipment.available > 0 && equipment.status !== 'maintenance' && equipment.status !== 'damaged' && (
              <button 
                onClick={() => onAssign(equipment)}
                className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MdAssignment className="h-5 w-5" />
                Assign to User
              </button>
            )}
            {equipment.available > 0 && (equipment.status === 'maintenance' || equipment.status === 'damaged') && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-md border border-gray-300">
                <MdWarning className="h-5 w-5" />
                <span className="text-sm">Cannot assign - Equipment under {equipment.status === 'maintenance' ? 'maintenance' : 'repair (damaged)'}</span>
              </div>
            )}
            {equipment.in_use > 0 && (
              <button 
                onClick={() => onManageAssignments(equipment)}
                className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MdCheckCircle className="h-5 w-5" />
                Manage Checkouts ({equipment.in_use})
              </button>
            )}
            {(equipment.status === 'maintenance' || equipment.status === 'damaged') && (
              <button 
                onClick={() => onCompleteMaintenance(equipment)}
                className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MdCheckCircle className="h-5 w-5" />
                Mark as Complete
              </button>
            )}
            <button 
              onClick={() => onMaintenance(equipment)}
              className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <MdBuild className="h-5 w-5" />
              Record Maintenance
            </button>
            <button 
              onClick={onClose}
              className="ml-auto hover:cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEquipmentModal;
