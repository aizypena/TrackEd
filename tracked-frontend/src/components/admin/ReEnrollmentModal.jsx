import React, { useState, useEffect } from 'react';
import { MdClose, MdSchool, MdRefresh, MdCardGiftcard } from 'react-icons/md';
import toast from 'react-hot-toast';

const ReEnrollmentModal = ({ isOpen, onClose, userData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [assignVoucher, setAssignVoucher] = useState(false);
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [previousPrograms, setPreviousPrograms] = useState([]);

  useEffect(() => {
    if (isOpen && userData) {
      fetchInitialData();
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (selectedProgram) {
      fetchBatchesForProgram(selectedProgram);
    } else {
      setBatches([]);
      setSelectedBatch('');
      setVoucherInfo(null);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b.batch_id === selectedBatch);
      if (batch) {
        setVoucherInfo({
          hasVoucher: batch.voucher_available > 0,
          available: batch.voucher_available,
          total: batch.voucher_quantity
        });
      }
    } else {
      setVoucherInfo(null);
      setAssignVoucher(false);
    }
  }, [selectedBatch, batches]);

  const fetchInitialData = async () => {
    setFetchingData(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      
      // Fetch programs
      const programsResponse = await fetch('https://api.smitracked.cloud/api/admin/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const programsData = await programsResponse.json();
      
      // Fetch user's previous programs (certificates)
      const certificatesResponse = await fetch(`https://api.smitracked.cloud/api/admin/user/${userData.id}/certificates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const certificatesData = await certificatesResponse.json();
      
      if (programsData.success) {
        setPrograms(programsData.data || []);
      }
      
      if (certificatesData.success) {
        // Extract program IDs from certificates
        const completedProgramIds = (certificatesData.data || []).map(cert => cert.program_id);
        setPreviousPrograms(completedProgramIds);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchBatchesForProgram = async (programId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`https://api.smitracked.cloud/api/admin/batches-for-enrollment/${programId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.data || []);
      } else {
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProgram || !selectedBatch) {
      toast.error('Please select a program and batch');
      return;
    }
    
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('https://api.smitracked.cloud/api/admin/re-enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userData.id,
          program_id: selectedProgram,
          batch_id: selectedBatch,
          assign_voucher: assignVoucher
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Student re-enrolled successfully!');
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to re-enroll student');
      }
    } catch (error) {
      console.error('Error re-enrolling student:', error);
      toast.error('An error occurred while re-enrolling');
    } finally {
      setLoading(false);
    }
  };

  // Filter out programs the user has already completed
  const availablePrograms = programs.filter(p => !previousPrograms.includes(p.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdRefresh className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Re-Enrollment</h2>
              <p className="text-sm text-gray-500">
                {userData?.first_name} {userData?.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {fetchingData ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Previous Programs Info */}
              {previousPrograms.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> This student has already completed {previousPrograms.length} program(s). 
                    Only programs they haven't completed are shown below.
                  </p>
                </div>
              )}

              {/* Program Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedBatch('');
                    setAssignVoucher(false);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a program</option>
                  {availablePrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
                {availablePrograms.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    This student has completed all available programs.
                  </p>
                )}
              </div>

              {/* Batch Selection */}
              {selectedProgram && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={batches.length === 0}
                  >
                    <option value="">Select a batch</option>
                    {batches.map(batch => (
                      <option 
                        key={batch.batch_id} 
                        value={batch.batch_id}
                        disabled={batch.is_full}
                      >
                        {batch.batch_id} - {batch.schedule_days?.join(', ')} ({batch.current_students}/{batch.max_students} students)
                        {batch.is_full ? ' - FULL' : ''}
                      </option>
                    ))}
                  </select>
                  {batches.length === 0 && selectedProgram && (
                    <p className="mt-2 text-sm text-amber-600">
                      No available batches for this program.
                    </p>
                  )}
                </div>
              )}

              {/* Batch Info */}
              {selectedBatch && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {batches.filter(b => b.batch_id === selectedBatch).map(batch => (
                    <div key={batch.batch_id}>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Schedule:</span>
                          <p className="font-medium text-gray-900">
                            {batch.schedule_days?.join(', ')}
                          </p>
                          <p className="text-gray-600">
                            {batch.schedule_time_start} - {batch.schedule_time_end}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Dates:</span>
                          <p className="font-medium text-gray-900">
                            {batch.start_date} to {batch.end_date}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Available Slots:</span>
                          <span className="font-medium text-gray-900">
                            {batch.available_slots} of {batch.max_students}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Voucher Assignment */}
              {selectedBatch && voucherInfo && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MdCardGiftcard className={`h-6 w-6 ${voucherInfo.hasVoucher ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900">Voucher Assignment</p>
                        <p className="text-sm text-gray-500">
                          {voucherInfo.hasVoucher 
                            ? `${voucherInfo.available} of ${voucherInfo.total} vouchers available`
                            : 'No vouchers available for this batch'}
                        </p>
                      </div>
                    </div>
                    {voucherInfo.hasVoucher && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assignVoucher}
                          onChange={(e) => setAssignVoucher(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Assign Voucher</span>
                      </label>
                    )}
                  </div>
                  {!voucherInfo.hasVoucher && (
                    <p className="mt-2 text-sm text-amber-600">
                      Student will be enrolled as self-funded (no voucher).
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedProgram || !selectedBatch || availablePrograms.length === 0}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Re-Enroll Student'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReEnrollmentModal;
