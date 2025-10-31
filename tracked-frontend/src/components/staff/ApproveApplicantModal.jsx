import React, { useState, useEffect } from 'react';
import { MdClose, MdCheckCircle, MdPayment } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getStaffToken } from '../../utils/staffAuth';

const ApproveApplicantModal = ({ isOpen, onClose, applicant, onSuccess }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [enrollmentFee, setEnrollmentFee] = useState(5000);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && applicant) {
      fetchAvailableBatches();
      setPaymentRequired(false);
      setShowPaymentSection(false);
      setPaymentMethod('');
    }
  }, [isOpen, applicant]);

  useEffect(() => {
    if (selectedBatchId && applicant) {
      checkPaymentRequired();
    }
  }, [selectedBatchId, applicant]);

  const checkPaymentRequired = async () => {
    if (!selectedBatchId || !applicant) return;

    try {
      setCheckingPayment(true);
      const token = getStaffToken();
      const response = await fetch('http://localhost:8000/api/payments/check-required', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          batch_id: selectedBatchId,
          user_id: applicant.id
        })
      });

      const data = await response.json();
      
      console.log('Payment check response:', data); // Debug log
      
      if (data.payment_required) {
        setPaymentRequired(true);
        setEnrollmentFee(data.enrollment_fee || 5000);
        console.log('Payment IS required - no vouchers available');
      } else {
        setPaymentRequired(false);
        console.log('Payment NOT required - vouchers available:', data.vouchers_remaining);
      }
    } catch (error) {
      console.error('Error checking payment requirement:', error);
      // Don't show error toast, just assume no payment required
      setPaymentRequired(false);
    } finally {
      setCheckingPayment(false);
    }
  };

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
          
          // Check if batch is not full
          const enrolledStudents = parseInt(batch.enrolled_students_count || batch.enrolled_students) || 0;
          const maxStudents = parseInt(batch.max_students) || 0;
          
          // If max_students is set and greater than 0, check if not full
          // If max_students is 0 or null, assume unlimited capacity
          const notFull = maxStudents === 0 || enrolledStudents < maxStudents;
          
          // Check if batch is not completed (allow all statuses except 'completed')
          const isNotCompleted = batch.batch_status !== 'completed';
          
          console.log(`Batch ${batch.batch_id}:`, {
            programMatch,
            enrolledStudents,
            maxStudents,
            notFull,
            isNotCompleted,
            included: programMatch && notFull && isNotCompleted
          });
          
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

  const handlePayAndApprove = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setProcessingPayment(true);
      const token = getStaffToken();
      
      // Create payment intent
      const paymentResponse = await fetch('http://localhost:8000/api/payments/intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: applicant.id,
          batch_id: selectedBatchId,
          payment_method: paymentMethod,
          amount: enrollmentFee,
          description: `Enrollment fee for ${applicant.first_name} ${applicant.last_name}`
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok) {
        // Check if there's a redirect URL (PayMongo sandbox)
        if (paymentData.redirect_url) {
          // Store payment ID in localStorage for verification after redirect
          localStorage.setItem('pending_payment_id', paymentData.payment.id);
          localStorage.setItem('pending_applicant_id', applicant.id);
          localStorage.setItem('pending_batch_id', selectedBatchId);
          
          // Redirect to PayMongo payment page
          window.location.href = paymentData.redirect_url;
        } 
        // MOCK MODE: Open mock payment page
        else if (paymentData.mock) {
          const mockPaymentUrl = paymentData.mock_payment_url || 
                                 `http://localhost:8000/api/payments/${paymentData.payment.id}/mock-payment`;
          
          const paymentWindow = window.open(mockPaymentUrl, '_blank', 'width=600,height=700');
          
          toast.success('Mock payment page opened. Complete or fail the payment to continue.');
          
          // Poll for payment completion
          const waitForPayment = setInterval(async () => {
            try {
              const verifyResponse = await fetch(`http://localhost:8000/api/payments/${paymentData.payment.id}/verify`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json'
                }
              });
              
              const verifyData = await verifyResponse.json();
              
              if (verifyData.payment_status === 'paid') {
                clearInterval(waitForPayment);
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                toast.success('Payment completed! Enrolling student...');
                
                // Now approve with payment_id
                await approveWithPayment(paymentData.payment.id);
              } else if (verifyData.payment_status === 'failed') {
                clearInterval(waitForPayment);
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                toast.error('Payment failed. Please try again.');
                setProcessingPayment(false);
              }
            } catch (error) {
              console.error('Error verifying payment:', error);
            }
          }, 2000); // Check every 2 seconds
          
          // Stop checking after 5 minutes
          setTimeout(() => {
            clearInterval(waitForPayment);
            if (paymentWindow && !paymentWindow.closed) {
              toast.error('Payment timeout. Please try again.');
            }
            setProcessingPayment(false);
          }, 300000);
        } else {
          toast.error('No payment URL received');
          setProcessingPayment(false);
        }
      } else {
        toast.error(paymentData.error || paymentData.message || 'Failed to initiate payment');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
      setProcessingPayment(false);
    }
  };

  const approveWithPayment = async (paymentId) => {
    try {
      const token = getStaffToken();
      const response = await fetch(`http://localhost:8000/api/staff/applicants/${applicant.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          batch_id: selectedBatchId,
          payment_id: paymentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment completed and student enrolled successfully!');
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
      setProcessingPayment(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBatchId) {
      toast.error('Please select a batch');
      return;
    }

    // If payment is required, show payment section instead
    if (paymentRequired) {
      setShowPaymentSection(true);
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
                      {batch.max_students && ` (${batch.enrolled_students_count || batch.enrolled_students || 0}/${batch.max_students})`}
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

          {/* Payment Required Notice */}
          {selectedBatchId && paymentRequired && !showPaymentSection && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MdPayment className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Payment Required</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    No scholarship vouchers are available for this batch. The student needs to pay the enrollment fee of <strong>₱{enrollmentFee.toLocaleString()}</strong> before enrollment.
                  </p>
                  <p className="text-xs text-yellow-600">
                    Click "Pay & Approve Enrollment" to proceed with payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Section */}
          {showPaymentSection && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Payment Details</h4>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Enrollment Fee:</span>
                  <span className="text-lg font-bold text-blue-800">₱{enrollmentFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose payment method</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">Maya</option>
                </select>
              </div>

              <div className="bg-white border border-blue-200 rounded p-3 text-xs text-gray-600">
                <p className="font-medium mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select your preferred payment method</li>
                  <li>You'll be redirected to the payment gateway</li>
                  <li>Complete the payment</li>
                  <li>Student will be automatically enrolled upon successful payment</li>
                </ol>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!showPaymentSection && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">What happens when you approve?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Applicant role changes from <code className="bg-gray-200 px-1 rounded">applicant</code> to <code className="bg-gray-200 px-1 rounded">student</code></li>
                <li>✓ A unique student ID will be generated (e.g., STU-2025-0001)</li>
                <li>✓ Student will be assigned to the selected batch</li>
                <li>✓ Application status will be marked as <code className="bg-gray-200 px-1 rounded">approved</code></li>
                {paymentRequired && (
                  <li className="text-yellow-700">⚠ Payment of ₱{enrollmentFee.toLocaleString()} is required (no vouchers available)</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading || processingPayment}
            className="flex-1 hover:cursor-pointer px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          {showPaymentSection ? (
            <>
              <button
                onClick={() => setShowPaymentSection(false)}
                disabled={processingPayment}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handlePayAndApprove}
                disabled={processingPayment || !paymentMethod}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <MdPayment className="h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleApprove}
              disabled={loading || !selectedBatchId || batches.length === 0 || checkingPayment}
              className={`flex-1 hover:cursor-pointer flex items-center justify-center gap-2 px-4 py-3 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                paymentRequired ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading || checkingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {checkingPayment ? 'Checking...' : 'Approving...'}
                </>
              ) : paymentRequired ? (
                <>
                  <MdPayment className="h-5 w-5" />
                  Pay & Approve Enrollment
                </>
              ) : (
                <>
                  <MdCheckCircle className="h-5 w-5" />
                  Approve & Enroll
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveApplicantModal;
