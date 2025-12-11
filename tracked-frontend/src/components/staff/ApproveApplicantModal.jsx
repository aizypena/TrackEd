import React, { useState, useEffect } from 'react';
import { MdClose, MdCheckCircle } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getStaffToken } from '../../utils/staffAuth';
import { API_URL } from '../../config/api';

const ApproveApplicantModal = ({ isOpen, onClose, applicant, onSuccess }) => {
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [voucherEligible, setVoucherEligible] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (isOpen && applicant) {
      // Reset state when modal opens
      setVoucherEligible(false);
      setNotes('');
      setSelectedBatchId('');
      setSelectedBatch(null);
      
      fetchPrograms();
      // Pre-select applicant's program if they have one
      if (applicant.course_program) {
        setSelectedProgramId(applicant.course_program);
      } else {
        setSelectedProgramId('');
      }
    }
  }, [isOpen, applicant]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchBatchesForProgram(selectedProgramId);
    } else {
      setBatches([]);
      setSelectedBatchId('');
    }
  }, [selectedProgramId]);

  const fetchPrograms = async () => {
    try {
      setFetchingData(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/programs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        const programList = data.programs || data.data || data || [];
        setPrograms(Array.isArray(programList) ? programList : []);
      } else {
        toast.error('Failed to fetch programs');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Error loading programs');
      setPrograms([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchBatchesForProgram = async (programId) => {
    try {
      setFetchingData(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/batches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats and ensure we have an array
        const batchList = data.data || data.batches || data || [];
        const batchesArray = Array.isArray(batchList) ? batchList : [];
        
        // Filter batches that match the selected program
        const matchingBatches = batchesArray.filter(batch => {
          const batchProgramId = batch.program_id || batch.program?.id;
          const programMatch = parseInt(batchProgramId) === parseInt(programId);
          const isNotCompleted = batch.status !== 'completed' && batch.batch_status !== 'completed';
          
          return programMatch && isNotCompleted;
        });
        
        setBatches(matchingBatches);
        
        if (matchingBatches.length === 0) {
          toast.error('No available batches found for this program');
        }
      } else {
        toast.error('Failed to fetch batches');
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error loading batches');
      setBatches([]);
    } finally {
      setFetchingData(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedProgramId) {
      toast.error('Please select a program');
      return;
    }
    
    if (!selectedBatchId) {
      toast.error('Please select a batch');
      return;
    }

    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${applicant.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          program_id: selectedProgramId,
          batch_id: selectedBatchId,
          voucher_eligible: voucherEligible,
          notes: notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        const eligibilityStatus = voucherEligible ? 'eligible for voucher' : 'not eligible for voucher';
        toast.success(
          `Applicant approved successfully! Email sent with voucher eligibility status (${eligibilityStatus}). Please check spam folder if not received.`,
          { duration: 5000 }
        );
        if (onSuccess) {
          onSuccess(data.applicant);
        }
        onClose();
      } else {
        toast.error(data.error || data.message || 'Failed to approve applicant');
      }
    } catch (error) {
      console.error('Error approving applicant:', error);
      toast.error('Error approving applicant');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Approve Applicant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:cursor-pointer hover:text-gray-600 transition-colors"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Applicant Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium">{applicant?.first_name} {applicant?.last_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{applicant?.email}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Current Program:</span>
                <p className="font-medium">{applicant?.course_program_formatted || 'Not selected'}</p>
              </div>
            </div>
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Program *
            </label>
            
            {fetchingData && programs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a program</option>
                {Array.isArray(programs) && programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title || program.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Batch Selection */}
          {selectedProgramId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Batch *
              </label>
              
              {fetchingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : batches.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                  <p className="text-yellow-800 font-medium">No available batches</p>
                  <p className="text-yellow-600 mt-1">
                    There are no available batches for this program. Please create a batch first.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    const batchId = e.target.value;
                    setSelectedBatchId(batchId);
                    // Find and store the selected batch object
                    const batch = batches.find(b => b.batch_id === batchId);
                    setSelectedBatch(batch || null);
                    // Reset voucher eligibility when batch changes
                    setVoucherEligible(false);
                  }}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a batch</option>
                  {Array.isArray(batches) && batches.map((batch) => {
                    const enrolledCount = batch.enrolled_students_count || 0;
                    const maxStudents = batch.max_students || 0;
                    const isBatchFull = enrolledCount >= maxStudents;
                    
                    const hasVouchers = batch.voucher_quantity > 0;
                    const vouchersUsed = batch.voucher_used_count || 0;
                    const vouchersTotal = batch.voucher_quantity || 0;
                    const vouchersFull = hasVouchers && vouchersUsed >= vouchersTotal;
                    
                    let statusText = '';
                    
                    // Batch capacity status
                    if (isBatchFull) {
                      statusText = ` - BATCH FULL (${enrolledCount}/${maxStudents})`;
                    } else {
                      statusText = ` - Slots: ${enrolledCount}/${maxStudents}`;
                    }
                    
                    // Voucher status
                    if (!hasVouchers) {
                      statusText += ' - No Vouchers';
                    } else if (vouchersFull) {
                      statusText += ` - Vouchers Full (${vouchersUsed}/${vouchersTotal})`;
                    } else {
                      statusText += ` - Vouchers: ${vouchersUsed}/${vouchersTotal}`;
                    }
                    
                    return (
                      <option 
                        key={batch.id} 
                        value={batch.batch_id}
                        disabled={isBatchFull}
                      >
                        {batch.batch_id}
                        {batch.start_date && ` - Starts: ${new Date(batch.start_date).toLocaleDateString()}`}
                        {statusText}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Voucher Eligibility */}
          {selectedBatchId && (() => {
            // Check batch capacity
            const enrolledCount = selectedBatch?.enrolled_students_count || 0;
            const maxStudents = selectedBatch?.max_students || 0;
            const isBatchFull = enrolledCount >= maxStudents;
            
            // Check if batch has vouchers and if they're available
            const hasVouchers = selectedBatch?.voucher_quantity > 0;
            const vouchersAvailable = hasVouchers && (selectedBatch.voucher_used_count < selectedBatch.voucher_quantity);
            
            // If batch is full, show error
            if (isBatchFull) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">Batch Full - Cannot Enroll</p>
                      <p className="text-sm text-red-700 mt-1">
                        This batch has reached maximum capacity ({enrolledCount}/{maxStudents} students enrolled). 
                        Please select a different batch or create a new one.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (!hasVouchers) {
              // No vouchers allocated to this batch
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">No Vouchers Available</p>
                      <p className="text-sm text-gray-600 mt-1">
                        This batch does not have any training vouchers allocated. Applicants will need to pay the training fees.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (!vouchersAvailable) {
              // Vouchers are full
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">Vouchers Full</p>
                      <p className="text-sm text-red-700 mt-1">
                        All vouchers for this batch have been used ({selectedBatch.voucher_used_count}/{selectedBatch.voucher_quantity}). 
                        Applicants will need to pay the training fees.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Vouchers are available
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voucherEligible}
                    onChange={(e) => setVoucherEligible(e.target.checked)}
                    className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Voucher Eligible (TESDA Subsidy)</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this box if the applicant qualifies for TESDA training voucher. 
                      If checked, training fees will be covered by the subsidy program.
                    </p>
                    <p className="text-xs text-green-700 mt-2 font-medium">
                      Available vouchers: {selectedBatch.voucher_quantity - selectedBatch.voucher_used_count} / {selectedBatch.voucher_quantity}
                    </p>
                  </div>
                </label>
              </div>
            );
          })()}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments about this approval..."
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">What happens when you approve?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Applicant will be marked as <code className="bg-gray-200 px-1 rounded">approved</code></li>
              <li>✓ Applicant remains as <code className="bg-gray-200 px-1 rounded">applicant</code> role</li>
              <li>✓ Program and batch will be assigned</li>
              <li>✓ Voucher eligibility status will be recorded</li>
              <li>✓ Applicant will receive an email with next steps and voucher status</li>
              <li>✓ Email will include instructions for document verification visit</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 hover:cursor-pointer px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleApprove}
            disabled={
              loading || 
              !selectedProgramId || 
              !selectedBatchId || 
              batches.length === 0 ||
              (selectedBatch && selectedBatch.enrolled_students_count >= selectedBatch.max_students)
            }
            className="flex-1 hover:cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Approving...
              </>
            ) : (
              <>
                <MdCheckCircle className="h-5 w-5" />
                Approve Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveApplicantModal;
