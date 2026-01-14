import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StaffSidebar from '../../layouts/staff/StaffSidebar';
import ApproveApplicantModal from '../../components/staff/ApproveApplicantModal';
import StatusChangeModal from '../../components/staff/StatusChangeModal';
import ProcessPaymentModal from '../../components/staff/ProcessPaymentModal';
import DocumentViewer from '../../components/DocumentViewer';
import { getStaffToken } from '../../utils/staffAuth';
import toast, { Toaster } from 'react-hot-toast';
import { API_URL, STORAGE_URL } from '../../config/api';
import { 
  MdMenu,
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdDownload,
  MdVisibility
} from 'react-icons/md';

const StaffApplicantView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    fetchApplicantDetails();
  }, [id]);

  // Detect DevTools opening with auto-logout (simplified to avoid false positives)
  useEffect(() => {
    let logoutTriggered = false;

    const handleDevToolsDetected = () => {
      if (logoutTriggered) return;
      logoutTriggered = true;
      
      alert('Security Alert: Developer tools detected. You will be logged out for security reasons.');
      
      // Clear authentication immediately
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_user');
      sessionStorage.clear();
      
      // Immediate redirect (this closes DevTools by navigating away from the current page)
      window.location.replace('/staff/login');
    };

    // Only use window size detection to avoid false positives
    const checkDevToolsSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;
      
      if (widthThreshold || heightThreshold) {
        handleDevToolsDetected();
      }
    };

    // Check on window resize only
    window.addEventListener('resize', checkDevToolsSize);
    
    // Initial check
    checkDevToolsSize();

    return () => {
      window.removeEventListener('resize', checkDevToolsSize);
    };
  }, []);

  // Function to log system action
  const logSystemAction = async (action, description, logLevel = 'info') => {
    try {
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/log-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          log_level: logLevel,
        }),
      });

      if (!response.ok) {
        console.error('Failed to log system action');
      }
    } catch (error) {
      console.error('Error logging system action:', error);
    }
  };

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplicant(data.applicant);
      } else {
        console.error('Failed to fetch applicant details');
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Prevent keyboard shortcuts (F12, Inspect Element, DevTools, etc.)
  const handleKeyDown = (e) => {
    // Prevent Save (Ctrl+S / Cmd+S)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (e.metaKey && e.altKey && e.key === 'i')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    if ((e.ctrlKey && e.shiftKey && e.key === 'C') || (e.metaKey && e.altKey && e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+J / Cmd+Option+J (Console)
    if ((e.ctrlKey && e.shiftKey && e.key === 'J') || (e.metaKey && e.altKey && e.key === 'j')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+K / Cmd+Option+K (Console in Firefox)
    if ((e.ctrlKey && e.shiftKey && e.key === 'K') || (e.metaKey && e.altKey && e.key === 'k')) {
      e.preventDefault();
      return false;
    }
  };

  const handleStatusChangeClick = (status) => {
    setPendingStatusChange(status);
    setShowConfirmModal(true);
  };

  const getConfirmationDetails = (status) => {
    const details = {
      under_review: {
        title: 'Mark as Under Review',
        message: `Are you sure you want to mark this application as under review? This will indicate that the application is currently being reviewed by staff. An email notification will be sent to the applicant.`,
        confirmText: 'Mark as Under Review',
        color: 'blue',
        requiresReason: true
      },
      rejected: {
        title: 'Reject Application',
        message: `Are you sure you want to reject this application? This action will notify the applicant via email that their application has been rejected.`,
        confirmText: 'Reject Application',
        color: 'red',
        requiresReason: true
      },
      pending: {
        title: 'Mark as Pending',
        message: `Are you sure you want to mark this application as pending? This will move the application back to the pending queue.`,
        confirmText: 'Mark as Pending',
        color: 'orange',
        requiresReason: false
      }
    };
    return details[status] || details.pending;
  };

  const confirmStatusChange = async (reason = '') => {
    if (!pendingStatusChange) return;

    setShowConfirmModal(false);
    const status = pendingStatusChange;
    setPendingStatusChange(null);

    const loadingToast = toast.loading('Updating application status...');

    try {
      setUpdating(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          application_status: status,
          reason: reason
        })
      });

      if (response.ok) {
        // Get staff user info
        const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';
        
        // Format status for display
        const statusLabel = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Log the status change
        await logSystemAction(
          'application_status_updated',
          `${staffName} updated application status for ${capitalizeName(applicant.first_name)} ${capitalizeName(applicant.last_name)} (APP-${applicant.id}) to: ${statusLabel}`,
          'info'
        );

        const successMessage = status === 'under_review' || status === 'rejected' 
          ? `Application ${status.replace('_', ' ')} successfully! Email notification sent to ${applicant.email}. (Check spam folder if not received)`
          : `Application ${status.replace('_', ' ')} successfully!`;

        toast.success(successMessage, {
          id: loadingToast,
          duration: 5000,
        });
        fetchApplicantDetails();
      } else {
        toast.error('Failed to update application status', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating application status', {
        id: loadingToast,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEnrollAsStudent = async () => {
    setShowEnrollConfirm(false);
    const loadingToast = toast.loading('Converting to student and generating Student ID...');

    try {
      setEnrolling(true);
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${id}/enroll-student`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get staff user info
        const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
        const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';
        
        // Log the enrollment
        await logSystemAction(
          'applicant_enrolled_as_student',
          `${staffName} enrolled ${capitalizeName(applicant.first_name)} ${capitalizeName(applicant.last_name)} (APP-${applicant.id}) as student with ID: ${data.student_id}`,
          'info'
        );

        toast.success(`Successfully enrolled as student! Student ID: ${data.student_id}`, {
          id: loadingToast,
          duration: 5000,
        });
        
        fetchApplicantDetails();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to enroll as student', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error enrolling as student:', error);
      toast.error('Error enrolling as student', {
        id: loadingToast,
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleProcessPayment = async () => {
    // Payment is already processed in the modal
    // Just refresh the applicant details
    setShowPaymentModal(false);
    fetchApplicantDetails();
  };

  // Handle viewing document
  const handleViewDocument = async (docType, docLabel) => {
    if (!docType) return;
    
    setLoadingDocument(true);
    setShowDocumentViewer(true);
    
    try {
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${id}/document/${docType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Get file extension from content type
        const contentType = response.headers.get('content-type') || '';
        let extension = '';
        if (contentType.includes('pdf')) extension = 'pdf';
        else if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
        else if (contentType.includes('gif')) extension = 'gif';
        
        setCurrentDocument({
          title: docLabel,
          name: docLabel,
          fileUrl: url,
          format: extension,
          docType: docType
        });
      } else {
        toast.error('Failed to load document');
        setShowDocumentViewer(false);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Error loading document');
      setShowDocumentViewer(false);
    } finally {
      setLoadingDocument(false);
    }
  };

  // Handle document download
  const handleDownloadDocument = async () => {
    if (!currentDocument?.docType) return;
    
    try {
      const token = getStaffToken();
      const response = await fetch(`${API_URL}/staff/applicants/${id}/document/${currentDocument.docType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument.title || 'document'}.${currentDocument.format || 'file'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Document downloaded successfully');
      } else {
        toast.error('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Error downloading document');
    }
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: 'bg-orange-100 text-orange-800',
        icon: <MdPendingActions className="h-5 w-5" />,
        label: 'Pending'
      },
      under_review: {
        className: 'bg-blue-100 text-blue-800',
        icon: <MdPendingActions className="h-5 w-5" />,
        label: 'Under Review'
      },
      approved: {
        className: 'bg-green-100 text-green-800',
        icon: <MdCheckCircle className="h-5 w-5" />,
        label: 'Approved'
      },
      rejected: {
        className: 'bg-red-100 text-red-800',
        icon: <MdCancel className="h-5 w-5" />,
        label: 'Rejected'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Applicant Not Found</h2>
          <button
            onClick={() => navigate('/staff/enrollments/applications')}
            className="text-tracked-primary hover:text-tracked-secondary"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-100"
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
    >
      <StaffSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigate('/staff/enrollments/applications')}
                className="p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdArrowBack className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Applicant Details</h1>
                <p className="text-sm text-blue-100">Review application and documents</p>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <div className="container mx-auto p-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {capitalizeName(applicant.first_name)} {capitalizeName(applicant.middle_name)} {capitalizeName(applicant.last_name)}
                </h2>
                <p className="text-gray-600 mt-1">Application ID: APP-{applicant.id}</p>
                <p className="text-gray-600">Applied on: {formatDate(applicant.created_at)}</p>
                {applicant.status_updated_at && (
                  <p className="text-gray-600">Status updated: {formatDate(applicant.status_updated_at)}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {getStatusBadge(applicant.application_status)}
              </div>
            </div>
            
            {/* Display status reason if available */}
            {applicant.status_reason && (applicant.application_status === 'under_review' || applicant.application_status === 'rejected') && (
              <div className={`mt-4 p-4 rounded-lg border ${
                applicant.application_status === 'rejected' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <h4 className={`text-sm font-medium mb-1 ${
                  applicant.application_status === 'rejected' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {applicant.application_status === 'rejected' ? 'Rejection Reason:' : 'Review Reason:'}
                </h4>
                <p className={`${
                  applicant.application_status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                }`}>{applicant.status_reason}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <p className="text-gray-800 font-medium">{capitalizeName(applicant.first_name)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Middle Name</label>
                    <p className="text-gray-800 font-medium">{capitalizeName(applicant.middle_name) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <p className="text-gray-800 font-medium">{capitalizeName(applicant.last_name)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Date of Birth</label>
                    <p className="text-gray-800 font-medium">{formatDate(applicant.date_of_birth)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Place of Birth</label>
                    <p className="text-gray-800 font-medium">{applicant.place_of_birth || applicant.birth_place || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Gender</label>
                    <p className="text-gray-800 font-medium">{applicant.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Marital Status</label>
                    <p className="text-gray-800 font-medium">{applicant.marital_status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nationality</label>
                    <p className="text-gray-800 font-medium">{applicant.nationality || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-gray-800 font-medium">{applicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdPhone className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="text-gray-800 font-medium">{applicant.phone_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdLocationOn className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm text-gray-500">Address</label>
                      <p className="text-gray-800 font-medium">{applicant.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdSchool className="h-6 w-6" />
                  Educational Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Education Level</label>
                    <p className="text-gray-800 font-medium">{applicant.education_level || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Institution Name</label>
                    <p className="text-gray-800 font-medium">{applicant.institution_name || 'N/A'}</p>
                  </div>
                  {applicant.gpa && (
                    <div>
                      <label className="text-sm text-gray-500">GPA</label>
                      <p className="text-gray-800 font-medium">{applicant.gpa}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MdWork className="h-6 w-6" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Employment Status</label>
                    <p className="text-gray-800 font-medium">{applicant.employment_status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Occupation</label>
                    <p className="text-gray-800 font-medium">{applicant.occupation || 'N/A'}</p>
                  </div>
                  {applicant.work_experience && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500">Work Experience</label>
                      <p className="text-gray-800 font-medium">{applicant.work_experience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Contact Person</label>
                    <p className="text-gray-800 font-medium">{applicant.emergency_contact || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Contact Number</label>
                    <p className="text-gray-800 font-medium">{applicant.emergency_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Program & Documents */}
            <div className="space-y-6">
              {/* Program Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Program Applied</h3>
                <div className="bg-tracked-primary bg-opacity-10 p-4 rounded-lg">
                  <p className="text-tracked-secondary font-bold text-lg">
                    {applicant.course_program_formatted}
                  </p>
                </div>
              </div>

              {/* Submitted Documents */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Submitted Documents</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Valid ID', path: applicant.valid_id_path, type: 'valid_id' },
                    { label: 'Transcript of Records', path: applicant.transcript_path, type: 'transcript' },
                    { label: 'Diploma', path: applicant.diploma_path, type: 'diploma' },
                    { label: 'Passport Photo', path: applicant.passport_photo_path, type: 'passport_photo' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {doc.path ? (
                          <MdCheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <MdCancel className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                      </div>
                      {doc.path && (
                        <button
                          onClick={() => handleViewDocument(doc.type, doc.label)}
                          className="text-tracked-primary hover:text-tracked-secondary hover:cursor-pointer"
                          title="View Document"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {applicant.application_status === 'approved' ? 'Approval Status' : 'Update Status'}
                </h3>
                
                {/* If Approved - Show Voucher Status or Payment Info */}
                {applicant.application_status === 'approved' ? (
                  <div className="space-y-4">
                    {/* Voucher Eligibility Status */}
                    <div className={`p-4 rounded-lg ${applicant.voucher_eligible ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MdCheckCircle className={`h-6 w-6 ${applicant.voucher_eligible ? 'text-green-600' : 'text-orange-600'}`} />
                        <h4 className={`font-bold ${applicant.voucher_eligible ? 'text-green-800' : 'text-orange-800'}`}>
                          {applicant.voucher_eligible ? 'Voucher Eligible' : 'Payment Required'}
                        </h4>
                      </div>
                      <p className={`text-sm ${applicant.voucher_eligible ? 'text-green-700' : 'text-orange-700'}`}>
                        {applicant.voucher_eligible 
                          ? 'This applicant is eligible for a training voucher. No payment required.'
                          : 'This applicant is not eligible for a voucher. They must visit the office to process payment.'}
                      </p>
                    </div>

                    {/* Approval Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Approved On</label>
                        <p className="text-sm text-gray-800 font-medium">{formatDate(applicant.approved_at)}</p>
                      </div>
                      {applicant.batch_id && (
                        <div>
                          <label className="text-xs text-gray-500 font-medium">Assigned Batch</label>
                          <p className="text-sm text-gray-800 font-medium">{applicant.batch_id}</p>
                        </div>
                      )}
                      {applicant.approval_notes && (
                        <div>
                          <label className="text-xs text-gray-500 font-medium">Notes</label>
                          <p className="text-sm text-gray-800">{applicant.approval_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Action Button (Only for non-voucher eligible) */}
                    {!applicant.voucher_eligible && (
                      <div className="border-t pt-4">
                        {applicant.role === 'student' ? (
                          /* Already enrolled as student */
                          <div>
                            <div className="bg-green-600 text-white px-4 py-3 rounded-md text-center font-medium">
                              <MdCheckCircle className="h-6 w-6 mx-auto mb-1" />
                              Payment Completed & Enrolled
                            </div>
                            {applicant.student_id && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md text-center">
                                <label className="text-xs text-gray-500 font-medium block">Student ID</label>
                                <p className="text-lg font-bold text-tracked-primary">{applicant.student_id}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Payment has been processed and student is enrolled
                            </p>
                          </div>
                        ) : (
                          /* Show payment button */
                          <div>
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                              <MdCalendarToday className="h-5 w-5" />
                              Process Payment & Enroll
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Click to process payment and enroll as student
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Voucher Eligible - Final Status */}
                    {applicant.voucher_eligible && (
                      <div className="border-t pt-4">
                        {applicant.role === 'student' ? (
                          /* Already enrolled as student */
                          <div>
                            <div className="bg-green-600 text-white px-4 py-3 rounded-md text-center font-medium">
                              <MdCheckCircle className="h-6 w-6 mx-auto mb-1" />
                              Enrolled as Student
                            </div>
                            {applicant.student_id && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md text-center">
                                <label className="text-xs text-gray-500 font-medium block">Student ID</label>
                                <p className="text-lg font-bold text-tracked-primary">{applicant.student_id}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 text-center mt-2">
                              This applicant has been successfully enrolled as a student
                            </p>
                          </div>
                        ) : (
                          /* Show enroll button */
                          <div>
                            <button
                              onClick={() => setShowEnrollConfirm(true)}
                              disabled={enrolling}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MdCheckCircle className="h-5 w-5" />
                              {enrolling ? 'Enrolling...' : 'Enroll as Student'}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Click to convert to student and generate Student ID
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not Approved Yet - Show Status Change Buttons */
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStatusChangeClick('under_review')}
                      disabled={updating || applicant.application_status === 'under_review'}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdPendingActions className="h-5 w-5" />
                      Mark as Under Review
                    </button>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={updating || applicant.role === 'student'}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdCheckCircle className="h-5 w-5" />
                      {applicant.role === 'student' ? 'Already a Student' : 'Approve Application'}
                    </button>
                    <button
                      onClick={() => handleStatusChangeClick('rejected')}
                      disabled={updating || applicant.application_status === 'rejected'}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdCancel className="h-5 w-5" />
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleStatusChangeClick('pending')}
                      disabled={
                        updating || 
                        applicant.application_status === 'pending' ||
                        applicant.application_status === 'under_review' ||
                        applicant.application_status === 'rejected'
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdPendingActions className="h-5 w-5" />
                      Mark as Pending
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {pendingStatusChange && (
        <StatusChangeModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPendingStatusChange(null);
          }}
          onConfirm={confirmStatusChange}
          details={getConfirmationDetails(pendingStatusChange)}
          requiresReason={getConfirmationDetails(pendingStatusChange).requiresReason}
        />
      )}

      {/* Enroll as Student Confirmation Modal */}
      <StatusChangeModal
        isOpen={showEnrollConfirm}
        onClose={() => setShowEnrollConfirm(false)}
        onConfirm={handleEnrollAsStudent}
        details={{
          title: 'Enroll as Student',
          message: `Are you sure you want to enroll ${capitalizeName(applicant?.first_name)} ${capitalizeName(applicant?.last_name)} as a student? This will:\n\n• Change their role to "Student"\n• Generate a unique Student ID\n• Complete their enrollment process\n\nThis action cannot be undone.`,
          confirmText: 'Enroll as Student',
          color: 'green',
          requiresReason: false
        }}
        requiresReason={false}
      />

      {/* Approve Applicant Modal */}
      <ApproveApplicantModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        applicant={applicant}
        onSuccess={async (updatedStudent) => {
          // Get staff user info
          const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || '{}');
          const staffName = `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Staff';
          
          // Log the approval and enrollment
          await logSystemAction(
            'applicant_approved_enrolled',
            `${staffName} approved and enrolled ${capitalizeName(applicant.first_name)} ${capitalizeName(applicant.last_name)} (APP-${applicant.id}) as a student in ${applicant.course_program_formatted}`,
            'info'
          );
          
          fetchApplicantDetails();
          setShowApproveModal(false);
        }}
      />

      {/* Process Payment Modal */}
      <ProcessPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        applicant={applicant}
        onSuccess={handleProcessPayment}
      />

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={() => {
          setShowDocumentViewer(false);
          setCurrentDocument(null);
        }}
        document={currentDocument}
        onDownload={handleDownloadDocument}
        loading={loadingDocument}
      />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
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
    </div>
  );
};

export default StaffApplicantView;
