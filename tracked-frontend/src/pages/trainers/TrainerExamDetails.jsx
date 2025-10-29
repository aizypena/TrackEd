import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MdArrowBack, MdAssignment, MdAccessTime, MdCheckCircle, MdPeople, MdCheck, MdClose, MdEdit } from 'react-icons/md';
import axios from 'axios';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import { quizService } from '../../services/quizService';

const TrainerExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const [examData, setExamData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    if (examData) {
      fetchStudents();
    }
  }, [examData]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuiz(examId);
      if (response.success) {
        setExamData(response.data);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!examData?.batch_id) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('trainerToken');
      const response = await axios.get(
        `http://localhost:8000/api/quizzes/${examId}/students`,
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

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-100">
        <TrainerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading exam details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="relative min-h-screen bg-gray-100">
        <TrainerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <p className="text-gray-600">Exam not found</p>
              <Link to="/trainer-lms/exams" className="mt-4 text-blue-600 hover:text-blue-700">
                Back to Exams
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/trainer-lms/exams"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <MdArrowBack className="h-5 w-5 mr-2" />
                Back to Exams
              </Link>
              <Link
                to={`/trainer-lms/exams/edit/${examId}`}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <MdEdit className="h-5 w-5 mr-2" />
                Edit Exam
              </Link>
            </div>

            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{examData.title}</h1>
              <p className="text-gray-600 mt-1">{examData.description || 'No description'}</p>
              <div className="flex items-center space-x-4 mt-2">
                {getStatusBadge(examData.status)}
                <span className="text-sm text-gray-600">
                  Batch: <span className="font-medium">{examData.batch_id || 'Not assigned'}</span>
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">Questions</p>
                <p className="text-xl font-semibold text-gray-900">{examData.questions?.length || 0}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">Time Limit</p>
                <p className="text-xl font-semibold text-gray-900">{examData.time_limit} min</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Points</p>
                <p className="text-xl font-semibold text-gray-900">{examData.total_points}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">Passing Score</p>
                <p className="text-xl font-semibold text-gray-900">{examData.passing_score}%</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Questions ({examData.questions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Students ({students.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'questions' ? (
            /* Questions Tab */
            <div>
              {examData.questions && examData.questions.length > 0 ? (
                <div className="space-y-4">
                  {examData.questions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Question {index + 1}
                            </span>
                            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                              {getQuestionTypeLabel(question.type)}
                            </span>
                          </div>
                          <p className="text-base text-gray-900">{question.question}</p>
                        </div>
                        <div className="ml-4">
                          <span className="text-sm text-gray-600">
                            {question.points} pt{question.points > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Options */}
                      {question.options && question.options.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={option.id} 
                              className={`flex items-center p-3 rounded-lg border ${
                                option.is_correct 
                                  ? 'bg-gray-50 border-gray-300' 
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                <span className="mr-3 text-sm font-medium text-gray-600">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span className={`text-sm ${
                                  option.is_correct ? 'font-medium text-gray-900' : 'text-gray-700'
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
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Note:</strong> This is a short answer question. Answers will need to be graded manually.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                  <MdAssignment className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-base font-medium text-gray-900">No questions added yet</p>
                  <p className="text-sm text-gray-600 mt-1">Add questions to this exam to get started</p>
                  <Link
                    to={`/trainer-lms/exams/edit/${examId}`}
                    className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <MdEdit className="h-5 w-5 mr-2" />
                    Add Questions
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Students Tab */
            <div>
              {loadingStudents ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Completed Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr 
                            key={student.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                student.has_taken 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {student.has_taken ? (
                                  <>
                                    <MdCheck className="h-4 w-4 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <MdClose className="h-4 w-4 mr-1" />
                                    Not Taken
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{student.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.has_taken ? (
                                <div className="text-sm font-medium text-gray-900">
                                  {student.score !== null && student.score !== undefined 
                                    ? `${student.score}/${examData.total_points}` 
                                    : 'Completed'}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.completed_at ? (
                                <div className="text-sm text-gray-600">
                                  {new Date(student.completed_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                  <MdPeople className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-base font-medium text-gray-900">No students in this batch</p>
                  <p className="text-sm text-gray-600 mt-1">Assign a batch to this exam to see students</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerExamDetails;
