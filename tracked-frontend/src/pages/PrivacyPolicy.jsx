import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';

const PrivacyPolicy = () => {
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
                Privacy Policy
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
                {/* Introduction */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">i</span>
                    Introduction
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    SMI Institute Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our TrackEd platform. 
                    Please read this policy carefully to understand our views and practices regarding your personal data.
                  </p>
                </section>

                {/* Section 1 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Information We Collect
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We collect personal information that you voluntarily provide when you:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Create an account on the TrackEd platform</li>
                      <li>Enroll in training programs</li>
                      <li>Contact us for support or inquiries</li>
                      <li>Participate in surveys or feedback forms</li>
                    </ul>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    This information may include:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Educational background</li>
                      <li>Employment information</li>
                      <li>Identification documents (for verification purposes)</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Technical Information</h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We automatically collect certain technical information when you use our platform:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Operating system</li>
                      <li>Pages visited and time spent on platform</li>
                      <li>Learning progress and assessment results</li>
                    </ul>
                  </div>
                </section>

                {/* Section 2 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                    How We Use Your Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We use your information for the following purposes:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Provide and manage your access to training programs</li>
                      <li>Process enrollments and payments</li>
                      <li>Track your learning progress and issue certifications</li>
                      <li>Communicate with you about your programs and account</li>
                      <li>Provide customer support and respond to inquiries</li>
                      <li>Improve our platform and educational services</li>
                      <li>Comply with legal obligations and educational regulations</li>
                      <li>Send important updates about our services (with your consent for marketing communications)</li>
                    </ul>
                  </div>
                </section>

                {/* Section 3 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Information Sharing and Disclosure
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Service Providers</h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We may share information with trusted third-party service providers who assist us in operating our platform, 
                    conducting our business, or serving our users (e.g., payment processors, email services, cloud hosting).
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Legal Requirements</h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We may disclose your information if required by law, court order, or governmental regulations, 
                    or to protect our rights, property, or safety.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Educational Partners</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    With your consent, we may share relevant educational records with partner institutions, 
                    employers, or certification bodies for program completion verification.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Data Security
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We implement appropriate technical and organizational security measures to protect your personal information:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication systems</li>
                      <li>Employee training on data protection</li>
                      <li>Regular backups and disaster recovery procedures</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    However, no method of transmission over the internet or electronic storage is 100% secure. 
                    While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </section>

                {/* Section 5 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                    Data Retention
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
                    comply with legal obligations, resolve disputes, and enforce our agreements. Educational records may be 
                    retained for extended periods as required by educational regulations and accreditation standards.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                    Your Rights and Choices
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    You have the following rights regarding your personal information:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li><strong>Access:</strong> Request a copy of your personal information</li>
                      <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
                      <li><strong>Erasure:</strong> Request deletion of your information (subject to legal requirements)</li>
                      <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                      <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                      <li><strong>Account Deactivation:</strong> Close your account at any time</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </section>

                {/* Section 7 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                    Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    We use cookies and similar tracking technologies to enhance your experience on our platform:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 text-base">
                      <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                      <li><strong>Performance Cookies:</strong> Help us analyze and improve platform performance</li>
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
                  </p>
                </section>

                {/* Section 8 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
                    Children's Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Our services are not intended for children under 16 years of age. We do not knowingly collect 
                    personal information from children under 16. If we learn that we have collected information from 
                    a child under 16, we will take steps to delete such information promptly.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
                    International Data Transfers
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure that such transfers comply with applicable data protection laws and that appropriate 
                    safeguards are in place to protect your information.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="border-l-4 border-tracked-primary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">10</span>
                    Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes 
                    by posting the new policy on this page and updating the "Last updated" date. We encourage you to 
                    review this policy periodically.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="border-l-4 border-tracked-secondary pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">11</span>
                    Contact Us
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gradient-to-r from-tracked-primary/10 to-tracked-secondary/10 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">SMI Institute Inc.</h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-800 min-w-[80px]">📧 Email:</span>
                        <span className="ml-3">smiacademicenter@gmail.com</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-800 min-w-[80px]">📞 Phone:</span>
                        <span className="ml-3">09177990724</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-800 min-w-[80px]">📍 Address:</span>
                        <span className="ml-3">1991 Wardley Bldg., San Juan St., Cor. Taft Ave.<br />Brgy. 36, Pasay City</span>
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
                  to="/terms-and-conditions" 
                  className="inline-flex items-center px-6 py-3 bg-tracked-primary text-white rounded-lg hover:bg-tracked-primary/90 transition-colors font-medium"
                >
                  ← Terms and Conditions
                </Link>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center px-6 py-3 bg-tracked-secondary text-white rounded-lg hover:bg-tracked-secondary/90 transition-colors font-medium"
                >
                  Back to Registration →
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

export default PrivacyPolicy;
