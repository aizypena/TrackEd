import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdBusiness,
  MdSecurity,
  MdVerified,
  MdWarning,
  MdInfo
} from 'react-icons/md';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock authentication logic
      if (formData.email === 'admin@smi.edu.ph' && formData.password === 'admin123') {
        // Store auth data (in real app, this would be handled by auth context/redux)
        localStorage.setItem('adminToken', 'mock-jwt-token');
        localStorage.setItem('adminUser', JSON.stringify({
          id: 1,
          email: formData.email,
          name: 'System Administrator',
          role: 'admin'
        }));
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-6"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg overflow-hidden">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Institute Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">TrackEd Administrator Portal</h2>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-10 border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
            <p className="text-gray-600">Please sign in to your administrator account</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-red-100 rounded-lg">
                    <MdWarning className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Authentication Error</h3>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-12 pr-4 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Enter your administrator email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-12 pr-14 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="h-5 w-5" />
                  ) : (
                    <MdVisibility className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white transition-all duration-300 transform hover:cursor-pointer ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    Sign In as Administrator
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2025 SMI Institute Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;