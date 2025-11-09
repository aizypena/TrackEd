import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Navbar from '../../layouts/applicants/Navbar';
import { nationalities } from '../../utils/nationalities';
import { applicationAPI } from '../../services/applicationAPI';
import { programAPI } from '../../services/programAPI';

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // If user is applicant, redirect to dashboard
          if (parsedUser.role === 'applicant') {
            navigate('/applicant/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    nationality: '',
    birthDate: '',
    address: '',
    placeOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    maritalStatus: '',
    mobileNumber: '',
    
    // Personal Background
    education: '',
    school: '',
    courseProgram: '',
    
    // Additional Information
    employmentStatus: '',
    occupation: '',
    emergencyContact: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Required Documents
    documents: {
      validId: null,
      transcript: null,
      diploma: null,
      passportPhoto: null
    }
  });

  const [errors, setErrors] = useState({});

  // Fetch available programs on component mount
  useEffect(() => {
    const fetchAvailablePrograms = async () => {
      try {
        setLoadingPrograms(true);
        const response = await programAPI.getAll({ availability: 'available' });
        if (response.success) {
          setAvailablePrograms(response.data);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        setAvailablePrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchAvailablePrograms();
  }, []);

  const validatePhilippineMobileNumber = (number) => {
    // Philippine mobile number must be exactly 10 digits starting with 9
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    // Must be exactly 10 digits and start with 9
    return /^9\d{9}$/.test(cleanNumber);
  };

  const formatPhilippineMobileNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    // If starts with 63, remove it (handle +639 or 639 format)
    if (cleanNumber.startsWith('63') && cleanNumber.length > 2) {
      return cleanNumber.substring(2);
    }
    // If starts with 0, remove it (handle 09 format)
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.substring(1);
    }
    
    return cleanNumber;
  };

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Educational Background' },
    { number: 3, title: 'Additional Information' },
    { number: 4, title: 'Required Documents' },
    { number: 5, title: 'Success' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle mobile number fields with validation
    if (name === 'mobileNumber' || name === 'emergencyPhone') {
      const formattedNumber = formatPhilippineMobileNumber(value);
      
      // Restrict to exactly 10 digits
      if (formattedNumber.length <= 10) {
        const isValid = validatePhilippineMobileNumber(formattedNumber);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          [name]: formattedNumber
        }));
        
        // Update errors
        setErrors(prev => ({
          ...prev,
          [name]: formattedNumber && formattedNumber.length > 0 && formattedNumber.length < 10 
            ? 'Mobile number must be exactly 10 digits' 
            : formattedNumber && !isValid 
            ? 'Please enter a valid Philippine mobile number starting with 9' 
            : ''
        }));
      }
      // If more than 10 digits, don't update the state (prevent input)
    } else if (name === 'nationality') {
      // Handle nationality with Filipino validation
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update errors for nationality
      setErrors(prev => ({
        ...prev,
        [name]: value && value !== 'filipino' 
          ? 'This training program is currently only available for Filipino citizens.' 
          : ''
      }));
    } else if (name === 'password') {
      // Handle password validation
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update errors for password
      setErrors(prev => ({
        ...prev,
        [name]: value && value.length < 8 
          ? 'Password must be at least 8 characters long' 
          : '',
        confirmPassword: prev.confirmPassword && formData.confirmPassword !== value
          ? 'Passwords do not match'
          : ''
      }));
    } else if (name === 'confirmPassword') {
      // Handle confirm password validation
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update errors for confirm password
      setErrors(prev => ({
        ...prev,
        [name]: value && value !== formData.password 
          ? 'Passwords do not match' 
          : ''
      }));
    } else if (name === 'birthDate') {
      // Handle birth date validation (must be at least 18 years old)
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        
        // Set error if under 18
        if (age < 18) {
          setErrors(prev => ({
            ...prev,
            [name]: 'You must be at least 18 years old to apply'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            [name]: ''
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      // Handle other fields normally
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error if field has value
      if (value) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    
    // Check file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const handleDrop = (e, documentType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    
    // Check file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile numbers before showing modal
    const mobileValid = validatePhilippineMobileNumber(formData.mobileNumber) && formData.mobileNumber.length === 10;
    const emergencyPhoneValid = validatePhilippineMobileNumber(formData.emergencyPhone) && formData.emergencyPhone.length === 10;
    
    if (!mobileValid || !emergencyPhoneValid) {
      alert('Please enter valid 10-digit Philippine mobile numbers starting with 9 before submitting.');
      return;
    }
    
    // Check if required documents are uploaded
    if (currentStep === 4) {
      if (!formData.documents.validId || !formData.documents.transcript || !formData.documents.diploma || !formData.documents.passportPhoto) {
        alert('Please upload all required documents (Valid ID, Transcript of Record, Diploma, and Passport Size Picture) before submitting.');
        return;
      }
    }
    
    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const handleActualSubmit = async () => {
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields (exclude documents and confirmPassword)
      Object.keys(formData).forEach(key => {
        if (key !== 'documents' && key !== 'confirmPassword' && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add document files with individual field names
      if (formData.documents.validId) {
        submitData.append('validId', formData.documents.validId);
      }
      if (formData.documents.transcript) {
        submitData.append('transcript', formData.documents.transcript);
      }
      if (formData.documents.diploma) {
        submitData.append('diploma', formData.documents.diploma);
      }
      if (formData.documents.passportPhoto) {
        submitData.append('passportPhoto', formData.documents.passportPhoto);
      }
      
      const data = await applicationAPI.submit(submitData);
      
      if (data.success) {
        setShowConfirmModal(false); // Close the modal
        nextStep(); // Go to success page
      } else {
        alert(data.message || 'Application submission failed. Please try again.');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Application submission error:', error);
      alert(error.message || 'An error occurred while submitting your application. Please try again.');
      setShowConfirmModal(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Check required fields for step 1
      const requiredFields = ['firstName', 'lastName', 'nationality', 'birthDate', 'address', 'placeOfBirth', 'email', 'password', 'confirmPassword', 'gender', 'mobileNumber'];
      const hasAllRequired = requiredFields.every(field => formData[field]);
      
      if (!hasAllRequired) return false;
      
      // Check if nationality is Filipino
      if (formData.nationality !== 'filipino') {
        setErrors(prev => ({...prev, nationality: 'Only Filipino citizens can apply'}));
        return false;
      }
      
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
        return false;
      }
      
      // Check password strength
      if (formData.password.length < 8) {
        setErrors(prev => ({...prev, password: 'Password must be at least 8 characters long'}));
        return false;
      }
      
      // Check if user is at least 18 years old
      if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          setErrors(prev => ({...prev, birthDate: 'You must be at least 18 years old to apply'}));
          return false;
        }
      }
      
      return true;
    }
    if (currentStep === 4) {
      return formData.documents.validId && formData.documents.transcript && formData.documents.diploma && formData.documents.passportPhoto;
    }
    return true;
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                currentStep >= step.number 
                  ? 'bg-tracked-secondary border-tracked-secondary text-white shadow-md' 
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}>
                {currentStep > step.number ? (
                  // Show checkmark for completed steps
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              {/* Step Title */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  currentStep >= step.number ? 'text-tracked-secondary' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className={`h-1 w-16 mx-4 rounded-full transition-all duration-300 ${
                currentStep > step.number ? 'bg-tracked-secondary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPersonalInformation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dela Cruz"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
          <div className="relative">
            <select
              name="nationality"
              required
              value={formData.nationality}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 appearance-none bg-white ${
                errors.nationality 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              {nationalities.map((nationality) => (
                <option key={nationality.value} value={nationality.value}>
                  {nationality.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            name="birthDate"
            required
            value={formData.birthDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.birthDate 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth *</label>
          <input
            type="text"
            name="placeOfBirth"
            required
            value={formData.placeOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your place of birth"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email address"
          />
        </div>
        
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <div className="relative">
            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
          <div className="relative">
            <select
              name="maritalStatus"
              required
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select marital status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
              <option value="divorced">Divorced</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <AiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <AiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-lg mr-1">🇵🇭</span>
              <span className="text-gray-500 text-sm">+63</span>
            </div>
            <input
              type="tel"
              name="mobileNumber"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              className={`w-full pl-16 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.mobileNumber 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="9XX XXX XXXX"
            />
          </div>
          {errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter exactly 10 digits starting with 9 (e.g., 9171234567)
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
        <textarea
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your complete address"
        />
      </div>
    </div>
  );

  const renderEducationalBackground = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Highest Educational Attainment *</label>
        <div className="relative">
          <select
            name="education"
            required
            value={formData.education}
            onChange={handleChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Select education level</option>
            <option value="high-school">High School</option>
            <option value="college-graduate">College Graduate</option>
            <option value="masters">Master's Degree</option>
            <option value="doctorate">Doctorate</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School/Institution Attended *</label>
        <input
          type="text"
          name="school"
          required
          value={formData.school}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the name of your school or institution"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course/Program Applied For *</label>
        <div className="relative">
          <select
            name="courseProgram"
            required
            value={formData.courseProgram}
            onChange={handleChange}
            disabled={loadingPrograms}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingPrograms ? 'Loading programs...' : 'Select a training program'}
            </option>
            {availablePrograms.length > 0 ? (
              availablePrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))
            ) : (
              !loadingPrograms && <option value="" disabled>No programs available</option>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {loadingPrograms ? (
              <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
          </div>
        </div>
        {!loadingPrograms && availablePrograms.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            No training programs are currently available. Please check back later.
          </p>
        )}
      </div>
    </div>
  );

  const renderAdditionalInformation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
      {/* Employment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
          <div className="relative">
            <select
              name="employmentStatus"
              required
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select employment status</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
              <option value="self-employed">Self-employed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupation *</label>
          <input
            type="text"
            name="occupation"
            required
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your current occupation or 'N/A' if unemployed"
          />
        </div>
      </div>

      {/* Emergency Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Person Name *</label>
          <input
            type="text"
            name="emergencyContact"
            required
            value={formData.emergencyContact}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Full name of emergency contact"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Person Relationship *</label>
          <div className="relative">
            <select
              name="emergencyRelationship"
              required
              value={formData.emergencyRelationship}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select relationship</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="guardian">Guardian</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Person Number *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-lg mr-1">🇵🇭</span>
              <span className="text-gray-500 text-sm">+63</span>
            </div>
            <input
              type="tel"
              name="emergencyPhone"
              required
              value={formData.emergencyPhone}
              onChange={handleChange}
              className={`w-full pl-16 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.emergencyPhone 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="9XX XXX XXXX"
            />
          </div>
          {errors.emergencyPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter exactly 10 digits starting with 9
          </p>
        </div>
      </div>
    </div>
  );

  const renderRequiredDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
      <p className="text-sm text-gray-600 mb-6">Please upload the following required documents (Maximum file size: 10MB each):</p>
      
      <div className="space-y-6">
        {/* Valid ID Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valid ID (Driver's License, Passport, etc.) *</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.validId 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'validId')}
            onDragOver={handleDragOver}
          >
            {formData.documents.validId ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.validId.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.validId.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('validId')}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Drag and drop your file here, or</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 underline">browse to upload</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'validId')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Educational Transcript Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transcript of Record *</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.transcript 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'transcript')}
            onDragOver={handleDragOver}
          >
            {formData.documents.transcript ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.transcript.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.transcript.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('transcript')}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Drag and drop your file here, or</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 underline">browse to upload</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'transcript')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Diploma Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diploma *</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.diploma 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'diploma')}
            onDragOver={handleDragOver}
          >
            {formData.documents.diploma ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.diploma.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.diploma.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('diploma')}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Drag and drop your file here, or</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 underline">browse to upload</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'diploma')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Passport Size Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Passport Size Picture with White Background *</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.passportPhoto 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'passportPhoto')}
            onDragOver={handleDragOver}
          >
            {formData.documents.passportPhoto ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.passportPhoto.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.passportPhoto.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('passportPhoto')}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Drag and drop your file here, or</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 underline">browse to upload</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'passportPhoto')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Status Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Upload Summary:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.validId ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={formData.documents.validId ? 'text-green-700' : 'text-red-700'}>
              Valid ID {formData.documents.validId ? '✓' : '(Required)'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.transcript ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={formData.documents.transcript ? 'text-green-700' : 'text-red-700'}>
              Transcript of Record {formData.documents.transcript ? '✓' : '(Required)'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.diploma ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={formData.documents.diploma ? 'text-green-700' : 'text-red-700'}>
              Diploma {formData.documents.diploma ? '✓' : '(Required)'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.passportPhoto ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={formData.documents.passportPhoto ? 'text-green-700' : 'text-red-700'}>
              Passport Size Picture {formData.documents.passportPhoto ? '✓' : '(Required)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmationModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Review Your Application</h3>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Personal Information Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{formData.firstName} {formData.middleName} {formData.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Nationality:</span>
                  <p className="text-gray-900 capitalize">{formData.nationality?.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-900">{formData.birthDate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mobile Number:</span>
                  <p className="text-gray-900">🇵🇭 +63{formData.mobileNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <p className="text-gray-900 capitalize">{formData.gender}</p>
                </div>
              </div>
            </div>

            {/* Educational Background Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Educational Background</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Education Level:</span>
                  <p className="text-gray-900 capitalize">{formData.education?.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">School:</span>
                  <p className="text-gray-900">{formData.school}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Program Applied For:</span>
                  <p className="text-gray-900 capitalize">{formData.courseProgram?.replace('-', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Additional Information Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Employment Status:</span>
                  <p className="text-gray-900 capitalize">{formData.employmentStatus?.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Occupation:</span>
                  <p className="text-gray-900">{formData.occupation}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Emergency Contact:</span>
                  <p className="text-gray-900">{formData.emergencyContact}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Emergency Contact Phone:</span>
                  <p className="text-gray-900">🇵🇭 +63{formData.emergencyPhone}</p>
                </div>
              </div>
            </div>

            {/* Documents Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${formData.documents.validId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <span className="font-medium text-gray-700">Valid ID:</span>
                    <p className={formData.documents.validId ? 'text-green-700' : 'text-red-700'}>
                      {formData.documents.validId ? 'Uploaded ✓' : 'Not uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${formData.documents.transcript ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <span className="font-medium text-gray-700">Transcript:</span>
                    <p className={formData.documents.transcript ? 'text-green-700' : 'text-red-700'}>
                      {formData.documents.transcript ? 'Uploaded ✓' : 'Not uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${formData.documents.diploma ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <span className="font-medium text-gray-700">Diploma:</span>
                    <p className={formData.documents.diploma ? 'text-green-700' : 'text-red-700'}>
                      {formData.documents.diploma ? 'Uploaded ✓' : 'Not uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${formData.documents.passportPhoto ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <span className="font-medium text-gray-700">Passport Photo:</span>
                    <p className={formData.documents.passportPhoto ? 'text-green-700' : 'text-red-700'}>
                      {formData.documents.passportPhoto ? 'Uploaded ✓' : 'Not uploaded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Important Notice</h5>
                  <p className="text-sm text-blue-800">
                    Please review all information carefully. Once submitted, you will not be able to modify your application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-6 py-2 border hover:cursor-pointer border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleActualSubmit}
              className="px-6 py-2 bg-tracked-primary hover:cursor-pointer hover:bg-tracked-primary-700 text-white rounded-full transition-colors"
            >
              Confirm & Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Thank you!</h3>
        <p className="text-lg text-gray-600 mb-8">
          We'll email you once it's approved.
        </p>
        <div className="space-x-4">
          <Link 
            to="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-sm font-medium transition duration-200"
          >
            Back to Homepage
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="inline-block bg-gray-600 hover:cursor-pointer hover:bg-gray-700 text-white px-8 py-3 rounded-full text-sm font-medium transition duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return renderPersonalInformation();
      case 2:
        return renderEducationalBackground();
      case 3:
        return renderAdditionalInformation();
      case 4:
        return renderRequiredDocuments();
      case 5:
        return renderSuccess();
      default:
        return renderPersonalInformation();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Training Program Application
            </h1>
            <p className="text-gray-600">
              Join SMI Institute and advance your career with our comprehensive training programs
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {renderStepIndicator()}
            
            {currentStep < 5 ? (
              <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                {renderCurrentStep()}
                
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                      currentStep === 1 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    type="submit"
                    disabled={(currentStep === 1 && !canProceedToNextStep()) || (currentStep === 4 && !canProceedToNextStep())}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                      ((currentStep === 1 && !canProceedToNextStep()) || (currentStep === 4 && !canProceedToNextStep()))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-tracked-primary hover:bg-tracked-primary-700 text-white hover:cursor-pointer'
                    }`}
                  >
                    {currentStep === 4 ? 'Submit Application' : 'Next Step'}
                  </button>
                </div>
              </form>
            ) : (
              // Success step - no navigation buttons needed as they're included in the success content
              renderCurrentStep()
            )}
          </div>

          {/* Copyright */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © Copyright 2025 <span className="font-bold text-gray-700">SMI INSTITUTE INC.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && renderConfirmationModal()}
    </div>
  );
};

export default Signup;
