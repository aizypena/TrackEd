import React, { useState, useEffect } from 'react';
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
import { userAPI } from '../../services/userAPI';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, onUpdate, userData }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'student',
    status: 'active',
    address: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: '',
    nationality: '',
    marital_status: '',
    education_level: '',
    field_of_study: '',
    institution_name: '',
    graduation_year: '',
    gpa: '',
    employment_status: '',
    occupation: '',
    work_experience: '',
    course_program: '',
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
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

  // Load user data when modal opens
  useEffect(() => {
    if (userData) {
      const normalizedGender = userData.gender ? userData.gender.toLowerCase() : '';
      const normalizedCourseProgram = userData.course_program ? String(userData.course_program) : '';
      
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        password: '',
        confirm_password: '',
        role: userData.role || 'student',
        status: userData.status || 'active',
        address: userData.address || '',
        date_of_birth: userData.date_of_birth || '',
        place_of_birth: userData.place_of_birth || '',
        gender: normalizedGender,
        nationality: userData.nationality || '',
        marital_status: userData.marital_status || '',
        education_level: userData.education_level || '',
        field_of_study: userData.field_of_study || '',
        institution_name: userData.institution_name || '',
        graduation_year: userData.graduation_year || '',
        gpa: userData.gpa || '',
        employment_status: userData.employment_status || '',
        occupation: userData.occupation || '',
        work_experience: userData.work_experience || '',
        course_program: normalizedCourseProgram,
        emergency_contact: userData.emergency_contact || '',
        emergency_phone: userData.emergency_phone || '',
        emergency_relationship: userData.emergency_relationship || '',
      });
      setErrors({});
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^9\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits starting with 9';
    }
    
    // Password is optional in edit mode
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    if ((formData.role === 'student' || formData.role === 'applicant') && !formData.course_program) {
      newErrors.course_program = 'Course program is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const updateData = { ...formData };
      delete updateData.confirm_password;
      
      // Remove password if not changing it
      if (!updateData.password) {
        delete updateData.password;
      }
      
      // Format phone numbers
      if (updateData.phone_number) {
        updateData.phone_number = updateData.phone_number.replace('+63', '');
      }
      if (updateData.emergency_phone) {
        updateData.emergency_phone = updateData.emergency_phone.replace('+63', '');
      }

      await onUpdate(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm transition-opacity" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="9171234567"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-gray-500 text-xs">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role*
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="applicant">Applicant</option>
                    <option value="trainer">Trainer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Nationality</option>
                    {nationalities.map(nationality => (
                      <option key={nationality.value} value={nationality.value}>
                        {nationality.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Program Information for students/applicants */}
            {(formData.role === 'student' || formData.role === 'applicant') && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Program*
                  </label>
                  <select
                    name="course_program"
                    value={formData.course_program}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {programOptions.map(program => (
                      <option key={program.value} value={program.value}>
                        {program.label}
                      </option>
                    ))}
                  </select>
                  {errors.course_program && <p className="mt-1 text-xs text-red-500">{errors.course_program}</p>}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    placeholder="9171234567"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergency_relationship"
                    value={formData.emergency_relationship}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default EditUserModal;
