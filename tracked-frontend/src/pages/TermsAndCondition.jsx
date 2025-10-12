import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';

const TermsAndCondition = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // If user is applicant, redirect to dashboard
          if (parsedUser.role === 'applicant') {
            navigate('/applicant/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tracked-primary/5 via-blue-50 to-tracked-secondary/10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <img 
                src="/smi-logo.jpg" 
                alt="SMI Logo" 
                className="mx-auto h-20 w-auto mb-6 drop-shadow-md"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-tracked-primary to-tracked-secondary bg-clip-text text-transparent mb-4">
                Terms and Conditions
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                SMI Institute Inc. - TrackEd Platform
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className="text-sm text-gray-600 font-medium">
                  Last updated: September 21, 2025
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none space-y-8">
                {/* Section 1 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    By accessing and using the TrackEd platform operated by SMI Institute Inc. ("we," "our," or "us"), 
                    you accept and agree to be bound by the terms and provision of this agreement. If you do not agree 
                    to abide by the above, please do not use this service.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Use License
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    Permission is granted to temporarily access and use the TrackEd platform for personal, 
                    non-commercial educational purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>modify or copy the materials</li>
                      <li>use the materials for any commercial purpose or for any public display</li>
                      <li>attempt to reverse engineer any software contained on the platform</li>
                      <li>remove any copyright or other proprietary notations from the materials</li>
                    </ul>
                  </div>
                </section>

                {/* Section 3 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                    User Accounts
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    To access certain features of the TrackEd platform, you must create an account. You agree to:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Provide accurate, current, and complete information during registration</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
                      <li>Notify SMI Institute immediately of any unauthorized use of your account</li>
                    </ul>
                  </div>
                </section>

                {/* Section 4 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Training Programs and Services
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    SMI Institute offers various technical and vocational training programs through the TrackEd platform. 
                    Enrollment in programs is subject to availability, prerequisites, and payment of applicable fees. 
                    We reserve the right to modify, suspend, or discontinue any program at any time.
                  </p>
                </section>

                {/* Section 5 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Payment and Refunds
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    Payment for training programs must be made according to the payment schedule provided. 
                    Refund policies vary by program and are outlined in the specific program documentation. 
                    Generally:
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Full refunds may be available before program commencement</li>
                      <li>Partial refunds may be available within the first week of program start</li>
                      <li>No refunds after 25% of program completion</li>
                      <li>Administrative fees may apply to all refunds</li>
                    </ul>
                  </div>
                </section>

                {/* Section 6 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                    Intellectual Property
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    All content, materials, and resources provided through the TrackEd platform are the intellectual 
                    property of SMI Institute Inc. or its licensors. Students are granted limited access to these 
                    materials for educational purposes only and may not redistribute, modify, or use them for 
                    commercial purposes.
                  </p>
                </section>

                {/* Section 7 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                    Code of Conduct
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    Users of the TrackEd platform must adhere to professional conduct standards:
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Treat all participants, instructors, and staff with respect</li>
                      <li>Do not engage in harassment, discrimination, or inappropriate behavior</li>
                      <li>Maintain academic integrity and do not engage in cheating or plagiarism</li>
                      <li>Respect the learning environment and participate constructively</li>
                    </ul>
                  </div>
                </section>

                {/* Section 8 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
                    Privacy and Data Protection
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                    of the TrackEd platform, to understand our practices regarding the collection and use of your 
                    personal information.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
                    Disclaimers
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    The information on the TrackEd platform is provided on an 'as is' basis. To the fullest extent 
                    permitted by law, SMI Institute Inc. excludes all representations, warranties, conditions and 
                    terms related to our platform and the use of our platform.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">10</span>
                    Limitations
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    In no event shall SMI Institute Inc. or its suppliers be liable for any damages (including, 
                    without limitation, damages for loss of data or profit, or due to business interruption) 
                    arising out of the use or inability to use the TrackEd platform.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">11</span>
                    Modifications
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    SMI Institute Inc. may revise these terms of service at any time without notice. By using 
                    the TrackEd platform, you are agreeing to be bound by the then current version of these terms.
                  </p>
                </section>

                {/* Section 12 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">12</span>
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    If you have any questions about these Terms and Conditions, please contact us at:
                  </p>
                  <div className="bg-gradient-to-r from-tracked-primary/10 to-tracked-secondary/10 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">SMI Institute Inc.</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                      <div className="flex items-center">
                        <span className="font-medium">📧 Email:</span>
                        <span className="ml-2">smiacademicenter@gmail.com</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">📞 Phone:</span>
                        <span className="ml-2">09177990724</span>
                      </div>
                      <div className="flex items-center md:col-span-2">
                        <span className="font-medium">📍 Address:</span>
                        <span className="ml-2">1991 Wardley Bldg., San Juan St., Cor. Taft Ave. Brgy. 36, Pasay City</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 lg:px-12 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center px-6 py-3 bg-tracked-primary text-white rounded-lg hover:bg-tracked-primary/90 transition-colors font-medium"
                >
                  ← Back to Registration
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="inline-flex items-center px-6 py-3 bg-tracked-secondary text-white rounded-lg hover:bg-tracked-secondary/90 transition-colors font-medium"
                >
                  Privacy Policy →
                </Link>
              </div>
            </div>

            {/* Copyright */}
            <div className="bg-gray-900 text-center py-6">
              <p className="text-sm text-gray-300">
                © Copyright 2025 <span className="font-bold text-white">SMI INSTITUTE INC.</span> All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;
