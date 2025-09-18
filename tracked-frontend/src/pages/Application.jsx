import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
    gender: '',
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
    tesdaVoucherEligibility: '',
    
    // Required Documents
    documents: {
      validId: null,
      transcript: null,
      resume: null,
      medicalCertificate: null
    }
  });

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Educational Background' },
    { number: 3, title: 'Additional Information' },
    { number: 4, title: 'Required Documents' },
    { number: 5, title: 'Success' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    
    // Check file size (25MB limit)
    if (file && file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
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
    
    // Check file size (25MB limit)
    if (file && file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if required documents are uploaded
    if (currentStep === 4) {
      if (!formData.documents.validId || !formData.documents.transcript) {
        alert('Please upload all required documents (Valid ID and Educational Transcript) before submitting.');
        return;
      }
    }
    
    console.log('Application submitted:', formData);
    nextStep(); // Go to success page
  };

  const canProceedToNextStep = () => {
    if (currentStep === 4) {
      return formData.documents.validId && formData.documents.transcript;
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
          <input
            type="text"
            name="nationality"
            required
            value={formData.nationality}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your nationality"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            name="birthDate"
            required
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
          <input
            type="tel"
            name="mobileNumber"
            required
            value={formData.mobileNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your mobile number"
          />
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
        <select
          name="education"
          required
          value={formData.education}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select education level</option>
          <option value="elementary">Elementary</option>
          <option value="high-school">High School</option>
          <option value="vocational">Vocational/Technical</option>
          <option value="college-undergraduate">College Undergraduate</option>
          <option value="college-graduate">College Graduate</option>
          <option value="masters">Master's Degree</option>
          <option value="doctorate">Doctorate</option>
        </select>
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
        <select
          name="courseProgram"
          required
          value={formData.courseProgram}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a training program</option>
          <option value="automotive-technology">Automotive Technology</option>
          <option value="electrical-installation">Electrical Installation & Maintenance</option>
          <option value="welding-fabrication">Welding & Fabrication</option>
          <option value="plumbing-technology">Plumbing Technology</option>
          <option value="electronics-technology">Electronics Technology</option>
          <option value="hvac-technology">HVAC Technology</option>
          <option value="computer-programming">Computer Programming</option>
          <option value="digital-marketing">Digital Marketing</option>
          <option value="culinary-arts">Culinary Arts</option>
          <option value="hospitality-management">Hospitality Management</option>
          <option value="healthcare-assistant">Healthcare Assistant</option>
          <option value="caregiving">Caregiving NC II</option>
        </select>
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
          <select
            name="employmentStatus"
            required
            value={formData.employmentStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select employment status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="self-employed">Self-employed</option>
            <option value="retired">Retired</option>
            <option value="ofw">OFW (Overseas Filipino Worker)</option>
          </select>
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
          <select
            name="emergencyRelationship"
            required
            value={formData.emergencyRelationship}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Person Number *</label>
          <input
            type="tel"
            name="emergencyPhone"
            required
            value={formData.emergencyPhone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Emergency contact phone number"
          />
        </div>
      </div>

      {/* TESDA Voucher Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">TESDA Voucher Eligibility Information *</label>
        <select
          name="tesdaVoucherEligibility"
          required
          value={formData.tesdaVoucherEligibility}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select TESDA voucher eligibility</option>
          <option value="4ps-beneficiary">4Ps Beneficiary</option>
          <option value="pwd">Person with Disability (PWD)</option>
          <option value="senior-citizen">Senior Citizen</option>
          <option value="solo-parent">Solo Parent</option>
          <option value="ofw-dependent">OFW Dependent</option>
          <option value="displaced-worker">Displaced Worker</option>
          <option value="rebel-returnee">Rebel Returnee/Former Combatant</option>
          <option value="student">Student</option>
          <option value="unemployed-graduate">Unemployed Graduate</option>
          <option value="currently-employed">Currently Employed</option>
          <option value="not-eligible">Not Eligible for TESDA Voucher</option>
        </select>
      </div>
    </div>
  );

  const renderRequiredDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
      <p className="text-sm text-gray-600 mb-6">Please upload the following required documents (Maximum file size: 25MB each):</p>
      
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
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 25MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Educational Transcript Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Educational Transcript/Certificate *</label>
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
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 25MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Resume/CV Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV (Optional)</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.resume 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'resume')}
            onDragOver={handleDragOver}
          >
            {formData.documents.resume ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.resume.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.resume.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('resume')}
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
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 25MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Medical Certificate Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Certificate (Optional)</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              formData.documents.medicalCertificate 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}
            onDrop={(e) => handleDrop(e, 'medicalCertificate')}
            onDragOver={handleDragOver}
          >
            {formData.documents.medicalCertificate ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">{formData.documents.medicalCertificate.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.documents.medicalCertificate.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile('medicalCertificate')}
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
                    onChange={(e) => handleFileChange(e, 'medicalCertificate')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 25MB)</p>
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
              Educational Transcript {formData.documents.transcript ? '✓' : '(Required)'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.resume ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className={formData.documents.resume ? 'text-green-700' : 'text-gray-600'}>
              Resume/CV {formData.documents.resume ? '✓' : '(Optional)'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${formData.documents.medicalCertificate ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className={formData.documents.medicalCertificate ? 'text-green-700' : 'text-gray-600'}>
              Medical Certificate {formData.documents.medicalCertificate ? '✓' : '(Optional)'}
            </span>
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
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full text-sm font-medium transition duration-200"
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
                    disabled={currentStep === 4 && !canProceedToNextStep()}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
                      currentStep === 4 && !canProceedToNextStep()
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
    </div>
  );
};

export default Signup;
