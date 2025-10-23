import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/lms/Sidebar';
import { getStudentUser } from '../../utils/studentAuth';
import { 
  MdWorkspacePremium, 
  MdDownload, 
  MdShare,
  MdVerified,
  MdCalendarToday,
  MdSchool,
  MdGrade,
  MdVisibility,
  MdFilterList,
  MdSearch,
  MdPrint,
  MdEmail,
  MdLink,
  MdStar,
  MdTrendingUp,
  MdCheckCircle,
  MdAccessTime,
  MdEmojiEvents,
  MdAssignment
} from 'react-icons/md';

const Certificates = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Mock certificates data
  const certificates = [
    {
      id: 1,
      title: 'Certificate of Completion - Basic Knife Skills',
      course: 'Cookery NC II',
      courseCode: 'CK101',
      type: 'completion',
      status: 'issued',
      issueDate: '2024-09-15',
      expiryDate: null,
      grade: 'A',
      score: '88/100',
      instructor: 'Chef Roberto Martinez',
      certificateNumber: 'SMI-CK-2024-001',
      credentialId: 'abc123def456',
      description: 'This certificate validates proficiency in fundamental knife skills, proper handling techniques, and kitchen safety protocols.',
      skills: ['Knife Safety', 'Cutting Techniques', 'Mise en Place', 'Kitchen Hygiene'],
      badge: 'gold',
      verificationUrl: 'https://smi.edu.ph/verify/abc123def456',
      downloadUrl: '/certificates/download/1',
      thumbnailUrl: '/images/certificates/knife-skills-cert.jpg'
    },
    {
      id: 2,
      title: 'Food Safety and Sanitation Certification',
      course: 'Cookery NC II',
      courseCode: 'CK101',
      type: 'certification',
      status: 'issued',
      issueDate: '2024-09-10',
      expiryDate: '2026-09-10',
      grade: 'A+',
      score: '47/50',
      instructor: 'Ms. Anna Cruz',
      certificateNumber: 'SMI-FS-2024-002',
      credentialId: 'def456ghi789',
      description: 'Certifies comprehensive understanding of food safety principles, HACCP protocols, and sanitation standards.',
      skills: ['HACCP Principles', 'Food Safety', 'Sanitation Standards', 'Health Regulations'],
      badge: 'platinum',
      verificationUrl: 'https://smi.edu.ph/verify/def456ghi789',
      downloadUrl: '/certificates/download/2',
      thumbnailUrl: '/images/certificates/food-safety-cert.jpg'
    },
    {
      id: 3,
      title: 'Bread Making Fundamentals Certificate',
      course: 'Bread and Pastry Production NC II',
      courseCode: 'BP301',
      type: 'completion',
      status: 'issued',
      issueDate: '2024-09-05',
      expiryDate: null,
      grade: 'A+',
      score: '91/100',
      instructor: 'Chef Maria Gonzales',
      certificateNumber: 'SMI-BP-2024-003',
      credentialId: 'ghi789jkl012',
      description: 'Demonstrates mastery of bread making techniques, dough preparation, and artisan baking methods.',
      skills: ['Dough Preparation', 'Fermentation', 'Baking Techniques', 'Quality Control'],
      badge: 'platinum',
      verificationUrl: 'https://smi.edu.ph/verify/ghi789jkl012',
      downloadUrl: '/certificates/download/3',
      thumbnailUrl: '/images/certificates/bread-making-cert.jpg'
    },
    {
      id: 4,
      title: 'Bartending Fundamentals Certificate',
      course: 'Bartending NC II',
      courseCode: 'BT201',
      type: 'completion',
      status: 'pending',
      issueDate: null,
      expiryDate: null,
      grade: null,
      score: null,
      instructor: 'Mr. David Tan',
      certificateNumber: null,
      credentialId: null,
      description: 'Will be issued upon successful completion of all bartending practical assessments.',
      skills: ['Cocktail Preparation', 'Bar Service', 'Customer Relations', 'Inventory Management'],
      badge: null,
      verificationUrl: null,
      downloadUrl: null,
      thumbnailUrl: '/images/certificates/bartending-cert-pending.jpg'
    }
  ];

  // Filter certificates to only show issued/passed certificates
  const issuedCertificates = certificates.filter(cert => cert.status === 'issued');

  const certificateTypes = [
    { id: 'all', name: 'All Certificates', count: issuedCertificates.length },
    { id: 'certification', name: 'National Certificates', count: issuedCertificates.filter(c => c.type === 'certification').length },
    { id: 'completion', name: 'Course Completion', count: issuedCertificates.filter(c => c.type === 'completion').length }
  ];
  
  // Further filter based on selected filter and search
  const filteredCertificates = issuedCertificates.filter(cert => {
    const matchesFilter = selectedFilter === 'all' || 
      cert.type === selectedFilter;
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 'gold': return 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800';
      case 'silver': return 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700';
      case 'bronze': return 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued': return 'text-green-700 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'expired': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const handleDownload = (certificate) => {
    console.log('Downloading certificate:', certificate.title);
    // Implement download logic
  };

  const handleShare = (certificate) => {
    console.log('Sharing certificate:', certificate.title);
    // Implement share logic
  };

  const handleVerify = (certificate) => {
    if (certificate.verificationUrl) {
      window.open(certificate.verificationUrl, '_blank');
    }
  };

  const handleView = (certificate) => {
    setSelectedCertificate(certificate);
  };

  // Calculate statistics for issued certificates only
  const issuedCount = issuedCertificates.length;
  const certificationCount = issuedCertificates.filter(c => c.type === 'certification').length;
  const completionCount = issuedCertificates.filter(c => c.type === 'completion').length;

  return (
    <div className="flex h-screen bg-gray-50">
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
                    <MdWorkspacePremium className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">National Certificates</h1>
                    <p className="text-sm text-gray-600">Official academic achievements and industry credentials</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{issuedCount} Certificates Earned</div>
                <div className="text-xs text-gray-500">{certificationCount} Professional • {completionCount} Academic</div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <MdPrint className="h-4 w-4 mr-2" />
                Export Portfolio
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earned</p>
                    <p className="text-3xl font-bold text-gray-900">{issuedCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdAssignment className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <MdCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">Verified credentials</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">National Certificates</p>
                    <p className="text-3xl font-bold text-blue-600">{certificationCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdVerified className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Industry recognized</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Course Completion</p>
                    <p className="text-3xl font-bold text-green-600">{completionCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MdSchool className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Academic achievements</span>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {certificateTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedFilter(type.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        selectedFilter === type.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.name}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        selectedFilter === type.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                    {/* Certificate Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MdWorkspacePremium className="h-5 w-5 text-blue-600" />
                            </div>
                            {certificate.badge && (
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor(certificate.badge)}`}>
                                {certificate.badge.toUpperCase()} TIER
                              </span>
                            )}
                            <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full">
                              VERIFIED
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{certificate.title}</h3>
                          <p className="text-sm font-medium text-blue-600 mb-3">{certificate.course} • {certificate.courseCode}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{certificate.description}</p>
                        </div>
                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">{certificate.grade}</div>
                          <div className="text-sm text-gray-500">{certificate.score}</div>
                          <div className="text-xs text-gray-400 mt-1">Final Grade</div>
                        </div>
                      </div>

                      {/* Certificate Details */}
                      <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MdCalendarToday className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Issue Date</div>
                              <div className="text-gray-600">{formatDate(certificate.issueDate)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MdSchool className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Instructor</div>
                              <div className="text-gray-600">{certificate.instructor}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900 mb-4">Professional Skills & Competencies</h4>
                      <div className="flex flex-wrap gap-3">
                        {certificate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 text-sm font-medium text-blue-800 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certificate ID and Verification */}
                    {certificate.certificateNumber && (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-green-900 mb-2">Official Certificate</div>
                            <div className="text-lg font-mono font-bold text-green-800 mb-1">{certificate.certificateNumber}</div>
                            {certificate.credentialId && (
                              <div className="text-sm text-green-700">Credential ID: {certificate.credentialId}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-900">Verification Status</div>
                              <div className="flex items-center text-green-700">
                                <MdVerified className="h-4 w-4 mr-1" />
                                <span className="font-medium">Verified</span>
                              </div>
                            </div>
                            {certificate.verificationUrl && (
                              <button
                                onClick={() => handleVerify(certificate)}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                              >
                                <MdVerified className="h-4 w-4 mr-2" />
                                Verify Online
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-green-600 font-medium">
                            <MdCheckCircle className="h-5 w-5 mr-2" />
                            <span>Officially Certified</span>
                          </div>
                          {certificate.expiryDate && (
                            <div className="text-sm text-gray-500">
                              Valid until {formatDate(certificate.expiryDate)}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleView(certificate)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                          >
                            <MdVisibility className="h-4 w-4 mr-2" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleShare(certificate)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <MdShare className="h-4 w-4 mr-2" />
                            Share
                          </button>
                          <button
                            onClick={() => handleDownload(certificate)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <MdDownload className="h-4 w-4 mr-2" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <MdWorkspacePremium className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Certificates Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No certificates match your current search criteria. Only successfully completed and verified certificates are displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Certificate Preview</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center border-2 border-blue-200 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="mb-4">
                  <MdWorkspacePremium className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCertificate.title}</h2>
                  <p className="text-lg text-gray-700">{selectedCertificate.course}</p>
                </div>
                <div className="border-t border-blue-200 pt-4 mt-4">
                  <p className="text-gray-600 mb-2">This certifies that</p>
                  <p className="text-xl font-semibold text-gray-900 mb-2">{user.name}</p>
                  <p className="text-gray-600 mb-4">has successfully completed the requirements</p>
                  {selectedCertificate.grade && (
                    <p className="text-lg font-medium text-green-600 mb-4">
                      Grade: {selectedCertificate.grade} ({selectedCertificate.score})
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Issued on {formatDate(selectedCertificate.issueDate)}
                  </p>
                  {selectedCertificate.certificateNumber && (
                    <p className="text-sm text-gray-500 font-mono mt-2">
                      Certificate No: {selectedCertificate.certificateNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedCertificate.status === 'issued' && (
                  <button
                    onClick={() => handleDownload(selectedCertificate)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
