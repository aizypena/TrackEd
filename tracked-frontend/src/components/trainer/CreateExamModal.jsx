import { useState } from 'react';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';

const CreateExamModal = ({ isOpen, onClose, onSuccess, examType = 'written', batches = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batch_id: '',
    duration: 60,
    passing_score: 85,
    retake_limit: 1,
    status: 'draft',
  });

  const [questions, setQuestions] = useState([
    {
      question: '',
      type: 'multiple_choice',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ]
    }
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
  ];

  // Debug: Log batches when they change
  if (isOpen && batches.length === 0) {
    console.warn('CreateExamModal: No batches available');
  }

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    
    // If changing to true/false, adjust options
    if (field === 'type' && value === 'true_false') {
      newQuestions[index].options = [
        { option_text: 'True', is_correct: false },
        { option_text: 'False', is_correct: false },
      ];
    }
    // If changing to short answer, clear options
    else if (field === 'type' && value === 'short_answer') {
      newQuestions[index].options = [];
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...questions];
    
    if (field === 'is_correct' && value === true) {
      // For multiple choice, uncheck other options
      if (newQuestions[questionIndex].type === 'multiple_choice') {
        newQuestions[questionIndex].options.forEach((opt, idx) => {
          opt.is_correct = idx === optionIndex;
        });
      }
      // For true/false, uncheck the other option
      else if (newQuestions[questionIndex].type === 'true_false') {
        newQuestions[questionIndex].options.forEach((opt, idx) => {
          opt.is_correct = idx === optionIndex;
        });
      }
    } else {
      newQuestions[questionIndex].options[optionIndex][field] = value;
    }
    
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'multiple_choice',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ]
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuestions(newQuestions);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.batch_id) {
      newErrors.batch_id = 'Batch is required';
    }
    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }
    if (formData.passing_score < 0 || formData.passing_score > 100) {
      newErrors.passing_score = 'Passing score must be between 0 and 100';
    }
    if (formData.retake_limit < 1) {
      newErrors.retake_limit = 'Retake limit must be at least 1';
    }

    // Validate questions
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question_${index}`] = 'Question text is required';
      }
      if (q.points < 1) {
        newErrors[`question_${index}_points`] = 'Points must be at least 1';
      }
      
      // Validate options for multiple choice and true/false
      if (q.type !== 'short_answer') {
        const hasCorrectAnswer = q.options.some(opt => opt.is_correct);
        if (!hasCorrectAnswer) {
          newErrors[`question_${index}_correct`] = 'At least one correct answer must be selected';
        }
        
        q.options.forEach((opt, optIndex) => {
          if (!opt.option_text.trim()) {
            newErrors[`question_${index}_option_${optIndex}`] = 'Option text is required';
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const quizData = {
        ...formData,
        type: examType,
        questions: questions.map(q => ({
          question: q.question,
          type: q.type,
          points: parseInt(q.points),
          options: q.type !== 'short_answer' ? q.options : []
        }))
      };

      await onSuccess(quizData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating exam:', error);
      setErrors({ submit: error.message || 'Failed to create exam' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      batch_id: '',
      duration: 60,
      passing_score: 85,
      retake_limit: 1,
      status: 'draft',
    });
    setQuestions([
      {
        question: '',
        type: 'multiple_choice',
        points: 1,
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
      }
    ]);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create Written Exam</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new written test with questions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Bartending Fundamentals Written Test"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the exam..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Batch *
                </label>
                <select
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.batch_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={batches.length === 0}
                >
                  <option value="">
                    {batches.length === 0 ? 'Loading batches...' : 'Select Batch'}
                  </option>
                  {batches && batches.length > 0 && batches.map((batch) => (
                    <option key={batch.value} value={batch.value}>
                      {batch.label} ({batch.student_count} students)
                    </option>
                  ))}
                </select>
                {errors.batch_id && <p className="text-red-500 text-xs mt-1">{errors.batch_id}</p>}
                {batches.length === 0 && (
                  <p className="text-amber-600 text-xs mt-1">
                    No batches assigned to you yet.
                  </p>
                )}
                {batches.length > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    {batches.length} batch{batches.length !== 1 ? 'es' : ''} available
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.passing_score ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.passing_score && <p className="text-red-500 text-xs mt-1">{errors.passing_score}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retake Limit *
                </label>
                <input
                  type="number"
                  name="retake_limit"
                  value={formData.retake_limit}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center hover:cursor-pointer px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800 hover:cursor-pointer"
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`question_${qIndex}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your question..."
                  />
                  {errors[`question_${qIndex}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`question_${qIndex}`]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Type *
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points *
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`question_${qIndex}_points`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`question_${qIndex}_points`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`question_${qIndex}_points`]}</p>
                    )}
                  </div>
                </div>

                {/* Options for Multiple Choice and True/False */}
                {question.type !== 'short_answer' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options *
                      </label>
                      {question.type === 'multiple_choice' && (
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type={question.type === 'multiple_choice' ? 'radio' : 'radio'}
                            name={`correct_${qIndex}`}
                            checked={option.is_correct}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, 'is_correct', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <input
                            type="text"
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, 'option_text', e.target.value)}
                            disabled={question.type === 'true_false'}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`question_${qIndex}_option_${optIndex}`] ? 'border-red-500' : 'border-gray-300'
                            } ${question.type === 'true_false' ? 'bg-gray-100' : ''}`}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          {question.type === 'multiple_choice' && question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="text-red-600 hover:text-red-800 hover:cursor-pointer"
                            >
                              <MdDelete className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors[`question_${qIndex}_correct`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`question_${qIndex}_correct`]}</p>
                    )}
                  </div>
                )}

                {question.type === 'short_answer' && (
                  <p className="text-sm text-gray-600 italic">
                    Students will provide a text answer. Manual grading required.
                  </p>
                )}
              </div>
            ))}
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:cursor-pointer bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExamModal;
