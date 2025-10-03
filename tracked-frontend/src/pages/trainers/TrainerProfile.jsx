import { useState } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdEdit,
  MdSave,
  MdCancel,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdBadge,
  MdLock,
  MdCamera,
  MdPerson
} from 'react-icons/md';

const TrainerProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@smiinstitute.com',
    phone: '+63 912 345 6789',
    address: 'Makati City, Metro Manila',
    specialization: 'Bartending and Mixology',
    certifications: [
      'Professional Bartender Certification',
      'Advanced Mixology Certificate',
      'Food Safety and Handling'
    ],
    experience: '8 years',
    bio: 'Experienced bartending trainer with expertise in mixology and bar management. Passionate about developing the next generation of hospitality professionals.',
    assignedPrograms: [
      'Bartending NC II',
      'Food and Beverage Services NC II'
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile changes:', formData);
    setIsEditing(false);
  };

  const handlePasswordChange = (oldPassword, newPassword) => {
    console.log('Changing password');
    setShowPasswordModal(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <MdEdit className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <MdSave className="h-5 w-5 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <MdCancel className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="relative h-64 bg-gradient-to-r from-blue-800 to-blue-600 overflow-visible">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute -bottom-20 left-8 z-10">
                  <div className="relative group">
                    <div className="h-40 w-40 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden transition-transform hover:scale-105">
                      <div className="h-full w-full bg-indigo-500 flex items-center justify-center text-white">
                        <MdPerson className="h-24 w-24" />
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-2 right-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all duration-200 transform hover:scale-110">
                          <MdCamera className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white bg-opacity-90 text-blue-800 shadow-md">
                    <MdBadge className="h-5 w-5 mr-2" />
                    Active Trainer
                  </span>
                </div>
              </div>
              <div className="pt-24 px-8 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <div className="flex items-center mt-2 text-gray-600">
                      <MdWork className="h-5 w-5 mr-2" />
                      <span className="text-lg">Professional Trainer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <span className="bg-blue-100 rounded-lg p-2 mr-3">
                        <MdPerson className="h-6 w-6 text-blue-600" />
                      </span>
                      Personal Information
                    </h3>
                    {isEditing && (
                      <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Editing
                      </span>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <MdEmail className="h-5 w-5" />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <MdPhone className="h-5 w-5" />
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <MdLocationOn className="h-5 w-5" />
                        </span>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialization</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <MdWork className="h-5 w-5" />
                        </span>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <MdWork className="h-5 w-5" />
                        </span>
                        <input
                          type="text"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MdLock className="h-6 w-6 mr-2" />
                    Account Security
                  </h3>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center px-4 py-3 border border-blue-400 rounded-lg text-sm font-medium bg-blue-800 hover:bg-blue-700 focus:outline-none w-full justify-center transition-colors duration-200"
                  >
                    <MdLock className="h-5 w-5 mr-2" />
                    Change Password
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                    <span className="bg-blue-100 rounded-lg p-2 mr-3">
                      <MdSchool className="h-6 w-6 text-blue-600" />
                    </span>
                    Certifications
                  </h3>
                  <ul className="space-y-4">
                    {formData.certifications.map((cert, index) => (
                      <li key={index} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MdSchool className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                    <span className="bg-blue-100 rounded-lg p-2 mr-3">
                      <MdWork className="h-6 w-6 text-blue-600" />
                    </span>
                    Assigned Programs
                  </h3>
                  <ul className="space-y-4">
                    {formData.assignedPrograms.map((program, index) => (
                      <li key={index} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MdWork className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">{program}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="bg-blue-100 rounded-lg p-2 mr-3">
                  <MdLock className="h-6 w-6 text-blue-600" />
                </span>
                Change Password
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className="block w-full rounded-lg border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className="block w-full rounded-lg border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className="block w-full rounded-lg border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePasswordChange()}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfile;
