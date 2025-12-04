import { MdClose, MdAssignment, MdAccessTime, MdCheckCircle, MdPeople, MdCheck, MdClose as MdX } from 'react-icons/md';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ViewExamModal = ({ isOpen, onClose, examData }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen && examData && activeTab === 'students') {
      fetchStudents();
    }
  }, [isOpen, examData, activeTab]);

  const fetchStudents = async () => {
    if (!examData?.batch_id) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      const token = sessionStorage.getItem('trainerToken');
      const response = await axios.get(
        `http://localhost:8000/api/quizzes/${examData.id}/students`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!isOpen) return null;

  if (!examData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          <div className="relative bg-white rounded-lg p-6">
            <p className="text-gray-600">Loading exam data...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'draft':
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>;
      case 'archived':
        return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">Archived</span>;
      default:
        return null;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <MdAssignment className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {examData.title}
                  </h3>
                  <p className="text-sm text-blue-100">{examData.description || 'No description'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Questions</p>
                <p className="text-lg font-bold text-white">{examData.questions?.length || 0}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Time Limit</p>
                <p className="text-lg font-bold text-white">{examData.time_limit} min</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Total Points</p>
                <p className="text-lg font-bold text-white">{examData.total_points}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Passing</p>
                <p className="text-lg font-bold text-white">{examData.passing_score}%</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions ({examData.questions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({students.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[calc(100vh-350px)] overflow-y-auto">
            {activeTab === 'questions' ? (
              /* Questions Tab */
              <div>
                {examData.questions && examData.questions.length > 0 ? (
                  <div className="space-y-4">
                    {examData.questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                                Question {index + 1}
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                                {getQuestionTypeLabel(question.type)}
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium">{question.question}</p>
                          </div>
                          <div className="ml-4 text-right">
                            <span className="text-sm font-semibold text-blue-600">
                              {question.points} pt{question.points > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Options */}
                        {question.options && question.options.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={option.id} 
                                className={`flex items-center p-3 rounded-lg border ${
                                  option.is_correct 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center flex-1">
                                  <span className="mr-3 text-sm font-medium text-gray-500">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span className={`text-sm ${
                                    option.is_correct ? 'text-green-900 font-medium' : 'text-gray-700'
                                  }`}>
                                    {option.option_text}
                                  </span>
                                </div>
                                {option.is_correct && (
                                  <MdCheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'short_answer' && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Note:</strong> This is a short answer question. Answers will need to be graded manually.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MdAssignment className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">No questions added yet</p>
                    <p className="text-xs text-gray-500">Add questions to this exam to get started</p>
                  </div>
                )}
              </div>
            ) : (
              /* Students Tab */
              <div>
                {loadingStudents ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading students...</p>
                  </div>
                ) : students.length > 0 ? (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div 
                        key={student.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          student.has_taken 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            student.has_taken 
                              ? 'bg-green-100' 
                              : 'bg-gray-200'
                          }`}>
                            {student.has_taken ? (
                              <MdCheck className="h-6 w-6 text-green-600" />
                            ) : (
                              <MdX className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {student.has_taken ? (
                            <div>
                              <p className="text-sm font-semibold text-green-600">
                                {student.score !== null && student.score !== undefined 
                                  ? `${student.score}/${examData.total_points}` 
                                  : 'Completed'}
                              </p>
                              {student.completed_at && (
                                <p className="text-xs text-gray-500">
                                  {new Date(student.completed_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-gray-500">Not taken</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MdPeople className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">No students in this batch</p>
                    <p className="text-xs text-gray-500">Assign a batch to this exam to see students</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  {getStatusBadge(examData.status)}
                </div>
                <div className="text-sm text-gray-500">
                  Batch: <span className="font-medium text-gray-900">{examData.batch_id || 'Not assigned'}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExamModal;
