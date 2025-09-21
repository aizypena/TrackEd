import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    // Clear all stored authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    
    // Redirect to home page
    navigate('/');
  };

  useEffect(() => {
    // Check if user is logged in by checking localStorage or sessionStorage
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Check if user has the correct role (applicant or student)
          if (parsedUser.role === 'applicant' || parsedUser.role === 'student') {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // User has wrong role, clear storage and redirect
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
        // Clear potentially corrupted data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-tracked-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Welcome, {user?.name || user?.email || 'Applicant'} 
            <span className="text-sm font-normal opacity-75 ml-2">({user?.role})</span>
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Application Status</h3>
            <p className="text-gray-600 mb-4">Check your application progress</p>
            <button className="bg-tracked-primary hover:bg-tracked-primary/90 text-white px-4 py-2 rounded transition-colors">
              View Status
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Available Programs</h3>
            <p className="text-gray-600 mb-4">Browse training programs</p>
            <button className="bg-tracked-primary hover:bg-tracked-primary/90 text-white px-4 py-2 rounded transition-colors">
              Browse Programs
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-gray-600 mb-4">Upload required documents</p>
            <button className="bg-tracked-primary hover:bg-tracked-primary/90 text-white px-4 py-2 rounded transition-colors">
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
