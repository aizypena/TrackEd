import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { nationalities } from '../../utils/nationalities';
import { 
  MdMenu, 
  MdArrowBack, 
  MdUploadFile, 
  MdClose,
  MdCheckCircle 
} from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const StaffAddApplicant = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false);
  const [searchNationality, setSearchNationality] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    place_of_birth: '',
    marital_status: '',
    
    // Educational Background
    education: '',
    school: '',
    course_program: '',
    
    // Employment Information
    employment_status: '',
    company_name: '',
    
    // Contact Information
    email: '',
    phone_number: '',
    address: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Password
    password: '',
    password_confirmation: '',

    // Documents
    documents: {
      validId: null,
      transcript: null,
      diploma: null,
      passportPhoto: null
    }
  });

  const fileInputRefs = {
    validId: useRef(null),
    transcript: useRef(null),
    diploma: useRef(null),
    passportPhoto: useRef(null)
  };

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
        console.error('Error fetching programs:', error);
        toast.error('Failed to load programs');
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
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
    }
  };

  const handleDrop = (e, documentType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
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
    
    // Reset file input
    if (fileInputRefs[documentType].current) {
      fileInputRefs[documentType].current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all documents are uploaded
    const requiredDocs = ['validId', 'transcript', 'diploma', 'passportPhoto'];
    const missingDocs = requiredDocs.filter(doc => !formData.documents[doc]);
    
    if (missingDocs.length > 0) {
      toast.error('Please upload all required documents');
      return;
    }

    // Validate phone number
    if (!/^9\d{9}$/.test(formData.phone_number)) {
      toast.error('Phone number must be 10 digits and start with 9');
      return;
    }

    // Validate emergency contact phone
    if (!/^9\d{9}$/.test(formData.emergency_contact_phone)) {
      toast.error('Emergency contact phone must be 10 digits and start with 9');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = getStaffToken();
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'documents' && key !== 'password_confirmation') {
          submitData.append(key, formData[key]);
        }
      });

      // Add role as applicant
      submitData.append('role', 'applicant');
      submitData.append('status', 'pending');
      
      // Append documents
      Object.keys(formData.documents).forEach(docType => {
        if (formData.documents[docType]) {
          submitData.append(docType, formData.documents[docType]);
        }
      });

      const response = await fetch('https://api.smitracked.cloud/api/staff/applicants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Applicant added successfully!');
        setTimeout(() => {
          navigate('/staff/applications');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to add applicant');
      }
    } catch (error) {
      console.error('Error adding applicant:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number fields - only allow digits
    if (name === 'phone_number' || name === 'emergency_contact_phone') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredNationalities = nationalities.filter(nat =>
    nat.label && nat.label.toLowerCase().includes(searchNationality.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Staff Sidebar */}
      <StaffSidebar 
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Top Navigation Bar */}
        <nav className="bg-tracked-primary text-white shadow-md">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
                >
                  <MdMenu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-xl font-bold">Add New Applicant</h1>
                  <p className="text-sm text-blue-100">Register a new applicant</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/staff/applications')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-tracked-primary rounded-lg hover:bg-blue-50 transition-colors"
              >
                <MdArrowBack className="h-5 w-5" />
                Back to Applications
              </button>
            </div>
          </div>
        </nav>
        
        {/* Form Content */}
        <div className="flex-1 overflow-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.nationality || searchNationality}
                      onChange={(e) => {
                        setSearchNationality(e.target.value);
                        setFormData(prev => ({ ...prev, nationality: '' }));
                      }}
                      onFocus={() => setNationalityDropdownOpen(true)}
                      placeholder="Search nationality..."
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                    />
                    {nationalityDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setNationalityDropdownOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredNationalities.length > 0 ? (
                            filteredNationalities.map((nat, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, nationality: nat.label }));
                                  setSearchNationality('');
                                  setNationalityDropdownOpen(false);
                                }}
                                className="px-3 py-2 hover:bg-tracked-primary hover:text-white cursor-pointer transition-colors"
                              >
                                {nat.label}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No nationalities found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Educational Background */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Educational Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highest Educational Attainment <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="College Level">College Level</option>
                    <option value="College Graduate">College Graduate</option>
                    <option value="Masteral">Masteral</option>
                    <option value="Doctoral">Doctoral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School/University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course/Program Applied <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="course_program"
                    value={formData.course_program}
                    onChange={handleChange}
                    required
                    disabled={loadingPrograms}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  {!loadingPrograms && availablePrograms.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                      No training programs are currently available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  >
                    <option value="">Select Status</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                    placeholder="Enter your current occupation or 'N/A' if unemployed"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valid ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid ID <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, 'validId')}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-tracked-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRefs.validId.current?.click()}
                  >
                    {formData.documents.validId ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <MdCheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{formData.documents.validId.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.documents.validId.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('validId');
                          }}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                        >
                          <MdClose className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <MdUploadFile className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Drop file here or click to browse</p>
                        <p className="text-xs text-gray-500">Max size: 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.validId}
                    type="file"
                    onChange={(e) => handleFileChange(e, 'validId')}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </div>

                {/* Transcript of Records */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript of Records <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, 'transcript')}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-tracked-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRefs.transcript.current?.click()}
                  >
                    {formData.documents.transcript ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <MdCheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{formData.documents.transcript.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.documents.transcript.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('transcript');
                          }}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                        >
                          <MdClose className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <MdUploadFile className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Drop file here or click to browse</p>
                        <p className="text-xs text-gray-500">Max size: 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.transcript}
                    type="file"
                    onChange={(e) => handleFileChange(e, 'transcript')}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </div>

                {/* Diploma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diploma/Certificate <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, 'diploma')}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-tracked-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRefs.diploma.current?.click()}
                  >
                    {formData.documents.diploma ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <MdCheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{formData.documents.diploma.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.documents.diploma.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('diploma');
                          }}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                        >
                          <MdClose className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <MdUploadFile className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Drop file here or click to browse</p>
                        <p className="text-xs text-gray-500">Max size: 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.diploma}
                    type="file"
                    onChange={(e) => handleFileChange(e, 'diploma')}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </div>

                {/* Passport Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2x2 Passport Photo <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, 'passportPhoto')}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-tracked-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRefs.passportPhoto.current?.click()}
                  >
                    {formData.documents.passportPhoto ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <MdCheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{formData.documents.passportPhoto.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.documents.passportPhoto.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('passportPhoto');
                          }}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                        >
                          <MdClose className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <MdUploadFile className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Drop file here or click to browse</p>
                        <p className="text-xs text-gray-500">Max size: 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.passportPhoto}
                    type="file"
                    onChange={(e) => handleFileChange(e, 'passportPhoto')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                      +63
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="9123456789"
                      maxLength="10"
                      required
                      className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 ${
                        formData.phone_number && formData.phone_number.length > 0 && !formData.phone_number.startsWith('9')
                          ? 'border-red-500 focus:ring-red-500'
                          : formData.phone_number && formData.phone_number.length === 10 && formData.phone_number.startsWith('9')
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-tracked-primary'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    formData.phone_number && formData.phone_number.length > 0 && !formData.phone_number.startsWith('9')
                      ? 'text-red-500'
                      : formData.phone_number && formData.phone_number.length === 10 && formData.phone_number.startsWith('9')
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}>
                    {formData.phone_number && formData.phone_number.length > 0 && !formData.phone_number.startsWith('9')
                      ? 'Must start with 9'
                      : formData.phone_number && formData.phone_number.length > 0 && formData.phone_number.length < 10
                      ? `${formData.phone_number.length}/10 digits entered`
                      : formData.phone_number && formData.phone_number.length === 10 && formData.phone_number.startsWith('9')
                      ? 'Valid phone number'
                      : 'Must start with 9 and be 10 digits (e.g., 9123456789)'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                      +63
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      placeholder="9123456789"
                      maxLength="10"
                      required
                      className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 ${
                        formData.emergency_contact_phone && formData.emergency_contact_phone.length > 0 && !formData.emergency_contact_phone.startsWith('9')
                          ? 'border-red-500 focus:ring-red-500'
                          : formData.emergency_contact_phone && formData.emergency_contact_phone.length === 10 && formData.emergency_contact_phone.startsWith('9')
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-tracked-primary'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    formData.emergency_contact_phone && formData.emergency_contact_phone.length > 0 && !formData.emergency_contact_phone.startsWith('9')
                      ? 'text-red-500'
                      : formData.emergency_contact_phone && formData.emergency_contact_phone.length === 10 && formData.emergency_contact_phone.startsWith('9')
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}>
                    {formData.emergency_contact_phone && formData.emergency_contact_phone.length > 0 && !formData.emergency_contact_phone.startsWith('9')
                      ? 'Must start with 9'
                      : formData.emergency_contact_phone && formData.emergency_contact_phone.length > 0 && formData.emergency_contact_phone.length < 10
                      ? `${formData.emergency_contact_phone.length}/10 digits entered`
                      : formData.emergency_contact_phone && formData.emergency_contact_phone.length === 10 && formData.emergency_contact_phone.startsWith('9')
                      ? 'Valid phone number'
                      : 'Must start with 9 and be 10 digits'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="emergency_contact_relationship"
                    required
                    value={formData.emergency_contact_relationship}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary bg-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-tracked-primary border-b pb-2">Account Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible className="h-5 w-5" />
                      ) : (
                        <AiOutlineEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tracked-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible className="h-5 w-5" />
                      ) : (
                        <AiOutlineEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/staff/applications')}
                className="px-6 py-2 border hover:cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 hover:cursor-pointer bg-tracked-primary text-white rounded-lg hover:bg-tracked-primary-dark transition-colors"
              >
                Add Applicant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffAddApplicant;
