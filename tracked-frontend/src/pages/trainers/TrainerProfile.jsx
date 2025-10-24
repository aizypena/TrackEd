import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import { getTrainerUser } from '../../utils/trainerAuth';
import { trainerAPI } from '../../services/trainerAPI';
import toast, { Toaster } from 'react-hot-toast';
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
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    certifications: [],
    experience: '',
    bio: '',
    assignedPrograms: []
  });

  useEffect(() => {
    const trainerData = getTrainerUser();
    console.log('Trainer data from localStorage:', trainerData); // Debug log
    if (trainerData) {
      setUser(trainerData);
      setFormData({
        firstName: trainerData.first_name || '',
        lastName: trainerData.last_name || '',
        email: trainerData.email || '',
        phone: trainerData.phone_number || '',
        address: trainerData.address || '',
        specialization: trainerData.specialization || 'Professional Trainer',
        certifications: trainerData.certifications || [
          'Professional Bartender Certification',
          'Advanced Mixology Certificate',
          'Food Safety and Handling'
        ],
        experience: trainerData.experience || '8 years',
        bio: trainerData.bio || 'Experienced trainer passionate about developing the next generation of hospitality professionals.',
        assignedPrograms: trainerData.assigned_programs || [
          'Bartending NC II',
          'Food and Beverage Services NC II'
        ]
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Prepare data to send to API
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        address: formData.address,
        bio: formData.bio,
      };

      // Call API to update profile
      const response = await trainerAPI.updateProfile(updateData);
      
      // Update local state with new data
      setUser(response.user);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    const loadingToast = toast.loading('Updating password...');

    try {
      setLoading(true);

      // Call API to update password
      await trainerAPI.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      toast.success('Password updated successfully!', {
        id: loadingToast,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update password. Please try again.', {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        user={user}
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
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdSave className="h-5 w-5 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                      // Reset form data to current user data
                      const trainerData = getTrainerUser();
                      if (trainerData) {
                        setFormData({
                          firstName: trainerData.first_name || '',
                          lastName: trainerData.last_name || '',
                          email: trainerData.email || '',
                          phone: trainerData.phone_number || '',
                          address: trainerData.address || '',
                          specialization: trainerData.specialization || 'Professional Trainer',
                          certifications: trainerData.certifications || [],
                          experience: trainerData.experience || '8 years',
                          bio: trainerData.bio || '',
                          assignedPrograms: trainerData.assigned_programs || []
                        });
                      }
                    }}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <svg className="h-5 w-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-500">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <div className="h-32 w-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                      <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white">
                        <MdPerson className="h-16 w-16" />
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
                          <MdCamera className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-20 px-8 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-600 mt-1">{formData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    {isEditing && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Editing
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter first name"
                          className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter last name"
                          className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MdEmail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          placeholder="Enter email address"
                          className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MdPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter phone number"
                          className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="relative">
                        <div className="absolute top-2 left-0 flex items-center pl-3 pointer-events-none">
                          <MdLocationOn className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter address"
                          className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Write a short bio about yourself..."
                        className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MdLock className="h-5 w-5 mr-2 text-gray-700" />
                      Change Password
                    </h3>
                    <button
                      onClick={() => {
                        if (isChangingPassword) {
                          // Cancel - clear fields
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }
                        setIsChangingPassword(!isChangingPassword);
                      }}
                      className={`flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium ${
                        isChangingPassword
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors duration-200`}
                    >
                      <MdLock className="h-5 w-5 mr-2" />
                      {isChangingPassword ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MdLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, currentPassword: e.target.value });
                            }}
                            disabled={!isChangingPassword}
                            className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            placeholder="Enter current password"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MdLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, newPassword: e.target.value });
                            }}
                            disabled={!isChangingPassword}
                            className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            placeholder="Enter new password"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MdLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                            }}
                            disabled={!isChangingPassword}
                            className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      {isChangingPassword && (
                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <MdSave className="h-5 w-5 mr-2" />
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      )}
                    </form>
                </div>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
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
};

export default TrainerProfile;
