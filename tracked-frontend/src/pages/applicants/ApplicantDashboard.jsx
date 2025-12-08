import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaPause, 
  FaCalendarAlt, 
  FaUser, 
  FaChartBar, 
  FaGraduationCap, 
  FaFileAlt, 
  FaEdit, 
  FaPhone, 
  FaClipboardList, 
  FaBullhorn, 
  FaInfoCircle,
  FaLightbulb
} from 'react-icons/fa';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('pending');
  const [voucherEligibility, setVoucherEligibility] = useState(null);
  const [statusReason, setStatusReason] = useState(null);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (token) {
        // Call backend logout endpoint to log the action
        await fetch('https://api.smitracked.cloud/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session storage and redirect regardless of API call result
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userData');
      navigate('/');
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const userData = sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser.role === 'applicant' || parsedUser.role === 'student') {
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Fetch current user data including application status
            fetchCurrentUserData(token);
            
            if (parsedUser.application_status) {
              setApplicationStatus(parsedUser.application_status);
            } else if (parsedUser.role === 'student') {
              setApplicationStatus('approved');
            } else {
              setApplicationStatus('pending');
            }
          } else {
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        setIsAuthenticated(false);
      }
    };

    const fetchCurrentUserData = async (token) => {
      try {
        const response = await fetch('https://api.smitracked.cloud/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            // Update user data with fresh information from API
            const updatedUserData = {
              id: userData.id,
              email: userData.email,
              name: userData.full_name || `${userData.first_name} ${userData.last_name}`,
              role: userData.role,
              created_at: userData.created_at,
              application_status: userData.application_status,
              status: userData.status,
              voucher_eligible: userData.voucher_eligible
            };
            
            // Update localStorage with fresh data
            sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
            setUser(updatedUserData);
            
            // Update voucher eligibility (0 = not eligible, 1 = eligible, 2 = waitlisted)
            setVoucherEligibility(userData.voucher_eligible);
            
            // Update status reason if available
            if (userData.status_reason) {
              setStatusReason(userData.status_reason);
            }
            
            // Update application status - prioritize application_status over status field
            // Check if user is waitlisted via status field
            if (userData.status === 'waitlisted') {
              setApplicationStatus('waitlisted');
            } else if (userData.application_status) {
              setApplicationStatus(userData.application_status);
            }
          }
        } else {
          console.error('Failed to fetch user data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-tracked-primary text-white border-tracked-primary', text: 'Approved', icon: <FaCheckCircle /> };
      case 'rejected':
        return { color: 'bg-tracked-primary text-white border-tracked-primary', text: 'Rejected', icon: <FaTimesCircle /> };
      case 'under_review':
        return { color: 'bg-tracked-primary text-white border-tracked-primary', text: 'Under Review', icon: <FaClock /> };
      case 'pending':
      default:
        return { color: 'bg-tracked-primary text-white border-tracked-primary', text: 'Pending', icon: <FaPause /> };
    }
  };

  const statusDisplay = getStatusDisplay(applicationStatus);

  // Function to get voucher eligibility display
  const getVoucherEligibilityDisplay = (eligibility) => {
    switch (eligibility) {
      case 1:
        return { 
          color: 'bg-green-600 text-white border-green-600', 
          text: 'Eligible', 
          icon: <FaCheckCircle />,
          textColor: 'text-green-700'
        };
      case 2:
        return { 
          color: 'bg-orange-600 text-white border-orange-600', 
          text: 'Waitlisted', 
          icon: <FaClipboardList />,
          textColor: 'text-orange-700'
        };
      case 0:
      default:
        return { 
          color: 'bg-gray-600 text-white border-gray-600', 
          text: 'Not Eligible', 
          icon: <FaTimesCircle />,
          textColor: 'text-gray-700'
        };
    }
  };

  const voucherDisplay = getVoucherEligibilityDisplay(voucherEligibility);

  // Function to properly capitalize name
  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-tracked-primary/5">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/smi-logo.jpg" alt="SMI Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {formatName(user?.name) || user?.email || 'Applicant'} 
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.role === 'student' ? 'Student Portal' : 'Applicant Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="bg-tracked-primary hover:cursor-pointer hover:bg-tracked-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-tracked-primary to-tracked-primary/80 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold bg-tracked-primary text-white border-2 border-white/30">
              <span>Application Status: {statusDisplay.text}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-tracked-primary to-tracked-primary/80 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Application Overview</h2>
            <p className="text-white/90">Track your application progress and access student services</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-tracked-primary text-white text-3xl mb-4 transition-transform group-hover:scale-105 shadow-lg border-2 border-tracked-primary">
                  {statusDisplay.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Status</h3>
                <p className="text-lg font-semibold text-gray-700">{statusDisplay.text}</p>
              </div>

              <div className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${voucherDisplay.color} text-3xl mb-4 transition-transform group-hover:scale-105 shadow-lg border-2`}>
                  {voucherDisplay.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Voucher Status</h3>
                <p className={`text-lg font-semibold ${voucherDisplay.textColor}`}>{voucherDisplay.text}</p>
              </div>
              
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-tracked-primary text-white text-3xl mb-4 transition-transform group-hover:scale-105 shadow-lg border-2 border-tracked-primary">
                  <FaCalendarAlt />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Date</h3>
                <p className="text-lg font-semibold text-gray-700">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Date not available'}
                </p>
              </div>
              
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-tracked-primary text-white text-3xl mb-4 transition-transform group-hover:scale-105 shadow-lg border-2 border-tracked-primary">
                  <FaUser />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Account Type</h3>
                <p className="text-lg font-semibold text-gray-700 capitalize">{user?.role || 'Applicant'}</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-tracked-primary rounded-full flex items-center justify-center">
                      <FaInfoCircle className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Application Status Information</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {applicationStatus === 'approved' && 'Congratulations! Your application has been approved. You now have full access to all student features and can begin your learning journey with SMI Institute.'}
                      {applicationStatus === 'rejected' && (
                        <>
                          We regret to inform you that your application was not approved at this time.
                          {statusReason && (
                            <div className="mt-3 p-4 bg-red-100 border border-red-300 rounded-lg">
                              <p className="font-semibold text-red-800 mb-1">Reason:</p>
                              <p className="text-red-700">{statusReason}</p>
                            </div>
                          )}
                          <p className="mt-3">Please contact our admissions office for more information about reapplication opportunities.</p>
                        </>
                      )}
                      {applicationStatus === 'under_review' && (
                        <>
                          Your application is currently under careful review by our admissions committee.
                          {statusReason && (
                            <div className="mt-3 p-4 bg-amber-100 border border-amber-300 rounded-lg">
                              <p className="font-semibold text-amber-800 mb-1">Review Notes:</p>
                              <p className="text-amber-700">{statusReason}</p>
                            </div>
                          )}
                          <p className="mt-3">We typically complete our review process within 5-7 business days. You will receive an email notification once a decision is made.</p>
                        </>
                      )}
                      {applicationStatus === 'waitlisted' && 'Your application has been placed on the waitlist. This means that while your application meets our requirements, all available slots in your selected training batch are currently full. You will be automatically enrolled when a slot becomes available. We will notify you via email if your status changes.'}
                      {applicationStatus === 'pending' && 'Thank you for submitting your application to SMI Institute. Your application has been received and will be reviewed by our admissions team. We appreciate your patience during this process.'}
                    </p>
                  </div>
                </div>
              </div>

              {voucherEligibility !== null && (
                <div className={`p-6 rounded-xl border ${
                  voucherEligibility === 1 ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-green-200' :
                  voucherEligibility === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-200' :
                  'bg-gradient-to-r from-gray-50 to-slate-50/50 border-gray-200'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        voucherEligibility === 1 ? 'bg-green-600' :
                        voucherEligibility === 2 ? 'bg-orange-600' :
                        'bg-gray-600'
                      }`}>
                        {voucherDisplay.icon && <span className="text-white text-xl">{voucherDisplay.icon}</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Voucher Eligibility Information</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {voucherEligibility === 1 && 'Great news! You are currently eligible for a training voucher. Vouchers are issued on a first-come, first-served basis and are subject to availability. Please note that voucher eligibility expires after 3 days if not claimed.'}
                        {voucherEligibility === 2 && 'You are currently on the voucher waitlist. While vouchers are not immediately available, you will be automatically promoted to eligible status when a voucher slot becomes available. We will notify you via email when this happens.'}
                        {voucherEligibility === 0 && 'Your application is not currently eligible for a training voucher. Voucher eligibility is determined based on batch availability and program requirements. Please contact our admissions office if you have questions about voucher eligibility.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="bg-tracked-primary p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <FaGraduationCap className="text-tracked-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Training Programs</h3>
                  <p className="text-white/90">Explore courses</p>
                </div>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-gray-700 mb-6 leading-relaxed flex-1">
                Browse our comprehensive catalog of technical and vocational training programs designed for your career growth.
              </p>
              <button 
                onClick={() => navigate('/applicant/training-programs')}
                className="w-full bg-tracked-primary hover:cursor-pointer hover:bg-tracked-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Browse Programs
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="bg-tracked-primary p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <FaFileAlt className="text-tracked-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Documents</h3>
                  <p className="text-white/90">Manage files</p>
                </div>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-gray-700 mb-6 leading-relaxed flex-1">
                Upload and manage all required documents for your application and enrollment process securely.
              </p>
              <button 
                onClick={() => navigate('/applicant/manage-documents')}
                className="w-full bg-tracked-primary hover:cursor-pointer hover:bg-tracked-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Manage Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
