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
  MdCheckCircle,
  MdCancel,
  MdAssignment
} from 'react-icons/md';

const Certificates = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = getStudentUser();
    if (userData) {
      setUser(userData);
    }
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('studentToken');
      const response = await fetch('https://api.smitracked.cloud/api/student/certificates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setCertificates(data.data || []);
      } else {
        setError(data.message || 'Failed to load certificates');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to load certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const certificateTypes = [
    { id: 'all', name: 'All Certificates', count: certificates.length },
    { id: 'issued', name: 'Active', count: certificates.filter(c => c.status === 'issued').length }
  ];
  
  // Filter based on selected filter and search
  const filteredCertificates = certificates.filter(cert => {
    const matchesFilter = selectedFilter === 'all' || 
      cert.status === selectedFilter;
    const matchesSearch = 
      cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.program?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.program?.code?.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (!certificate) return;

    // Get the certificate content
    const certificateContent = document.getElementById('certificate-preview');
    
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certificate.certificate_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
            background: white;
          }
          .certificate-container {
            border: 8px double #D97706;
            padding: 60px;
            background: linear-gradient(to bottom right, #FEF3C7, white);
            position: relative;
            min-height: 600px;
          }
          .corner {
            position: absolute;
            width: 60px;
            height: 60px;
          }
          .corner-tl {
            top: 15px;
            left: 15px;
            border-top: 4px solid #D97706;
            border-left: 4px solid #D97706;
          }
          .corner-tr {
            top: 15px;
            right: 15px;
            border-top: 4px solid #D97706;
            border-right: 4px solid #D97706;
          }
          .corner-bl {
            bottom: 15px;
            left: 15px;
            border-bottom: 4px solid #D97706;
            border-left: 4px solid #D97706;
          }
          .corner-br {
            bottom: 15px;
            right: 15px;
            border-bottom: 4px solid #D97706;
            border-right: 4px solid #D97706;
          }
          .content {
            text-align: center;
            position: relative;
            z-index: 1;
          }
          .title {
            font-size: 48px;
            font-family: Georgia, serif;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 10px;
          }
          .title-underline {
            width: 120px;
            height: 4px;
            background: #D97706;
            margin: 0 auto 40px;
          }
          .body-text {
            font-size: 18px;
            color: #374151;
            margin: 20px 0;
          }
          .student-name {
            font-size: 42px;
            font-family: Georgia, serif;
            font-weight: bold;
            color: #111827;
            margin: 30px 0;
          }
          .program-name {
            font-size: 28px;
            font-weight: 600;
            color: #B45309;
            margin: 30px 0;
          }
          .footer {
            display: flex;
            justify-content: space-around;
            padding-top: 60px;
            margin-top: 40px;
            border-top: 1px solid #D1D5DB;
          }
          .footer-item {
            text-align: center;
          }
          .footer-label {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 5px;
          }
          .footer-value {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }
          .signature {
            padding-top: 40px;
            margin-top: 40px;
          }
          .signature-line {
            width: 250px;
            height: 2px;
            background: #1F2937;
            margin: 0 auto 10px;
          }
          .signature-text {
            font-size: 14px;
            color: #374151;
          }
          .seal {
            position: absolute;
            bottom: 50px;
            left: 50px;
            width: 110px;
            height: 110px;
            border: 4px solid #D97706;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }
          .seal img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              size: landscape;
              margin: 0.5in;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          
          <div class="content">
            <div class="title">Certificate of Completion</div>
            <div class="title-underline"></div>
            
            <div class="body-text">This is to certify that</div>
            <div class="student-name">${certificate.student?.name || (user?.first_name + ' ' + user?.last_name)}</div>
            <div class="body-text">has successfully completed the program</div>
            <div class="program-name">${certificate.program?.title || 'Program'}</div>
            <div class="body-text">with an overall grade of <strong>${certificate.grade}%</strong></div>
            
            <div class="footer">
              <div class="footer-item">
                <div class="footer-label">Date Issued</div>
                <div class="footer-value">${formatDate(certificate.issued_date)}</div>
              </div>
              <div class="footer-item">
                <div class="footer-label">Certificate No.</div>
                <div class="footer-value">${certificate.certificate_number}</div>
              </div>
              <div class="footer-item">
                <div class="footer-label">Grade</div>
                <div class="footer-value">${certificate.grade}%</div>
              </div>
            </div>
            
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-text">Mr. Rolando S. Luzano</div>
            </div>
          </div>
          
          <div class="seal">
            <img src="${window.location.origin}/smi-logo.jpg" alt="SMI Logo" />
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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

  // Calculate statistics
  const totalCount = certificates.length;
  const issuedCount = certificates.filter(c => c.status === 'issued').length;
  const revokedCount = certificates.filter(c => c.status === 'revoked').length;
  const averageGrade = certificates.length > 0 
    ? (certificates.reduce((sum, c) => sum + (parseFloat(c.grade) || 0), 0) / certificates.length).toFixed(1)
    : 0;

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
                    <h1 className="text-2xl font-bold text-gray-900">Training Certificates</h1>
                    <p className="text-sm text-gray-600">Official academic achievements and industry credentials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading certificates...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <MdCancel className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                    <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdWorkspacePremium className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <MdCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">Official certificates</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-green-600">{issuedCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MdVerified className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Valid certificates</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Grade</p>
                    <p className="text-3xl font-bold text-blue-600">{averageGrade}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdGrade className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Overall performance</span>
                </div>
              </div>
            </div>
              </>
            )}

            {!loading && !error && (
            <>
            {/* Certificates Grid */}
            <div className="space-y-6">
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
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(certificate.status)}`}>
                              {certificate.status.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
                          <p className="text-sm font-medium text-blue-600 mb-3">
                            {certificate.program?.title || 'N/A'} • {certificate.program?.code || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {certificate.program?.description || 'Official certificate of program completion'}
                          </p>
                        </div>
                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">{certificate.grade}%</div>
                          <div className="text-xs text-gray-400 mt-1">Final Grade</div>
                          <div className="text-sm text-gray-500 mt-2">{certificate.attendance_rate}%</div>
                          <div className="text-xs text-gray-400">Attendance</div>
                        </div>
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
                            <div className="text-gray-600">{formatDate(certificate.issued_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MdSchool className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Issued By</div>
                            <div className="text-gray-600">{certificate.issued_by?.name || 'Trainer'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-green-900 mb-2">Official Certificate Number</div>
                          <div className="text-lg font-mono font-bold text-green-800 mb-1">{certificate.certificate_number}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-900">Status</div>
                            <div className="flex items-center text-green-700">
                              <MdVerified className="h-4 w-4 mr-1" />
                              <span className="font-medium capitalize">{certificate.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {certificate.notes && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="text-sm font-semibold text-green-900 mb-1">Notes</div>
                          <div className="text-sm text-green-700">{certificate.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-green-600 font-medium">
                            <MdCheckCircle className="h-5 w-5 mr-2" />
                            <span>Officially Certified</span>
                          </div>
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
                            onClick={() => handleDownload(certificate)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <MdDownload className="h-4 w-4 mr-2" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <MdWorkspacePremium className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Certificates Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You haven't earned any certificates yet. Complete your program requirements to receive your official certificate from your trainer.
                  </p>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </main>
      </div>

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Certificate Preview</h2>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Certificate Design */}
            <div className="p-8">
              <div id="certificate-preview" className="border-8 border-double border-yellow-600 p-12 bg-gradient-to-br from-yellow-50 to-white relative">
                {/* Decorative Corners */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600"></div>

                <div className="text-center space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-5xl font-serif font-bold text-gray-800 mb-2">Certificate of Completion</h1>
                    <div className="w-32 h-1 bg-yellow-600 mx-auto"></div>
                  </div>

                  {/* Body */}
                  <div className="space-y-4 py-8">
                    <p className="text-lg text-gray-700">This is to certify that</p>
                    <p className="text-4xl font-serif font-bold text-gray-900 my-4">
                      {selectedCertificate.student?.name || (user?.first_name + ' ' + user?.last_name)}
                    </p>
                    <p className="text-lg text-gray-700">has successfully completed the program</p>
                    <p className="text-2xl font-semibold text-yellow-700 my-4">
                      {selectedCertificate.program?.title || 'Program'}
                    </p>
                    <p className="text-lg text-gray-700">
                      with an overall grade of <span className="font-semibold text-gray-900">{selectedCertificate.grade}%</span>
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-3 gap-8 pt-12 mt-8 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Date Issued</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedCertificate.issued_date)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Certificate No.</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCertificate.certificate_number}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Grade</p>
                      <p className="font-semibold text-gray-900">{selectedCertificate.grade}%</p>
                    </div>
                  </div>

                  <div className="pt-8 mt-8">
                    <div className="border-t-2 border-gray-800 w-64 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-700">Mr. Rolando S. Luzano</p>
                  </div>

                  {/* Official Seal */}
                  <div className="absolute bottom-12 left-12">
                    <div className="w-28 h-28 rounded-full border-4 border-yellow-600 flex items-center justify-center bg-white p-2 overflow-hidden">
                      <img src="/smi-logo.jpg" alt="SMI Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleDownload(selectedCertificate)}
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Download/Print Certificate
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
