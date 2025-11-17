import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdPayment, MdReceipt } from 'react-icons/md';
import { getStaffToken } from '../../utils/staffAuth';

const ProcessPaymentModal = ({ isOpen, onClose, applicant, onSuccess }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [programPrice, setProgramPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen && applicant) {
      // Reset form when modal opens
      setPaymentMethod('cash');
      setNotes('');
      setShowCashConfirmation(false);
      setShowSuccessModal(false);
      setSuccessData(null);
      
      // Fetch program price
      fetchProgramPrice();
    }
  }, [isOpen, applicant]);

  const fetchProgramPrice = async () => {
    if (!applicant?.course_program) return;

    try {
      setLoadingPrice(true);
      const token = getStaffToken();
      const response = await fetch('https://api.smitracked.cloud/api/staff/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const programs = data.programs || data.data || data || [];
        
        // Find the program that matches the applicant's program
        // Try multiple matching strategies
        const matchingProgram = programs.find(p => {
          // Match by ID if course_program is numeric
          if (p.id === parseInt(applicant.course_program)) return true;
          
          // Match by exact name
          if (p.name === applicant.course_program_formatted) return true;
          
          // Match by title field
          if (p.title === applicant.course_program_formatted) return true;
          
          // Match by lowercase comparison
          if (p.name?.toLowerCase() === applicant.course_program_formatted?.toLowerCase()) return true;
          if (p.title?.toLowerCase() === applicant.course_program_formatted?.toLowerCase()) return true;
          
          return false;
        });

        if (matchingProgram && matchingProgram.pricing) {
          const price = parseFloat(matchingProgram.pricing);
          setProgramPrice(price);
          setAmountPaid(price.toString());
        } else {
          setProgramPrice(0);
          setAmountPaid('');
        }
      }
    } catch (error) {
      console.error('Error fetching program price:', error);
      setProgramPrice(0);
      setAmountPaid('');
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Show cash confirmation modal instead of processing immediately
    if (paymentMethod === 'cash') {
      setShowCashConfirmation(true);
      return;
    }

    // Process online payments
    processOnlinePayment();
  };

  const processCashPayment = async () => {
    setShowCashConfirmation(false);
    setProcessing(true);
    
    try {
      const token = getStaffToken();

      // Clear any pending PayMongo payment data
      sessionStorage.removeItem('pending_payment_id');
      sessionStorage.removeItem('pending_applicant_id');
      sessionStorage.removeItem('payment_notes');

      // Process cash payment directly
      const response = await fetch(`https://api.smitracked.cloud/api/staff/applicants/${applicant.id}/process-cash-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          payment_method: 'cash',
          amount_paid: parseFloat(amountPaid),
          notes: notes || 'Cash payment received'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessData({
          studentId: data.student_id,
          receiptNumber: data.receipt_number
        });
        setShowSuccessModal(true);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          onSuccess();
          onClose();
          navigate('/staff/enrollments/applications');
        }, 3000);
      } else {
        alert('Failed to process cash payment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const processOnlinePayment = async () => {
    setProcessing(true);
    
    try {
      const token = getStaffToken();
      
      // Handle online payments (card, gcash, maya) with PayMongo
      const paymongoMethod = paymentMethod;
      
      // Prepare payment data
      const paymentData = {
        user_id: applicant.id,
        payment_method: paymongoMethod,
        amount: parseFloat(amountPaid)
      };
      
      // Only include batch_id if it exists
      if (applicant.batch_id) {
        paymentData.batch_id = applicant.batch_id;
      }
      
      // Create payment intent with PayMongo
      const response = await fetch('https://api.smitracked.cloud/api/payments/intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        // Store payment ID and applicant ID for later verification
        sessionStorage.setItem('pending_payment_id', data.payment.id);
        sessionStorage.setItem('pending_applicant_id', applicant.id);
        sessionStorage.setItem('payment_notes', notes);
        
        // Redirect to PayMongo checkout
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
          alert('Payment link created but no redirect URL provided');
          setProcessing(false);
        }
      } else {
        alert('Failed to create payment: ' + (data.message || 'Unknown error'));
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Error processing payment. Please try again.');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdPayment className="h-6 w-6 text-gray-700" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
                <p className="text-gray-500 text-sm">Complete payment and enroll as student</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Applicant Info */}
          <div className="border border-gray-200 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500 text-xs">Name:</label>
                <p className="font-medium text-gray-900">
                  {applicant?.first_name} {applicant?.last_name}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">Program:</label>
                <p className="font-medium text-gray-900">
                  {applicant?.course_program_formatted}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">Batch:</label>
                <p className="font-medium text-gray-900">
                  {applicant?.batch_id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">Application ID:</label>
                <p className="font-medium text-gray-900">APP-{applicant?.id}</p>
              </div>
            </div>
            
            {/* Program Fee Display */}
            {loadingPrice ? (
              <div className="mt-4 text-center text-sm text-gray-500">
                Loading program fee...
              </div>
            ) : programPrice !== null && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Program Training Fee:</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₱{parseFloat(programPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-gray-400">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all"
              required
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
            </select>
          </div>

          {/* Amount Paid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid (₱) <span className="text-gray-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all"
              required
              disabled={loadingPrice}
            />
            {programPrice !== null && amountPaid && parseFloat(amountPaid) !== parseFloat(programPrice) && (
              <p className="mt-1.5 text-sm text-gray-600">
                ⚠️ Amount differs from program fee (₱{parseFloat(programPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Important Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <div className="flex gap-3">
              <MdReceipt className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Payment Process:
                </p>
                {paymentMethod === 'cash' ? (
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Confirm you have received cash payment from the applicant</li>
                    <li>• Payment will be recorded immediately in the system</li>
                    <li>• Student will be enrolled and receive confirmation email</li>
                    <li>• Receipt will be generated automatically</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You will be redirected to PayMongo payment gateway</li>
                    <li>• Complete the payment using your selected method</li>
                    <li>• After payment, you'll be redirected back automatically</li>
                    <li>• Student will be enrolled and receive confirmation email</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
            >
              <MdPayment className="h-4 w-4" />
              {processing 
                ? (paymentMethod === 'cash' ? 'Processing Cash Payment...' : 'Redirecting to PayMongo...') 
                : (paymentMethod === 'cash' ? 'Confirm Cash Payment' : 'Proceed to Payment')}
            </button>
          </div>
        </form>
      </div>
    </div>

      {/* Cash Payment Confirmation Modal */}
      {showCashConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdPayment className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Cash Payment</h3>
              <p className="text-gray-600 text-sm">Please verify the cash payment details</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Applicant:</span>
                <span className="font-medium text-gray-900">
                  {applicant?.first_name} {applicant?.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Program:</span>
                <span className="font-medium text-gray-900 text-sm">
                  {applicant?.course_program_formatted}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Amount Received:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₱{parseFloat(amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> By confirming, you acknowledge that you have physically received the cash payment from the applicant.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCashConfirmation(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={processCashPayment}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">
                Cash payment has been processed and student has been enrolled.
              </p>

              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Student ID:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {successData.studentId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Receipt Number:</span>
                  <span className="font-medium text-gray-900">
                    {successData.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Amount Paid:</span>
                  <span className="font-medium text-gray-900">
                    ₱{parseFloat(amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ✉️ A confirmation email with enrollment details has been sent to the student.
                </p>
              </div>

              {/* Redirect Message */}
              <p className="text-gray-500 text-sm">
                Redirecting to applications page in 3 seconds...
              </p>

              {/* Manual Navigation Button */}
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                  navigate('/staff/enrollments/applications');
                }}
                className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Go to Applicants Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessPaymentModal;
