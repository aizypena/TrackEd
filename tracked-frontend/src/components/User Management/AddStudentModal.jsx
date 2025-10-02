import React, { useState } from 'react';
import {
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdLock,
  MdVerified,
  MdBusinessCenter,
} from 'react-icons/md';
import { nationalities } from '../../utils/nationalities';

const AddStudentModal = ({ isOpen, onClose, onAdd }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Information
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'student', // Default and fixed for student modal
    status: 'active',
    // Personal Information
    address: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: '',
    nationality: '',
    // Student-specific Information
    student_id: '',
    enrollment_date: '',
    current_semester: '',
    // Educational Background
    education_level: '',
    previous_school: '',
    graduation_year: '',
    // Program Information
    course_program: '',
    // Emergency Contact
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
    // Profile Picture
    profile_picture: null
  });

  const programOptions = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II' },
    { value: 'events-management-nc-iii', label: 'Events Management NC III' },
    { value: 'chefs-catering-services-nc-ii', label: "Chef's Catering Services NC II" },
    { value: 'cookery-nc-ii', label: 'Cookery NC II' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    if (!formData.phone_number.startsWith('9')) newErrors.phone_number = 'Phone number must start with 9';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Student-specific validation
    if (!formData.student_id) newErrors.student_id = 'Student ID is required';
    if (!formData.enrollment_date) newErrors.enrollment_date = 'Enrollment date is required';
    if (!formData.course_program) newErrors.course_program = 'Course program is required';
    if (!formData.current_semester) newErrors.current_semester = 'Current semester is required';

    // Phone number validation
    if (formData.phone_number && !/^9\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }
    if (formData.emergency_phone && !/^9\d{9}$/.test(formData.emergency_phone)) {
      newErrors.emergency_phone = 'Invalid emergency phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare data for submission
    const submitData = { ...formData };
    delete submitData.confirm_password;

    try {
      await onAdd(submitData);
      onClose();
    } catch (error) {
      console.error('Error adding student:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to add student. Please try again.'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone_number' || name === 'emergency_phone') {
      // Only allow numbers and limit to 10 digits for phone numbers
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>

          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+63</span>
                  </div>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.phone_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="9XX XXX XXXX"
                    required
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.student_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.student_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.enrollment_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.enrollment_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.enrollment_date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Program *
                </label>
                <div className="mt-1">
                  <select
                    name="course_program"
                    value={formData.course_program}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.course_program ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a program</option>
                    {programOptions.map(program => (
                      <option key={program.value} value={program.value}>
                        {program.label}
                      </option>
                    ))}
                  </select>
                  {errors.course_program && (
                    <p className="mt-1 text-sm text-red-600">{errors.course_program}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Semester *
                </label>
                <div className="mt-1">
                  <select
                    name="current_semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.current_semester ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select semester</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="summer">Summer</option>
                  </select>
                  {errors.current_semester && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_semester}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="emergency_relationship"
                    value={formData.emergency_relationship}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Phone
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+63</span>
                  </div>
                  <input
                    type="text"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.emergency_phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="9XX XXX XXXX"
                  />
                  {errors.emergency_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergency_phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Student
            </button>
          </div>

          {errors.submit && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;