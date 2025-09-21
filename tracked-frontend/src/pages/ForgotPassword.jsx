import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdCheckCircle } from 'react-icons/md';
import Navbar from '../layouts/applicants/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic email validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock password reset logic
      console.log('Password reset requested for:', email);
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <img 
                src="/smi-logo.jpg" 
                alt="SMI Logo" 
                className="mx-auto h-16 w-auto mb-6"
              />
              <div className="w-16 h-16 bg-tracked-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdCheckCircle className="h-8 w-8 text-tracked-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to:
              </p>
              <p className="text-lg font-semibold text-tracked-primary mb-8">
                {email}
              </p>
              <p className="text-sm text-gray-600 mb-8">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
              <div className="text-center">
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-tracked-primary hover:bg-tracked-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracked-primary transition duration-200"
                >
                  <MdArrowBack className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Didn't receive the email?
                </p>
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="text-sm font-medium text-tracked-primary hover:text-tracked-primary/80 transition-colors"
                >
                  Try again
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  © Copyright 2025 <span className="font-bold text-gray-700">SMI INSTITUTE INC.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Logo" 
              className="mx-auto h-16 w-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>
          
          <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tracked-primary focus:border-tracked-primary transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send reset instructions to this email address
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white transition duration-200 hover:cursor-pointer ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-tracked-primary hover:bg-tracked-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracked-primary'
                }`}
                title='Send Reset Instructions'
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Instructions...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-tracked-primary transition-colors"
                title='Back to Login'
              >
                <MdArrowBack className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
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

export default ForgotPassword;
