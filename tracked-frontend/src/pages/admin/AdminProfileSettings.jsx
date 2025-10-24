import React, { useState } from 'react';
import {
  MdPerson,
  MdLock,
  MdEmail,
  MdPhone,
  MdNotifications,
  MdLanguage,
  MdSave,
  MdEdit,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../../layouts/admin/Sidebar';

function AdminProfileSettings() {
  // Get admin user info from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // State for form data
  const [formData, setFormData] = useState({
    firstName: adminUser.first_name || '',
    lastName: adminUser.last_name || '',
    email: adminUser.email || '',
    phone: adminUser.phone_number || adminUser.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for password visibility
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formData);
    setIsEditing(false);
  };

  // Handle password change submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    const loadingToast = toast.loading('Updating password...');

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:8000/api/admin/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          new_password_confirmation: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully!', {
          id: loadingToast,
        });
        
        // Clear password fields after successful submission
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setIsChangingPassword(false);
      } else {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          toast.error(errorMessages, {
            id: loadingToast,
          });
        } else {
          toast.error(data.message || 'Failed to update password', {
            id: loadingToast,
          });
        }
      }
    } catch (error) {
      toast.error('An error occurred while updating password', {
        id: loadingToast,
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-8 w-full max-w-7xl mx-auto">
          <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your account settings and preferences</p>
              {adminUser && (adminUser.first_name || adminUser.last_name) && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">First Name:</span> {adminUser.first_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Last Name:</span> {adminUser.last_name || 'N/A'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center px-6 py-3 hover:cursor-pointer rounded-lg shadow-sm ${
                isEditing
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button for Profile */}
          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MdSave className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </form>

          {/* Password Section - Separate Form */}
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Change Password</h2>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className={`flex items-center px-6 hover:cursor-pointer py-3 rounded-lg shadow-sm ${
                  isChangingPassword
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-200`}
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={!isChangingPassword}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={!isChangingPassword}
                  >
                    {showPasswords.current ? (
                      <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={!isChangingPassword}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={!isChangingPassword}
                  >
                    {showPasswords.new ? (
                      <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={!isChangingPassword}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={!isChangingPassword}
                  >
                    {showPasswords.confirm ? (
                      <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Update Password Button */}
            {isChangingPassword && (
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="flex items-center px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Update Password
                </button>
              </div>
            )}
            </form>
          </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
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
    </div>
  );
}

export default AdminProfileSettings;
