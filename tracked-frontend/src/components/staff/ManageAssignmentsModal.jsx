import { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdCalendarToday, MdCheckCircle, MdWarning } from 'react-icons/md';
import axios from 'axios';

const ManageAssignmentsModal = ({ isOpen, onClose, equipment, onSuccess, onError }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returningId, setReturningId] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [condition, setCondition] = useState('good');
  const [showReturnForm, setShowReturnForm] = useState(null);

  useEffect(() => {
    if (isOpen && equipment) {
      fetchActiveAssignments();
    }
  }, [isOpen, equipment]);

  const fetchActiveAssignments = async () => {
    try {
      setLoading(true);
      const API_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('staffToken') || localStorage.getItem('adminToken');

      const response = await axios.get(
        `${API_URL}/equipment/${equipment.id}/assignments/active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      onError('Failed to load active assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assignmentId) => {
    setReturningId(assignmentId);
    try {
      const API_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('staffToken') || localStorage.getItem('adminToken');

      const response = await axios.post(
        `${API_URL}/equipment/assignments/${assignmentId}/return`,
        {
          return_notes: returnNotes,
          condition: condition
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onSuccess();
        setShowReturnForm(null);
        setReturnNotes('');
        setCondition('good');
        fetchActiveAssignments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error returning equipment:', error);
      onError(error.response?.data?.message || 'Failed to return equipment');
    } finally {
      setReturningId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white sticky top-0 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MdPerson className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Active Assignments</h2>
                <p className="text-sm text-blue-100 mt-1">{equipment.name}</p>
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
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
              <p className="mt-4 text-gray-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <MdCheckCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-gray-500">No active assignments</p>
              <p className="text-sm text-gray-400 mt-2">All equipment is available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`border rounded-lg p-4 ${
                    isOverdue(assignment.due_date) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  {/* Assignment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <MdPerson className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{assignment.user?.name}</h3>
                        <p className="text-sm text-gray-600">{assignment.user?.email}</p>
                        {assignment.user?.course && (
                          <p className="text-xs text-gray-500 mt-1">{assignment.user.course}</p>
                        )}
                      </div>
                    </div>
                    {isOverdue(assignment.due_date) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <MdWarning className="h-4 w-4" />
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Assignment Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-bold text-gray-900">{assignment.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned</p>
                      <p className="font-semibold text-gray-900">{formatDate(assignment.assigned_at)}</p>
                    </div>
                  </div>

                  {/* Purpose and Notes */}
                  {assignment.purpose && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Purpose</p>
                      <p className="text-sm text-gray-700">{assignment.purpose}</p>
                    </div>
                  )}
                  {assignment.notes && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-gray-700">{assignment.notes}</p>
                    </div>
                  )}

                  {/* Return Form */}
                  {showReturnForm === assignment.id ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <h4 className="font-semibold text-gray-900">Return Equipment</h4>
                      
                      {/* Condition Select */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment Condition
                        </label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>

                      {/* Return Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Return Notes (Optional)
                        </label>
                        <textarea
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                          rows="2"
                          placeholder="Any damage, issues, or comments..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReturn(assignment.id)}
                          disabled={returningId === assignment.id}
                          className="flex-1 flex items-center hover:cursor-pointer justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {returningId === assignment.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <MdCheckCircle className="h-5 w-5" />
                              <span>Confirm Return</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowReturnForm(null);
                            setReturnNotes('');
                            setCondition('good');
                          }}
                          className="px-4 py-2 hover:cursor-pointer bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReturnForm(assignment.id)}
                      className="w-full hover:cursor-pointer mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <MdCheckCircle className="h-5 w-5" />
                      Return Equipment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full hover:cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAssignmentsModal;
