import { useState, useEffect } from 'react';
import { MdClose, MdPeople, MdCalendarToday, MdAssignment } from 'react-icons/md';
import axios from 'axios';
import { getAllBatches } from '../../services/batchService';

const AssignEquipmentModal = ({ isOpen, onClose, equipment, onSuccess, onError }) => {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBatchList, setShowBatchList] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
      // Reset form
      setSelectedBatch(null);
      setSearchTerm('');
      setQuantity(1);
      setPurpose('');
      setDueDate('');
      setNotes('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter batches based on search term or show all
    if (searchTerm.trim() === '') {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter(batch => {
        const searchLower = searchTerm.toLowerCase();
        const batchId = (batch.batch_id || '').toLowerCase();
        const programName = (batch.program?.title || '').toLowerCase();
        const trainerName = (batch.trainer?.first_name + ' ' + batch.trainer?.last_name || '').toLowerCase();
        
        return (
          batchId.includes(searchLower) ||
          programName.includes(searchLower) ||
          trainerName.includes(searchLower)
        );
      });
      setFilteredBatches(filtered);
    }
  }, [searchTerm, batches]);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await getAllBatches();
      
      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      onError('Failed to load batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    const batchId = batch.batch_id || 'Unknown Batch';
    const programName = batch.program?.title || 'Unknown Program';
    setSearchTerm(`${batchId} - ${programName}`);
    setShowBatchList(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedBatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBatch) {
      onError('Please select a batch');
      return;
    }

    if (quantity > equipment.available) {
      onError(`Only ${equipment.available} available`);
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'https://api.smitracked.cloud/api';
      const token = localStorage.getItem('staffToken') || localStorage.getItem('adminToken');

      const response = await axios.post(
        `${API_URL}/equipment/${equipment.id}/assign`,
        {
          batch_id: selectedBatch.id,
          quantity: parseInt(quantity),
          purpose,
          due_date: dueDate || null,
          notes
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Pass assignment details to onSuccess for logging
        onSuccess({
          equipmentCode: equipment.equipment_code,
          equipmentName: equipment.name,
          batchId: selectedBatch.id,
          batchName: `${selectedBatch.batch_id} - ${selectedBatch.program?.title}`,
          quantity: quantity,
          purpose
        });
        onClose();
      }
    } catch (error) {
      console.error('Error assigning equipment:', error);
      onError(error.response?.data?.message || 'Failed to assign equipment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !equipment) return null;

  const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary transition-all duration-200 hover:border-gray-400";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full animate-slideUp shadow-2xl">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MdAssignment className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Equipment</h2>
                <p className="text-sm text-blue-100 mt-1">Assign equipment to a batch</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Equipment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">{equipment.name}</h3>
            <p className="text-sm text-gray-600">Code: {equipment.equipment_code}</p>
            <p className="text-sm text-gray-600 mt-1">Available: <span className="font-bold text-green-600">{equipment.available}</span> / {equipment.quantity}</p>
          </div>

          <div className="space-y-4">
            {/* Batch Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdPeople className="inline h-4 w-4 mr-1" />
                Assign To Batch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowBatchList(true)}
                placeholder="Search by batch number, program, or trainer..."
                className={inputClassName}
                disabled={loadingBatches}
                autoComplete="off"
              />
              
              {/* Selected Batch Display */}
              {selectedBatch && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{selectedBatch.batch_id}</p>
                      <p className="text-sm text-blue-700">{selectedBatch.program?.title}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Trainer: {selectedBatch.trainer ? `${selectedBatch.trainer.first_name} ${selectedBatch.trainer.last_name}` : 'Not assigned'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBatch(null);
                        setSearchTerm('');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <MdClose className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showBatchList && !selectedBatch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => handleBatchSelect(batch)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{batch.batch_id}</div>
                        <div className="text-sm text-gray-600">{batch.program?.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Trainer: {batch.trainer ? `${batch.trainer.first_name} ${batch.trainer.last_name}` : 'Not assigned'}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? `No batches found matching "${searchTerm}"` : 'No batches available'}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loadingBatches && (
                <div className="mt-2 text-sm text-gray-500">
                  Loading batches...
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <span className="text-gray-900 font-medium">1</span>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Training Session, Practice, etc."
                className={inputClassName}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdCalendarToday className="inline h-4 w-4 mr-1" />
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputClassName}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Additional notes or instructions..."
                className={`${inputClassName} resize-none`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 hover:cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedBatch}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <MdAssignment className="h-5 w-5" />
                  <span>Assign to Batch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignEquipmentModal;