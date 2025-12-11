import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdError, MdArrowBack } from 'react-icons/md';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MdError className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. This may be due to insufficient funds, 
          a cancelled transaction, or a technical issue.
        </p>

        {/* Details */}
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <p className="text-gray-600">
              Payment Reference: <span className="font-medium text-gray-900">{paymentId}</span>
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">What you can do:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check your e-wallet balance and try again</li>
            <li>• Use a different payment method</li>
            <li>• Contact staff if the issue persists</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/staff/enrollments/applications')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            <MdArrowBack className="h-5 w-5" />
            Back to Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
