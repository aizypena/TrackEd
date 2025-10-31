import { 
  MdClose,
  MdHistory,
  MdCalendarToday,
  MdPayment,
  MdReceipt,
  MdPrint,
  MdDownload,
  MdWarning,
  MdCheckCircle,
  MdPending
} from 'react-icons/md';

const PaymentDetailModal = ({ student, onClose }) => {
  if (!student) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Paid'
      },
      voucher: {
        className: 'bg-purple-100 text-purple-800',
        icon: <MdCheckCircle className="h-4 w-4" />,
        label: 'Voucher'
      },
      partial: {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Partial'
      },
      unpaid: {
        className: 'bg-red-100 text-red-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Unpaid'
      },
      overdue: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdWarning className="h-4 w-4" />,
        label: 'Overdue'
      },
      processing: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdPending className="h-4 w-4" />,
        label: 'Processing'
      }
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{student.studentName}</h2>
              <p className="text-blue-100">{student.studentId} • {student.program}</p>
              <div className="flex gap-2 mt-2">
                {getPaymentStatusBadge(student.paymentStatus)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:cursor-pointer rounded-full p-2"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Fee</p>
              <p className="text-2xl font-bold text-blue-800 mt-2">{formatCurrency(student.totalFee)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Amount Paid</p>
              <p className="text-2xl font-bold text-green-800 mt-2">{formatCurrency(student.amountPaid)}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(student.amountPaid / student.totalFee) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((student.amountPaid / student.totalFee) * 100).toFixed(1)}% paid
                </p>
              </div>
            </div>
            <div className={`rounded-lg p-4 ${student.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Balance
              </p>
              <p className={`text-2xl font-bold mt-2 ${student.balance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                {formatCurrency(student.balance)}
              </p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdHistory className="h-5 w-5 text-tracked-primary" />
              Transaction History
            </h3>
            {student.transactions.length > 0 ? (
              <div className="space-y-3">
                {student.transactions.map((transaction, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MdCalendarToday className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{transaction.date}</span>
                          <span className="text-xs text-gray-500">• Receipt: {transaction.receiptNo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdPayment className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{transaction.method}</span>
                        </div>
                        {transaction.remarks && (
                          <p className="text-xs text-gray-500 mt-2 italic">{transaction.remarks}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <button className="mt-2 text-xs text-tracked-primary hover:text-tracked-secondary flex items-center gap-1">
                          <MdReceipt className="h-3 w-3" />
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MdWarning className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No payment transactions recorded yet.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
            {student.balance > 0 && student.paymentStatus !== 'voucher' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors">
                <MdPayment className="h-5 w-5" />
                Record Payment
              </button>
            )}
            <button className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <MdDownload className="h-5 w-5" />
              Download Statement
            </button>
            <button 
              onClick={onClose}
              className="ml-auto hover:cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
