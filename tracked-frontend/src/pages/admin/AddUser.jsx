import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/admin/Sidebar';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/userAPI';
import { nationalities } from '../../utils/nationalities';
import { 
  MdArrowBack, 
  MdSave, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdMenu,
  MdSupervisorAccount
} from 'react-icons/md';

function AddUser() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'student',
    status: 'active',
    batch_id: '',
    address: '',
    date_of_birth: '',
    gender: '',
    nationality: 'filipino',
    // Additional fields for applicant role
    place_of_birth: '',
    marital_status: '',
    education: '',
    school: '',
    course_program: '',
    employment_status: '',
    occupation: '',
    emergency_contact: '',
    emergency_relationship: '',
    emergency_phone: '',
    // Documents for applicant role
    documents: {
      validId: null,
      transcript: null,
      diploma: null,
      passportPhoto: null
    }
  });

  // Get admin user info from localStorage
  const adminUser = JSON.parse(sessionStorage.getItem('adminUser') || '{}');

  // Fetch available programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('https://api.smitracked.cloud/api/programs');
        if (response.ok) {
          const data = await response.json();
          setAvailablePrograms(data.data || []);
        }
      } catch (error) {
        toast.error('Failed to load programs');
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch batches for selected program
  const fetchBatches = async (programId) => {
    setLoadingBatches(true);
    setAvailableBatches([]);
    try {
      const response = await fetch(`https://api.smitracked.cloud/api/public/batches/${programId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableBatches(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear email error when user types in email field
    if (name === 'email') {
      setEmailError('');
    }
    
    // Fetch batches when program is selected (for students)
    if (name === 'course_program' && value && formData.role === 'student') {
      fetchBatches(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        batch_id: '' // Reset batch when program changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    
    // Check file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
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
      toast.error('File size must be less than 10MB');
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

  const checkEmailExists = async (email) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      toast.error('Failed to validate email. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email already exists
    if (!formData.email) {
      setEmailError('Email is required');
      document.querySelector('input[name="email"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setCheckingEmail(true);
    setEmailError('');
    const emailExists = await checkEmailExists(formData.email);
    setCheckingEmail(false);

    if (emailExists) {
      setEmailError('This email is already registered in the system');
      document.querySelector('input[name="email"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Validate passwords only for non-student roles
    if (formData.role !== 'student') {
      if (formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
    }

    // Validate phone number
    if (formData.phone_number.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // Validate phone number starts with 9
    if (!formData.phone_number.startsWith('9')) {
      toast.error('Phone number must start with 9');
      return;
    }

    // Additional validation for applicant role
    if (formData.role === 'applicant') {
      if (formData.emergency_phone && formData.emergency_phone.length !== 10) {
        toast.error('Emergency phone number must be exactly 10 digits');
        return;
      }
      if (formData.emergency_phone && !formData.emergency_phone.startsWith('9')) {
        toast.error('Emergency phone number must start with 9');
        return;
      }
      
      // Validate required documents for applicants
      if (!formData.documents.validId || !formData.documents.transcript || 
          !formData.documents.diploma || !formData.documents.passportPhoto) {
        toast.error('All document uploads are required for applicants');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare form data
      let submitData;
      
      if (formData.role === 'applicant' && (formData.documents.validId || formData.documents.transcript || 
          formData.documents.diploma || formData.documents.passportPhoto)) {
        // Use FormData for file uploads
        submitData = new FormData();
        
        // Append all form fields
        Object.keys(formData).forEach(key => {
          if (key !== 'documents' && key !== 'confirm_password') {
            // Skip password for students (will be auto-generated by backend)
            if (key === 'password' && formData.role === 'student') {
              return;
            }
            // Skip empty password fields
            if (key === 'password' && !formData[key]) {
              return;
            }
            // Map field names to match backend expectations
            if (key === 'education') {
              submitData.append('education_level', formData[key]);
              return;
            }
            if (key === 'school') {
              submitData.append('institution_name', formData[key]);
              return;
            }
            submitData.append(key, formData[key]);
          }
        });
        
        // Append documents
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
      } else {
        // Regular JSON data for non-applicants or applicants without documents
        submitData = { ...formData };
        delete submitData.documents;
        delete submitData.confirm_password;
        
        // Map field names to match backend expectations
        if (submitData.education) {
          submitData.education_level = submitData.education;
          delete submitData.education;
        }
        if (submitData.school) {
          submitData.institution_name = submitData.school;
          delete submitData.school;
        }
        
        // For students, don't send password (will be auto-generated by backend)
        if (formData.role === 'student') {
          delete submitData.password;
        }
        
        // Also remove empty password fields
        if (!submitData.password) {
          delete submitData.password;
        }
      }
      
      const response = await userAPI.createUser(submitData);
      
      if (response.success) {
        // Get the created user from the response
        const createdUser = response.user || response.data;
        
        // Show appropriate success message
        if (formData.role === 'student') {
          toast.success('Student account created! Password has been sent to their email.');
        } else {
          toast.success('User added successfully!');
        }
        
        // Log user creation
        const token = sessionStorage.getItem('adminToken') || JSON.parse(sessionStorage.getItem('adminUser') || '{}').token;
        if (token) {
          await fetch('https://api.smitracked.cloud/api/log-action', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              action: 'user_created',
              description: `Admin created new user: ${createdUser.first_name} ${createdUser.last_name} (${createdUser.email}) with role: ${createdUser.role}`,
              log_level: 'info'
            })
          });
        }
        
        navigate('/admin/all-users');
      } else {
        toast.error(response.message || 'Failed to add user');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add user');
      
      // Log failed creation attempt
      try {
        const token = sessionStorage.getItem('adminToken') || JSON.parse(sessionStorage.getItem('adminUser') || '{}').token;
        if (token) {
          await fetch('https://api.smitracked.cloud/api/log-action', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              action: 'user_creation_failed',
              description: `Admin failed to create user: ${formData.email || 'unknown'} - Error: ${error.message}`,
              log_level: 'error'
            })
          });
        }
      } catch (logError) {
        // Silent fail for logging error
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop: Always visible, Mobile: Toggle */}
      <div className="hidden lg:block">
        <Sidebar 
          isOpen={true} 
          onClose={() => {}}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                <p className="text-sm text-gray-600">Create a new user account in the system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MdSupervisorAccount className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/admin/all-users')}
              className="mb-6 inline-flex items-center hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MdArrowBack className="h-4 w-4 mr-2" />
              Back to Users
            </button>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                <p className="mt-1 text-sm text-gray-600">Fill in the details to create a new user account</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Role Selection */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        User Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="student">Student</option>
                        <option value="applicant">Applicant</option>
                        <option value="trainer">Trainer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p className="mt-1 text-xs text-blue-600">
                        {formData.role === 'applicant' 
                          ? 'Applicant selected - Additional fields will be shown below' 
                          : 'Select the role for this user account'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Account Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        required
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <p className="mt-1 text-xs text-blue-600">Set initial account status</p>
                    </div>
                  </div>
                </div>

                {/* Program & Batch Selection - Only for Students */}
                {formData.role === 'student' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Program & Batch Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Training Program <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="course_program"
                            required
                            value={formData.course_program}
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Batch <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="batch_id"
                            required
                            value={formData.batch_id}
                            onChange={handleChange}
                            disabled={!formData.course_program || loadingBatches}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!formData.course_program
                                ? 'Select a program first'
                                : loadingBatches
                                ? 'Loading batches...'
                                : 'Select a batch'}
                            </option>
                            {availableBatches.length > 0 ? (
                              availableBatches.map((batch) => (
                                <option key={batch.id} value={batch.batch_id}>
                                  {batch.batch_id} - {batch.schedule_days} ({batch.schedule_time_start} - {batch.schedule_time_end})
                                </option>
                              ))
                            ) : (
                              !loadingBatches && formData.course_program && <option value="" disabled>No batches available</option>
                            )}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {loadingBatches ? (
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
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-green-600">Select the program and batch for this student</p>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MdPerson className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dela Cruz"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setNationalityDropdownOpen(!nationalityDropdownOpen)}
                          className="w-full px-3 py-2 pr-10 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {nationalities.find(n => n.value === formData.nationality)?.label || 'Select nationality'}
                        </button>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${nationalityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                        
                        {nationalityDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setNationalityDropdownOpen(false)}
                            ></div>
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {nationalities.map((nationality) => (
                                <div
                                  key={nationality.value}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, nationality: nationality.value }));
                                    setNationalityDropdownOpen(false);
                                  }}
                                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                                    formData.nationality === nationality.value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                                  }`}
                                >
                                  {nationality.label}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Place of Birth {(formData.role === 'applicant' || formData.role === 'student') && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name="place_of_birth"
                        required={formData.role === 'applicant' || formData.role === 'student'}
                        value={formData.place_of_birth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter place of birth"
                      />
                    </div>
                  </div>

                  {(formData.role === 'applicant' || formData.role === 'student') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="marital_status"
                        required
                        value={formData.marital_status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select marital status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                        <option value="divorced">Divorced</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Educational Background - For Applicants and Students */}
                {(formData.role === 'applicant' || formData.role === 'student') && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <MdPerson className="h-5 w-5 mr-2 text-blue-600" />
                      Educational Background
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Highest Educational Attainment <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="education"
                          required
                          value={formData.education}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select education level</option>
                          <option value="high-school">High School</option>
                          <option value="college-graduate">College Graduate</option>
                          <option value="masters">Master's Degree</option>
                          <option value="doctorate">Doctorate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School/Institution Attended <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="school"
                          required
                          value={formData.school}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Name of school or institution"
                        />
                      </div>
                    </div>
                    {formData.role === 'applicant' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course/Program Applied For <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="course_program"
                          required
                          value={formData.course_program}
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
                          No training programs are currently available. Please add programs first.
                        </p>
                      )}
                    </div>
                    )}
                  </div>
                )}

                {/* Employment & Emergency Contact - For Applicants and Students */}
                {(formData.role === 'applicant' || formData.role === 'student') && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Employment & Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employment Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="employment_status"
                          required
                          value={formData.employment_status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select employment status</option>
                          <option value="employed">Employed</option>
                          <option value="unemployed">Unemployed</option>
                          <option value="student">Student</option>
                          <option value="self-employed">Self-employed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Occupation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          required
                          value={formData.occupation}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Current occupation or 'N/A'"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emergency_contact"
                          required
                          value={formData.emergency_contact}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="emergency_relationship"
                          required
                          value={formData.emergency_relationship}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500 text-sm">+63</span>
                          </div>
                          <input
                            type="text"
                            name="emergency_phone"
                            required
                            value={formData.emergency_phone}
                            onChange={handleChange}
                            maxLength={10}
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="9171234567"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">10 digits starting with 9</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Documents - Only for Applicants */}
                {formData.role === 'applicant' && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Required Documents</h4>
                    <p className="text-sm text-gray-600 mb-6">Please upload the following required documents (Maximum file size: 10MB each):</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Valid ID Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valid ID <span className="text-red-500">*</span>
                        </label>
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
                              <p className="text-sm text-gray-600">Drag and drop, or</p>
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

                      {/* Transcript Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transcript of Record <span className="text-red-500">*</span>
                        </label>
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
                              <p className="text-sm text-gray-600">Drag and drop, or</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diploma/Certificate <span className="text-red-500">*</span>
                        </label>
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
                              <p className="text-sm text-gray-600">Drag and drop, or</p>
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

                      {/* Passport Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          2x2 Passport Photo <span className="text-red-500">*</span>
                        </label>
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
                              <p className="text-sm text-gray-600">Drag and drop, or</p>
                              <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-800 underline">browse to upload</span>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'passportPhoto')}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-xs text-gray-500">JPG, PNG only (Max 10MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MdEmail className="h-5 w-5 mr-2 text-blue-600" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          emailError 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="juan@example.com"
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500 text-sm">+63</span>
                        </div>
                        <input
                          type="text"
                          name="phone_number"
                          required
                          value={formData.phone_number}
                          onChange={handleChange}
                          maxLength={10}
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="9171234567"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">10 digits starting with 9</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <MdLocationOn className="h-4 w-4 mr-1" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Complete address"
                    />
                  </div>
                </div>

                {/* Account Security */}
                {formData.role !== 'student' && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Account Security</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          required
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Re-enter password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Info for Students */}
                {formData.role === 'student' && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Auto-generated Password</h5>
                          <p className="text-sm text-blue-700">
                            A secure password will be automatically generated and sent to the student's email address upon account creation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/all-users')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || checkingEmail}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingEmail ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking email...
                      </>
                    ) : loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <MdSave className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddUser;
