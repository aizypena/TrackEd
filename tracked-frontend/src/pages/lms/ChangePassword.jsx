import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { 
  MdLock,
  MdWarning,
  MdCheckCircle,
  MdInfo
} from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstLogin = location.state?.firstLogin || false;
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  // Check if user is logged in
  useEffect(() => {
    const studentToken = sessionStorage.getItem('studentToken');
    if (!studentToken) {
      navigate('/smi-lms/login', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check password strength for new password
    if (name === 'new_password') {
      checkPasswordStrength(value);
    }
    
    if (error) setError('');
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = '';
    let color = '';
    
    if (score <= 2) {
      label = 'Weak';
      color = 'text-red-600 bg-red-100';
    } else if (score <= 3) {
      label = 'Fair';
      color = 'text-yellow-600 bg-yellow-100';
    } else if (score <= 4) {
      label = 'Good';
      color = 'text-blue-600 bg-blue-100';
    } else {
      label = 'Strong';
      color = 'text-green-600 bg-green-100';
    }

    setPasswordStrength({ score, label, color });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New password and confirmation do not match');
      setIsLoading(false);
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError('New password must be different from current password');
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('studentToken');
      const response = await fetch(`${API_URL}/student/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.confirm_password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update stored user data with password_changed_at
        const studentUser = JSON.parse(sessionStorage.getItem('studentUser'));
        studentUser.password_changed_at = new Date().toISOString();
        sessionStorage.setItem('studentUser', JSON.stringify(studentUser));
        
        toast.success('Password changed successfully!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/smi-lms/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(data.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <div className="flex justify-center items-center mb-4">
            <img src="/smi-logo.jpg" alt="SMI Logo" className="h-16 object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Your Password
          </h2>
          {isFirstLogin && (
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <MdInfo className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    For security reasons, you must change your default password before accessing your account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-3 text-gray-400 z-10 pointer-events-none" />
                <input
                  id="current_password"
                  name="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  required
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-500 hover:cursor-pointer z-10"
                >
                  {showPasswords.current ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-3 text-gray-400 z-10 pointer-events-none" />
                <input
                  id="new_password"
                  name="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  required
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new password (min. 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-500 hover:cursor-pointer z-10"
                >
                  {showPasswords.new ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
              {formData.new_password && passwordStrength.label && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs px-2 py-1 rounded ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-3 text-gray-400 z-10 pointer-events-none" />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPasswords.confirm ? "text" : "password"}
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-500 hover:cursor-pointer z-10"
                >
                  {showPasswords.confirm ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-xs text-gray-600 font-medium mb-2">Password requirements:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <MdCheckCircle className={`mr-2 ${formData.new_password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                At least 8 characters long
              </li>
              <li className="flex items-center">
                <MdCheckCircle className={`mr-2 ${/[a-z]/.test(formData.new_password) && /[A-Z]/.test(formData.new_password) ? 'text-green-500' : 'text-gray-300'}`} />
                Contains uppercase and lowercase letters
              </li>
              <li className="flex items-center">
                <MdCheckCircle className={`mr-2 ${/\d/.test(formData.new_password) ? 'text-green-500' : 'text-gray-300'}`} />
                Contains at least one number
              </li>
              <li className="flex items-center">
                <MdCheckCircle className={`mr-2 ${/[^a-zA-Z0-9]/.test(formData.new_password) ? 'text-green-500' : 'text-gray-300'}`} />
                Contains at least one special character
              </li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <MdWarning className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group hover:cursor-pointer relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
