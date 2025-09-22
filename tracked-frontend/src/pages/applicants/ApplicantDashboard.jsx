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

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    navigate('/');
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser.role === 'applicant' || parsedUser.role === 'student') {
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            if (parsedUser.application_status) {
              setApplicationStatus(parsedUser.application_status);
            } else if (parsedUser.role === 'student') {
              setApplicationStatus('approved');
            } else {
              setApplicationStatus('pending');
            }
          } else {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        setIsAuthenticated(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-tracked-primary/5">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/smi-logo.jpg" alt="SMI Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {user?.name || user?.email || 'Applicant'} 
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.role === 'student' ? 'Student Portal' : 'Applicant Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="bg-tracked-primary hover:bg-tracked-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
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
              <span className="mr-3 text-xl">{statusDisplay.icon}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-tracked-primary text-white text-3xl mb-4 transition-transform group-hover:scale-105 shadow-lg border-2 border-tracked-primary">
                  {statusDisplay.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Current Status</h3>
                <p className="text-lg font-semibold text-gray-700">{statusDisplay.text}</p>
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
            
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-tracked-primary rounded-full flex items-center justify-center">
                    <FaInfoCircle className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Status Information</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {applicationStatus === 'approved' && 'Congratulations! Your application has been approved. You now have full access to all student features and can begin your learning journey with SMI Institute.'}
                    {applicationStatus === 'rejected' && 'We regret to inform you that your application was not approved at this time. Please contact our admissions office for detailed feedback and information about reapplication opportunities.'}
                    {applicationStatus === 'under_review' && 'Your application is currently under careful review by our admissions committee. We typically complete our review process within 5-7 business days. You will receive an email notification once a decision is made.'}
                    {applicationStatus === 'pending' && 'Thank you for submitting your application to SMI Institute. Your application has been received and will be reviewed by our admissions team. We appreciate your patience during this process.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="bg-tracked-primary p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <FaChartBar className="text-tracked-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Application Status</h3>
                  <p className="text-white/90">Track your progress</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                View detailed information about your application status and track your progress through the admission process.
              </p>
              <button className="w-full bg-tracked-primary hover:bg-tracked-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md">
                View Detailed Status
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
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
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Browse our comprehensive catalog of technical and vocational training programs designed for your career growth.
              </p>
              <button className="w-full bg-tracked-primary hover:bg-tracked-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md">
                Browse Programs
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
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
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Upload and manage all required documents for your application and enrollment process securely.
              </p>
              <button className="w-full bg-tracked-primary hover:bg-tracked-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md">
                Manage Documents
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-tracked-primary text-white rounded-lg flex items-center justify-center mr-3">
                <FaLightbulb />
              </span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <FaEdit className="text-lg mr-3 text-tracked-primary" />
                <span className="text-gray-700 group-hover:text-gray-900">Update Profile Information</span>
              </a>
              <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <FaPhone className="text-lg mr-3 text-tracked-primary" />
                <span className="text-gray-700 group-hover:text-gray-900">Contact Support</span>
              </a>
              <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <FaClipboardList className="text-lg mr-3 text-tracked-primary" />
                <span className="text-gray-700 group-hover:text-gray-900">View Requirements</span>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-tracked-primary text-white rounded-lg flex items-center justify-center mr-3">
                <FaBullhorn />
              </span>
              Important Notices
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-tracked-primary rounded-lg border-l-4 border-tracked-primary">
                <p className="text-sm font-semibold text-white">Enrollment Period</p>
                <p className="text-white/90 text-sm">Next enrollment period starts on October 1, 2025</p>
              </div>
              <div className="p-4 bg-tracked-primary rounded-lg border-l-4 border-tracked-primary">
                <p className="text-sm font-semibold text-white">Document Deadline</p>
                <p className="text-white/90 text-sm">Submit all required documents before September 30, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
