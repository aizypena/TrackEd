import React, { useState, useEffect } from 'react';
import { MdClose, MdCheckCircle } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getStaffToken } from '../../utils/staffAuth';

const ApproveApplicantModal = ({ isOpen, onClose, applicant, onSuccess }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  useEffect(() => {
    if (isOpen && applicant) {
      fetchAvailableBatches();
    }
  }, [isOpen, applicant]);

  const fetchAvailableBatches = async () => {
    try {
      setFetchingBatches(true);
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter batches that match the applicant's program and are not full
        const matchingBatches = data.data.filter(batch => {
          // Check if batch matches applicant's program (convert both to numbers for comparison)
          const programMatch = parseInt(batch.program_id) === parseInt(applicant.course_program);
          // Check if batch is not full (assuming each batch has enrolled_students and max_students)
          const notFull = !batch.max_students || (batch.enrolled_students || 0) < batch.max_students;
          // Check if batch is not completed (allow all statuses except 'completed')
          const isNotCompleted = batch.batch_status !== 'completed';
          
          return programMatch && notFull && isNotCompleted;
        });
        
        setBatches(matchingBatches);
        
        if (matchingBatches.length === 0) {
          toast.error('No available batches found for this program');
        }
      } else {
        toast.error('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error loading batches');
    } finally {
      setFetchingBatches(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBatchId) {
      toast.error('Please select a batch');
      return;
    }

    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch(`http://localhost:8000/api/staff/applicants/${applicant.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          batch_id: selectedBatchId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Applicant approved and converted to student successfully!');
        if (onSuccess) {
          onSuccess(data.student);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Approve Applicant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                <span className="text-gray-600">Program:</span>
                <p className="font-medium">{applicant?.course_program_formatted}</p>
              </div>
            </div>
          </div>

          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Batch *
            </label>
            
            {fetchingBatches ? (
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
              <>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.batch_id}>
                      {batch.batch_id} - {batch.program_name || 'Program'} 
                      {batch.max_students && ` (${batch.enrolled_students || 0}/${batch.max_students})`}
                      {batch.start_date && ` - Starts: ${new Date(batch.start_date).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
                
                {selectedBatchId && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <MdCheckCircle className="inline h-4 w-4 mr-1" />
                      Batch selected. Student will be enrolled in this batch upon approval.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">What happens when you approve?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Applicant role changes from <code className="bg-gray-200 px-1 rounded">applicant</code> to <code className="bg-gray-200 px-1 rounded">student</code></li>
              <li>✓ A unique student ID will be generated (e.g., STU-2025-0001)</li>
              <li>✓ Student will be assigned to the selected batch</li>
              <li>✓ Application status will be marked as <code className="bg-gray-200 px-1 rounded">approved</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={loading || !selectedBatchId || batches.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Approving...
              </>
            ) : (
              <>
                <MdCheckCircle className="h-5 w-5" />
                Approve & Enroll
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveApplicantModal;
