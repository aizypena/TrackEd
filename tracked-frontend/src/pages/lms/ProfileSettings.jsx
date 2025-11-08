import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdPerson, 
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdEdit,
  MdSave,
  MdCancel,
  MdVisibility,
  MdVisibilityOff,
  MdSecurity,
  MdNotifications,
  MdLanguage,
  MdPalette,
  MdCamera,
  MdCloudUpload,
  MdCheckCircle,
  MdInfo,
  MdWarning,
  MdFilterList
} from 'react-icons/md';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for user profile
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    studentId: '',
    course: '',
    yearLevel: '1st Year',
    enrollmentDate: '2024-08-15',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    avatar: null
  });

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        setUserProfile({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone_number || '',
          address: userData.address || '',
          dateOfBirth: userData.date_of_birth || '',
          studentId: userData.student_id || '',
          course: userData.course_program || '',
          yearLevel: '1st Year',
          enrollmentDate: '2024-08-15',
          emergencyContact: userData.emergency_contact || '',
          emergencyPhone: userData.emergency_phone || '',
          emergencyRelationship: userData.emergency_relationship || '',
          avatar: null
        });
        
        // Update localStorage with fresh data
        localStorage.setItem('studentUser', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to localStorage data
      const userData = getStudentUser();
      if (userData) {
        setUserProfile({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone_number || '',
          address: userData.address || '',
          dateOfBirth: userData.date_of_birth || '',
          studentId: userData.student_id || '',
          course: userData.course_program || '',
          yearLevel: '1st Year',
          enrollmentDate: '2024-08-15',
          emergencyContact: userData.emergency_contact || '',
          emergencyPhone: userData.emergency_phone || '',
          emergencyRelationship: userData.emergency_relationship || '',
          avatar: null
        });
      }
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    courseUpdates: true,
    assessmentReminders: true,
    language: 'en',
    theme: 'light',
    timezone: 'Asia/Manila'
  });

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: <MdPerson className="h-5 w-5" /> },
    { id: 'academic', name: 'Academic Details', icon: <MdSchool className="h-5 w-5" /> },
    { id: 'security', name: 'Security', icon: <MdSecurity className="h-5 w-5" /> }
  ];

  const handleProfileUpdate = async () => {
    const loadingToast = toast.loading('Updating profile...');

    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          phone_number: userProfile.phone,
          address: userProfile.address,
          date_of_birth: userProfile.dateOfBirth,
          emergency_contact: userProfile.emergencyContact,
          emergency_phone: userProfile.emergencyPhone,
          emergency_relationship: userProfile.emergencyRelationship
        })
      });

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Update localStorage with new user data
        const updatedUser = {
          ...user,
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          phone_number: userProfile.phone,
          address: userProfile.address,
          date_of_birth: userProfile.dateOfBirth,
          emergency_contact: userProfile.emergencyContact,
          emergency_phone: userProfile.emergencyPhone,
          emergency_relationship: userProfile.emergencyRelationship
        };
        localStorage.setItem('studentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating profile');
    }
  };

  const handlePasswordChange = async () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const loadingToast = toast.loading('Updating password...');

    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:8000/api/student/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirmation: passwordData.confirmPassword
        })
      });

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Password change error:', error);
      toast.error('An error occurred while changing password');
    }
  };

  const handlePreferencesUpdate = () => {
    // Implement preferences update logic
    console.log('Preferences updated:', preferences);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Implement avatar upload logic
      console.log('Avatar upload:', file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <MdFilterList className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdPerson className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-600">Manage your account information and preferences</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userProfile.firstName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {userProfile.lastName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <MdCamera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile.firstName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {userProfile.lastName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h2>
                  {userProfile.studentId && (
                    <p className="text-sm text-gray-500 mt-1">{userProfile.studentId}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <MdCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-600 font-medium">Verified Student</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-yellow-500 text-yellow-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        {isEditing ? <MdCancel className="h-4 w-4 mr-2" /> : <MdEdit className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="relative">
                          <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={userProfile.firstName}
                            onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="relative">
                          <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={userProfile.lastName}
                            onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={userProfile.email}
                            disabled={true}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={userProfile.phone}
                            onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="relative">
                          <MdLocationOn className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <textarea
                            value={userProfile.address}
                            onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={userProfile.dateOfBirth}
                          onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                          disabled={!isEditing}
                          className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                        <input
                          type="text"
                          value={userProfile.studentId || ''}
                          disabled={true}
                          className="px-4 py-3 w-full border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Student ID cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={userProfile.emergencyContact || ''}
                          onChange={(e) => setUserProfile({...userProfile, emergencyContact: e.target.value})}
                          disabled={!isEditing}
                          className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                        <div className="relative">
                          <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={userProfile.emergencyPhone || ''}
                            onChange={(e) => setUserProfile({...userProfile, emergencyPhone: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        {isEditing ? (
                          <select
                            value={userProfile.emergencyRelationship || ''}
                            onChange={(e) => setUserProfile({...userProfile, emergencyRelationship: e.target.value})}
                            className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Relationship</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="relative">Relative</option>
                            <option value="friend">Friend</option>
                            <option value="guardian">Guardian</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={userProfile.emergencyRelationship || ''}
                            disabled={true}
                            className="px-4 py-3 w-full border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
                          />
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileUpdate}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <MdSave className="h-4 w-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Academic Details Tab */}
                {activeTab === 'academic' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.studentId || 'Not Assigned'}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                        <p className="text-lg font-semibold text-gray-900">{new Date(userProfile.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MdInfo className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900">Academic Information</h4>
                          <p className="text-sm text-blue-800 mt-1">
                            Academic details are managed by the registrar's office. For any changes or updates, please contact the academic affairs department.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MdWarning className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900">Password Security</h4>
                          <p className="text-sm text-yellow-800 mt-1">
                            Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="pr-10 pl-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="pr-10 pl-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="pr-10 pl-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <MdSave className="h-4 w-4 mr-2" />
                        Change Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
