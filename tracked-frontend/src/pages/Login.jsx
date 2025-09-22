import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import Navbar from '../layouts/applicants/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      // API call to backend for authentication
      console.log('Making API call to backend...');
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if user has the correct role (applicant or student)
        if (data.user.role === 'applicant' || data.user.role === 'student') {
          // Store auth data
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name,
            role: data.user.role,
            created_at: data.user.created_at
          };

          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Navigate to applicant dashboard
          navigate('/applicants/dashboard');
        } else {
          setError('Access denied. Only applicants and students can access this portal.');
        }
      } else {
        setError(data.message || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your SMI Institute account
            </p>
          </div>
          
          <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-900">Authentication Error</h3>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                  >
                    {showPassword ? (
                      <IoEyeOff className="h-5 w-5" />
                    ) : (
                      <IoEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link to="/forgot-password" className="font-medium text-gray-400 hover:text-tracked-primary-600 text-sm" title='Forgot Password'>
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white transition duration-200 hover:cursor-pointer ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-tracked-secondary hover:bg-tracked-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracked-secondary'
                }`}
                title='Login'
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Haven't applied yet?{' '}
                <Link to="/signup" className="font-medium text-tracked-secondary hover:text-tracked-secondary-700" title='Apply for Training'>
                  Apply for Training Programs
                </Link>
              </p>
            </div>

            {/* Copyright */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                © Copyright 2025 <span className="font-bold text-gray-700">SMI INSTITUTE INC.</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
