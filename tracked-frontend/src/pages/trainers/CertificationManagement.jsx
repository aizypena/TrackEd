import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import toast, { Toaster } from 'react-hot-toast';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdWarning,
  MdPersonSearch,
  MdSchool,
  MdStar,
  MdStarHalf,
  MdAccessTime,
  MdBarChart,
  MdSend,
  MdVisibility,
  MdClose,
  MdDownload
} from 'react-icons/md';

const CertificationManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToGenerate, setStudentToGenerate] = useState(null);

  useEffect(() => {
    fetchCertificationData();
  }, []);

  const fetchCertificationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('https://api.smitracked.cloud/api/trainer/certification/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setPrograms(data.programs || []);
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching certification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = (studentId, studentName) => {
    setStudentToGenerate({ id: studentId, name: studentName });
    setShowConfirmModal(true);
  };

  const confirmGenerateCertificate = async () => {
    if (!studentToGenerate) return;

    setShowConfirmModal(false);
    setGeneratingCertificate(true);
    const loadingToast = toast.loading('Generating certificate...');

    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('https://api.smitracked.cloud/api/trainer/certification/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentToGenerate.id
        })
      });

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (response.ok && data.success) {
        toast.success('Certificate generated successfully!');
        // Refresh the data to update the status
        fetchCertificationData();
      } else {
        toast.error(data.message || 'Failed to generate certificate');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error generating certificate:', error);
      toast.error('An error occurred while generating certificate');
    } finally {
      setGeneratingCertificate(false);
      setStudentToGenerate(null);
    }
  };

  const handlePreviewCertificate = (student) => {
    setPreviewStudent(student);
    setShowPreview(true);
  };

  const handleGenerateCertificateFromPreview = async () => {
    if (previewStudent) {
      setShowPreview(false);
      await handleGenerateCertificate(previewStudent.id, previewStudent.name);
    }
  };

  const handleDownloadCertificate = () => {
    if (!previewStudent) return;

    // Get the certificate content
    const certificateContent = document.getElementById('certificate-preview');
    
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${previewStudent.name}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { size: landscape; margin: 0; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .certificate-container {
              border: 8px double #CA8A04;
              padding: 60px;
              background: linear-gradient(to bottom right, #FFFBEB, white);
              position: relative;
              min-height: 600px;
            }
            .corner {
              position: absolute;
              width: 60px;
              height: 60px;
              border-color: #CA8A04;
              border-style: solid;
            }
            .corner-tl { top: 16px; left: 16px; border-width: 4px 0 0 4px; }
            .corner-tr { top: 16px; right: 16px; border-width: 4px 4px 0 0; }
            .corner-bl { bottom: 16px; left: 16px; border-width: 0 0 4px 4px; }
            .corner-br { bottom: 16px; right: 16px; border-width: 0 4px 4px 0; }
            .certificate-content {
              text-align: center;
            }
            .certificate-title {
              font-size: 48px;
              font-weight: bold;
              color: #1F2937;
              margin-bottom: 8px;
              font-family: Georgia, serif;
            }
            .title-underline {
              width: 120px;
              height: 4px;
              background: #CA8A04;
              margin: 0 auto 40px;
            }
            .cert-text {
              font-size: 18px;
              color: #374151;
              margin: 20px 0;
            }
            .student-name {
              font-size: 40px;
              font-weight: bold;
              color: #111827;
              margin: 30px 0;
              font-family: Georgia, serif;
            }
            .program-name {
              font-size: 28px;
              font-weight: 600;
              color: #B45309;
              margin: 30px 0;
            }
            .footer-info {
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
              margin-bottom: 4px;
            }
            .footer-value {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            }
            .signature-line {
              border-top: 2px solid #1F2937;
              width: 250px;
              margin: 0 auto 8px;
              margin-top: 60px;
            }
            .signature-text {
              font-size: 14px;
              color: #374151;
            }
            .seal {
              position: absolute;
              bottom: 60px;
              left: 60px;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              border: 4px solid #CA8A04;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              padding: 10px;
            }
            .seal img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <div class="certificate-content">
              <h1 class="certificate-title">Certificate of Completion</h1>
              <div class="title-underline"></div>
              
              <p class="cert-text">This is to certify that</p>
              <p class="student-name">${previewStudent.name}</p>
              <p class="cert-text">has successfully completed the program</p>
              <p class="program-name">${previewStudent.program}</p>
              <p class="cert-text">with an overall grade of <strong>${previewStudent.progress.overall_grade}%</strong></p>
              
              <div class="footer-info">
                <div class="footer-item">
                  <div class="footer-label">Date Issued</div>
                  <div class="footer-value">${previewStudent.certificate?.issued_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="footer-item">
                  <div class="footer-label">Certificate No.</div>
                  <div class="footer-value">${previewStudent.certificate?.certificate_number || 'CERT-' + new Date().getFullYear() + '-XXXX'}</div>
                </div>
                <div class="footer-item">
                  <div class="footer-label">Grade</div>
                  <div class="footer-value">${previewStudent.progress.overall_grade}%</div>
                </div>
              </div>
              
              <div class="signature-line"></div>
              <p class="signature-text">Authorized Signature</p>
            </div>
            
            <div class="seal">
              <img src="/smi-logo.jpg" alt="SMI Logo" />
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
  
  const certificationStatus = [
    { value: 'eligible', label: 'Eligible for Certification' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'recommended', label: 'Recommended' },
    { value: 'not-eligible', label: 'Not Eligible' },
  ];

    const filteredStudents = students.filter(student => {
    // Only show students with TESDA assessment records
    if (!student.has_tesda_assessment) return false;
    
    const matchesProgram = selectedProgram === 'all' || student.program_id === parseInt(selectedProgram);
    const matchesSection = selectedSection === 'all' || student.batch_id === selectedSection;
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesSection && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible':
        return 'text-green-600 bg-green-50';
      case 'recommended':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'not-eligible':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'eligible':
        return <MdCheckCircle className="h-5 w-5" />;
      case 'recommended':
        return <MdSchool className="h-5 w-5" />;
      case 'pending':
        return <MdPendingActions className="h-5 w-5" />;
      case 'not-eligible':
        return <MdWarning className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getRequirementIcon = (isComplete) => {
    return isComplete ? (
      <MdCheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <MdCancel className="h-5 w-5 text-red-500" />
    );
  };

  const handleRecommendation = (studentId, action) => {
    console.log('Certification action:', { studentId, action });
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
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
      <TrainerSidebar 
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
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Certification Management</h1>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  {certificationStatus.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MdPersonSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500">
                {students.length === 0 
                  ? "No students are enrolled in your batches yet."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.student_id}</p>
                        <p className="text-sm text-gray-500">{student.program}</p>
                        {student.certificate && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            Certificate: {student.certificate.certificate_number}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.certification.status)}`}>
                          {getStatusIcon(student.certification.status)}
                          <span className="ml-2 capitalize">{student.certification.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Progress Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Progress Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Attendance</div>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-semibold text-gray-900">{student.progress.attendance}%</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Overall Grade</div>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-semibold text-gray-900">{student.progress.overall_grade}%</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Practical</div>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-semibold text-gray-900">{student.progress.practical_assessments}%</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Theoretical</div>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-semibold text-gray-900">{student.progress.theoretical_assessments}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Certification Requirements */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Certification Requirements</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Minimum Attendance (85%)</span>
                            {getRequirementIcon(student.certification.requirements.attendance)}
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Overall Grades (75%)</span>
                            {getRequirementIcon(student.certification.requirements.grades)}
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Practical Assessments</span>
                            {getRequirementIcon(student.certification.requirements.practicals)}
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Theoretical Assessments</span>
                            {getRequirementIcon(student.certification.requirements.theoretical)}
                          </div>
                        </div>

                        {/* Remarks */}
                        {student.certification.remarks && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900">Remarks</h4>
                            <p className="mt-1 text-sm text-gray-500">{student.certification.remarks}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex space-x-3">
                          <button
                            onClick={() => handlePreviewCertificate(student)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MdVisibility className="h-5 w-5 mr-2" />
                            {student.certificate ? 'View Certificate' : 'Preview Certificate'}
                          </button>
                          
                          {student.certificate ? (
                            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                              <MdCheckCircle className="h-5 w-5 mr-2" />
                              Certificate Issued
                            </div>
                          ) : student.certification.status === 'eligible' ? (
                            <button
                              onClick={() => handleGenerateCertificate(student.id, student.name)}
                              disabled={generatingCertificate}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MdSchool className="h-5 w-5 mr-2" />
                              Generate Certificate
                            </button>
                          ) : student.certification.status === 'pending' ? (
                            <button
                              onClick={() => handleRecommendation(student.id, 'review')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <MdPersonSearch className="h-5 w-5 mr-2" />
                              Review Progress
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && studentToGenerate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <MdWarning className="h-6 w-6 text-yellow-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Generate Certificate?
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to generate a certificate for{' '}
              <span className="font-semibold text-gray-900">{studentToGenerate.name}</span>?
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setStudentToGenerate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmGenerateCertificate}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreview && previewStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Certificate Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <MdClose className="h-6 w-6" />
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
                    <p className="text-4xl font-serif font-bold text-gray-900 my-4">{previewStudent.name}</p>
                    <p className="text-lg text-gray-700">has successfully completed the program</p>
                    <p className="text-2xl font-semibold text-yellow-700 my-4">{previewStudent.program}</p>
                    <p className="text-lg text-gray-700">
                      with an overall grade of <span className="font-semibold text-gray-900">{previewStudent.progress.overall_grade}%</span>
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-3 gap-8 pt-12 mt-8 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Date Issued</p>
                      <p className="font-semibold text-gray-900">
                        {previewStudent.certificate?.issued_date || new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Certificate No.</p>
                      <p className="font-semibold text-gray-900">
                        {previewStudent.certificate?.certificate_number || `CERT-${new Date().getFullYear()}-XXXX`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Grade</p>
                      <p className="font-semibold text-gray-900">{previewStudent.progress.overall_grade}%</p>
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
                onClick={handleDownloadCertificate}
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Download/Print Certificate
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {!previewStudent?.certificate && (
                  <button
                    onClick={handleGenerateCertificateFromPreview}
                    disabled={generatingCertificate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdSchool className="h-5 w-5 mr-2" />
                    Generate Official Certificate
                  </button>
                )}
                {previewStudent?.certificate && (
                  <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                    <MdCheckCircle className="h-5 w-5 mr-2" />
                    Certificate Already Issued
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationManagement;
