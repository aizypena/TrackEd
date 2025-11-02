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

const AddUserModal = ({ isOpen, onClose, onAdd, editMode = false, initialData = null }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Information
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '', // Not in DB but needed for validation
    role: 'student',
    status: 'active',
    // Personal Information
    address: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: '',
    nationality: '',
    marital_status: '',
    // Educational Background (for students only)
    education_level: '',
    field_of_study: '',
    institution_name: '',
    graduation_year: '',
    gpa: '',
    // Employment Information (for students only)
    employment_status: '',
    occupation: '',
    work_experience: '',
    // Program Information (for students only)
    course_program: '',
    // Emergency Contact
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
    // Profile Picture (will be handled separately)
    profile_picture: null,
    // Required Documents (for students and applicants)
    documents: {
      validId: null,
      transcript: null,
      diploma: null,
      passportPhoto: null
    }
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone_number: initialData.phone_number || '',
        password: '',
        confirm_password: '',
        role: initialData.role || 'student',
        status: initialData.status || 'active',
        address: initialData.address || '',
        date_of_birth: initialData.date_of_birth || '',
        place_of_birth: initialData.place_of_birth || '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        marital_status: initialData.marital_status || '',
        education_level: initialData.education_level || '',
        field_of_study: initialData.field_of_study || '',
        institution_name: initialData.institution_name || '',
        graduation_year: initialData.graduation_year || '',
        gpa: initialData.gpa || '',
        employment_status: initialData.employment_status || '',
        occupation: initialData.occupation || '',
        work_experience: initialData.work_experience || '',
        course_program: initialData.course_program || '',
        emergency_contact: initialData.emergency_contact || '',
        emergency_phone: initialData.emergency_phone || '',
        emergency_relationship: initialData.emergency_relationship || '',
        profile_picture: null,
        documents: {
          validId: null,
          transcript: null,
          diploma: null,
          passportPhoto: null
        }
      });
    } else if (!editMode) {
      // Reset form for create mode
      setFormData({
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
        profile_picture: null,
        documents: {
          validId: null,
          transcript: null,
          diploma: null,
          passportPhoto: null
        }
      });
    }
  }, [editMode, initialData]);

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

    console.log('Validating form data:', formData);

    // Basic Information Validation
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^9\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits starting with 9';
    }
    
    // Password validation - required for new users, optional for editing
    if (!editMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      // In edit mode, only validate if password is provided
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Student and applicant validation
    if ((formData.role === 'student' || formData.role === 'applicant') && !formData.course_program) {
      newErrors.course_program = 'Course program is required for students and applicants';
    }
    
    // Additional validation for trainer - removed employment_status requirement
    if (formData.role === 'trainer') {
      if (!formData.education_level) newErrors.education_level = 'Education level is required for trainers';
      if (!formData.field_of_study) newErrors.field_of_study = 'Field of study is required for trainers';
      if (!formData.institution_name) newErrors.institution_name = 'Institution name is required for trainers';
    }

    // Emergency phone validation (only if provided)
    if (formData.emergency_phone && !/^9\d{9}$/.test(formData.emergency_phone)) {
      newErrors.emergency_phone = 'Emergency phone must be 10 digits starting with 9';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      // Create FormData object for file uploads
      const formDataToSubmit = new FormData();

      // Add user data
      const userData = { ...formData };
      delete userData.confirm_password;
      delete userData.documents;
      delete userData.profile_picture;

      // Format phone numbers - remove +63 prefix
      if (userData.phone_number) {
        userData.phone_number = userData.phone_number.replace('+63', '');
      }
      if (userData.emergency_phone) {
        userData.emergency_phone = userData.emergency_phone.replace('+63', '');
      }

      // Append all user data
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== '') {
          formDataToSubmit.append(key, userData[key]);
        }
      });

      // Append documents properly
      if (formData.documents) {
        Object.keys(formData.documents).forEach(docType => {
          if (formData.documents[docType]) {
            formDataToSubmit.append(`documents[${docType}]`, formData.documents[docType], formData.documents[docType].name);
          }
        });
      }

      // Append profile picture if it exists
      if (formData.profile_picture) {
        formDataToSubmit.append('profile_picture', formData.profile_picture);
      }

      console.log('Submitting user data...');
      
      // Call parent handler which will make the API request
      const success = await onAdd(formDataToSubmit);

      if (success) {
        onClose();
        // Reset form
        setFormData({
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
          profile_picture: null,
          documents: {
            validId: null,
            transcript: null,
            diploma: null,
            passportPhoto: null
          }
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Display detailed error message
      let errorMessage = 'Failed to create user. ';
      
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data?.message || error.message;
        console.error('Server error:', error.response.data);
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
      setErrors({ 
        submit: errorMessage
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    }
  };

  const handleDrop = (e, documentType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (documentType) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: null
      }
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md bg-white/30">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div
          className="fixed inset-0 bg-transparent"
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-4xl bg-white rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {editMode ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                title='Close'
                className="rounded-md hover:cursor-pointer bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">
                    First Name*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPerson className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 text-gray-900 border ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">
                    Last Name*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPerson className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 text-gray-900 border ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdEmail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 text-gray-900 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone_number">
                    Phone Number*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                      <span className="text-gray-500">+63</span>
                    </div>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Remove any non-digit characters
                        value = value.replace(/\D/g, '');
                        // Remove leading zeros
                        value = value.replace(/^0+/, '');
                        // Ensure the number doesn't include the country code if user types it
                        value = value.replace(/^63/, '');
                        // Ensure the first digit is 9
                        if (value && value[0] !== '9') {
                          value = '';
                        }
                        // Update the form data
                        handleChange({
                          target: {
                            name: 'phone_number',
                            value: value
                          }
                        });
                      }}
                      placeholder="9XX XXX XXXX"
                      className={`block w-full pl-20 pr-3 py-2 text-gray-900 border ${
                        errors.phone_number ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      maxLength="10"
                      required
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>
                  )}
                  {!errors.phone_number && (
                    <p className="mt-1 text-xs text-gray-500">Format: +63 9XX XXX XXXX</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password{!editMode && '*'} {editMode && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 text-gray-900 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      required={!editMode}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm_password">
                    Confirm Password{!editMode && '*'}
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 text-gray-900 border ${
                        errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                      } outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                    Role*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdBusinessCenter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="student">Student</option>
                      <option value="applicant">Applicant</option>
                      <option value="admin">Admin</option>
                      <option value="trainer">Trainer</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Status*
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdVerified className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date_of_birth">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="place_of_birth">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    id="place_of_birth"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationality">
                    Nationality
                  </label>
                  <select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="marital_status">
                    Marital Status
                  </label>
                  <select
                    id="marital_status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Educational Background - Shown for students and trainers */}
            {(formData.role === 'student' || formData.role === 'trainer') && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="education_level">
                      Education Level
                    </label>
                    <select
                      id="education_level"
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Level</option>
                      <option value="high_school">High School</option>
                      <option value="vocational">Vocational</option>
                      <option value="college">College</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="field_of_study">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      id="field_of_study"
                      name="field_of_study"
                      value={formData.field_of_study}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="institution_name">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      id="institution_name"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="graduation_year">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      id="graduation_year"
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      min="1950"
                      max="2025"
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gpa">
                      GPA
                    </label>
                    <input
                      type="number"
                      id="gpa"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="4"
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 3.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Information - Shown for students and applicants */}
            {(formData.role === 'student' || formData.role === 'applicant') && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employment_status">
                      Employment Status
                    </label>
                    <select
                      id="employment_status"
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="employed">Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="self_employed">Self-employed</option>
                      <option value="student">Student</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="occupation">
                      Occupation
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="work_experience">
                      Work Experience
                    </label>
                    <textarea
                      id="work_experience"
                      name="work_experience"
                      value={formData.work_experience}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of work experience..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergency_contact">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="emergency_contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergency_phone">
                    Emergency Phone
                  </label>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                      <span className="text-gray-500">+63</span>
                    </div>
                    <input
                      type="tel"
                      id="emergency_phone"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Remove any non-digit characters
                        value = value.replace(/\D/g, '');
                        // Remove leading zeros
                        value = value.replace(/^0+/, '');
                        // Ensure the number doesn't include the country code if user types it
                        value = value.replace(/^63/, '');
                        // Ensure the first digit is 9
                        if (value && value[0] !== '9') {
                          value = '';
                        }
                        // Update the form data
                        handleChange({
                          target: {
                            name: 'emergency_phone',
                            value: value
                          }
                        });
                      }}
                      placeholder="9XX XXX XXXX"
                      className="block w-full pl-20 pr-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      maxLength="10"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: +63 9XX XXX XXXX</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergency_relationship">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="emergency_relationship"
                    name="emergency_relationship"
                    value={formData.emergency_relationship}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Program Information for Students and Applicants */}
            {(formData.role === 'student' || formData.role === 'applicant') && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="course_program">
                      Course Program*
                    </label>
                    <select
                      id="course_program"
                      name="course_program"
                      value={formData.course_program}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-gray-900 border border-gray-300 outline-none rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.role === 'student'}
                    >
                      <option value="">Select Program</option>
                      {programOptions.map(program => (
                        <option key={program.value} value={program.value}>
                          {program.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Document Upload Section - Only for students and applicants */}
            {(formData.role === 'student' || formData.role === 'applicant') && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valid ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid ID*
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 ${
                        formData.documents.validId ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      onDrop={(e) => handleDrop(e, 'validId')}
                      onDragOver={handleDragOver}
                    >
                      {formData.documents.validId ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MdVerified className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formData.documents.validId.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(formData.documents.validId.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('validId')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="validId"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'validId')}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor="validId"
                            className="cursor-pointer text-sm text-gray-600"
                          >
                            <span className="block mb-1">Drag and drop or click to upload</span>
                            <span className="text-xs text-gray-500">
                              Supported formats: PDF, JPG, PNG
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transcript of Records*
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 ${
                        formData.documents.transcript ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      onDrop={(e) => handleDrop(e, 'transcript')}
                      onDragOver={handleDragOver}
                    >
                      {formData.documents.transcript ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MdVerified className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formData.documents.transcript.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(formData.documents.transcript.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('transcript')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="transcript"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'transcript')}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor="transcript"
                            className="cursor-pointer text-sm text-gray-600"
                          >
                            <span className="block mb-1">Drag and drop or click to upload</span>
                            <span className="text-xs text-gray-500">
                              Supported formats: PDF, JPG, PNG
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diploma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diploma*
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 ${
                        formData.documents.diploma ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      onDrop={(e) => handleDrop(e, 'diploma')}
                      onDragOver={handleDragOver}
                    >
                      {formData.documents.diploma ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MdVerified className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formData.documents.diploma.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(formData.documents.diploma.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('diploma')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="diploma"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'diploma')}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor="diploma"
                            className="cursor-pointer text-sm text-gray-600"
                          >
                            <span className="block mb-1">Drag and drop or click to upload</span>
                            <span className="text-xs text-gray-500">
                              Supported formats: PDF, JPG, PNG
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Passport Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passport Size Photo*
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 ${
                        formData.documents.passportPhoto ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                      onDrop={(e) => handleDrop(e, 'passportPhoto')}
                      onDragOver={handleDragOver}
                    >
                      {formData.documents.passportPhoto ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MdVerified className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formData.documents.passportPhoto.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(formData.documents.passportPhoto.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('passportPhoto')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            id="passportPhoto"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'passportPhoto')}
                            accept=".jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor="passportPhoto"
                            className="cursor-pointer text-sm text-gray-600"
                          >
                            <span className="block mb-1">Drag and drop or click to upload</span>
                            <span className="text-xs text-gray-500">
                              Supported formats: JPG, PNG
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 hover:cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 hover:cursor-pointer bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {editMode ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;