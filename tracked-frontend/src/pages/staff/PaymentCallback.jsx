import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStaffToken } from '../../utils/staffAuth';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    verifyAndCompleteEnrollment();
  }, []);

  const verifyAndCompleteEnrollment = async () => {
    try {
      const token = getStaffToken();
      
      // Get stored data from localStorage
      const paymentId = localStorage.getItem('pending_payment_id');
      const applicantId = localStorage.getItem('pending_applicant_id');
      const batchId = localStorage.getItem('pending_batch_id');

      if (!paymentId || !applicantId || !batchId) {
        setStatus('failed');
        setMessage('Payment information not found. Please try again.');
        return;
      }

      setMessage('Verifying your payment...');

      // Verify payment status
      const verifyResponse = await fetch(`http://localhost:8000/api/payments/${paymentId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.payment_status === 'paid') {
        setStatus('success');
        setMessage('Payment successful! Redirecting...');
        
        // Clean up localStorage
        localStorage.removeItem('pending_payment_id');
        localStorage.removeItem('pending_applicant_id');
        localStorage.removeItem('pending_batch_id');

        // Redirect to applicants page after 2 seconds
        setTimeout(() => {
          navigate('/staff/enrollments/applications');
        }, 2000);
      } else if (verifyData.payment_status === 'failed') {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        
        // Clean up localStorage
        localStorage.removeItem('pending_payment_id');
        localStorage.removeItem('pending_applicant_id');
        localStorage.removeItem('pending_batch_id');

        setTimeout(() => {
          navigate('/staff/enrollments/applications');
        }, 3000);
      } else {
        // Payment still pending
        setStatus('verifying');
        setMessage('Payment is still being processed. Please wait...');
        
        // Poll again after 3 seconds
        setTimeout(verifyAndCompleteEnrollment, 3000);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to applicants page...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/staff/enrollments/applications')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Applications
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
