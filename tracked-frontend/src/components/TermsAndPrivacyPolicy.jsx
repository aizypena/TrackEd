import React from 'react';

const TermsAndPrivacyPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service and Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:cursor-pointer hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Terms of Service Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms of Service</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h4>
                <p>
                  By submitting an application to SMI Institute Inc. (hereinafter referred to as "SMI Institute"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not proceed with your application.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Application Process</h4>
                <p>
                  All information provided in your application must be accurate, complete, and truthful. SMI Institute reserves the right to verify 
                  all information submitted and may reject applications containing false, misleading, or incomplete information. Submission of falsified 
                  documents or information may result in immediate disqualification and potential legal action.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Enrollment and Program Participation</h4>
                <p>
                  Acceptance into a training program is subject to availability, eligibility requirements, and approval by SMI Institute. 
                  Applicants placed on a waitlist will be notified when slots become available. SMI Institute reserves the right to modify, 
                  reschedule, or cancel programs at its discretion with appropriate notice to enrolled students.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4. Student Conduct and Responsibilities</h4>
                <p>
                  Students are expected to maintain professional conduct, attend classes regularly, and comply with all institutional policies. 
                  Violation of conduct policies may result in suspension or termination from the program without refund.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5. Payment and Refund Policy</h4>
                <p>
                  Payment terms, fee structures, and refund policies are subject to the specific program enrolled in. Full details will be 
                  provided upon acceptance. SMI Institute reserves the right to modify fees with prior notice to enrolled students.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6. Intellectual Property</h4>
                <p>
                  All training materials, content, and resources provided by SMI Institute remain the intellectual property of SMI Institute. 
                  Unauthorized reproduction, distribution, or commercial use of materials is strictly prohibited.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h4>
                <p>
                  SMI Institute shall not be liable for any indirect, incidental, special, or consequential damages arising from participation 
                  in training programs. The institute's liability is limited to the fees paid by the student for the specific program.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Privacy Act of 2012 (Republic Act No. 10173) Compliance</h4>
                <p>
                  SMI Institute Inc. is committed to protecting your privacy and personal information in accordance with the Data Privacy Act of 2012 
                  (Republic Act No. 10173) of the Philippines and its implementing rules and regulations. This Privacy Policy explains how we collect, 
                  use, disclose, and protect your personal information.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h4>
                <p className="mb-2">We collect the following types of personal information during the application process:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Personal identification information (name, date of birth, nationality, place of birth)</li>
                  <li>Contact information (email address, mobile number, residential address)</li>
                  <li>Educational background and academic records (transcripts, diplomas, certificates)</li>
                  <li>Employment information (employment status, occupation)</li>
                  <li>Emergency contact details</li>
                  <li>Government-issued identification documents</li>
                  <li>Passport-size photographs</li>
                  <li>Other information voluntarily provided by applicants</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Purpose of Data Collection</h4>
                <p className="mb-2">Your personal information is collected and processed for the following purposes:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Processing and evaluation of training program applications</li>
                  <li>Verification of identity and eligibility requirements</li>
                  <li>Communication regarding application status and program information</li>
                  <li>Enrollment and student record management</li>
                  <li>Compliance with government regulations and reporting requirements</li>
                  <li>Emergency contact purposes for student safety</li>
                  <li>Statistical analysis and program improvement</li>
                  <li>Issuance of certificates and credentials upon program completion</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Legal Basis for Processing</h4>
                <p>
                  We process your personal information based on your consent, contractual necessity (for enrollment and program participation), 
                  compliance with legal obligations, and legitimate interests in providing quality education and training services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4. Data Sharing and Disclosure</h4>
                <p className="mb-2">
                  SMI Institute may share your personal information with the following parties only when necessary and with appropriate safeguards:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Government agencies for compliance with legal requirements (e.g., TESDA, DepEd, CHED)</li>
                  <li>Third-party service providers who assist in our operations (subject to confidentiality agreements)</li>
                  <li>Authorized personnel within SMI Institute who require access to perform their duties</li>
                </ul>
                <p className="mt-2">
                  We will not sell, rent, or trade your personal information to third parties for marketing purposes without your explicit consent.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5. Data Security</h4>
                <p>
                  We implement appropriate technical, organizational, and physical security measures to protect your personal information from 
                  unauthorized access, disclosure, alteration, or destruction. This includes secure data storage systems, access controls, 
                  encryption where appropriate, and regular security assessments.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6. Data Retention</h4>
                <p>
                  Your personal information will be retained for as long as necessary to fulfill the purposes outlined in this policy, 
                  comply with legal obligations, resolve disputes, and enforce our agreements. Student records are typically maintained 
                  for a minimum period as required by applicable laws and regulations.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7. Your Rights as a Data Subject</h4>
                <p className="mb-2">
                  Under the Data Privacy Act of 2012, you have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Right to be Informed:</strong> You have the right to be informed about how your personal data is being collected, used, and shared.</li>
                  <li><strong>Right to Access:</strong> You may request access to your personal information in our possession.</li>
                  <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete personal information.</li>
                  <li><strong>Right to Erasure/Blocking:</strong> You may request deletion or blocking of your personal data under certain circumstances.</li>
                  <li><strong>Right to Object:</strong> You may object to the processing of your personal information in certain situations.</li>
                  <li><strong>Right to Data Portability:</strong> You may request transfer of your data to another entity in a structured format.</li>
                  <li><strong>Right to File a Complaint:</strong> You may file a complaint with the National Privacy Commission if you believe your rights have been violated.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">8. Data Storage and Processing</h4>
                <p>
                  Our application stores necessary information locally on your device (such as authentication tokens) to maintain your session 
                  and provide a seamless user experience. We do not use cookies or third-party tracking technologies. All data processing is 
                  conducted in accordance with applicable data protection laws and regulations.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">9. Third-Party Links</h4>
                <p>
                  Our website may contain links to third-party websites. SMI Institute is not responsible for the privacy practices of these external sites. 
                  We encourage you to review their privacy policies before providing any personal information.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">10. Changes to Privacy Policy</h4>
                <p>
                  SMI Institute reserves the right to update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
                  Material changes will be communicated through our website or direct notification to enrolled students.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11. Contact Information</h4>
                <p className="mb-2">
                  For questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact our Data Protection Officer:
                </p>
                <div className="ml-4 space-y-1">
                  <p><strong>SMI Institute Inc.</strong></p>
                  <p>Email: smiacedmicenter@gmail.com</p>
                  <p>Phone: +63 917 799 0724</p>
                  <p>Address: Wardley Bldg. San Juan St. Cor. Taft Ave. Brgy 36

Pasay City, Metro Manila 1100</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-tracked-primary hover:bg-tracked-primary-700 text-white rounded-full font-medium transition-colors hover:cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyPolicy;
