import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { programAPI } from '../../services/programAPI';
import { 
  FaGraduationCap, 
  FaClock, 
  FaCheckCircle,
  FaArrowLeft,
  FaBook,
  FaBriefcase,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa';

const TrainingPrograms = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleLogout = () => {
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    navigate('/');
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
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await programAPI.getAll({ availability: 'available' });
        if (response.success) {
          setPrograms(response.data);
        }
      } catch (err) {
        setError('Failed to load training programs. Please try again later.');
        console.error('Error fetching programs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPrograms();
    }
  }, [isAuthenticated]);

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

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
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
                  Training Programs
                </h1>
                <p className="text-sm text-gray-600">
                  Explore our available courses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/applicant/dashboard')}
                className="bg-gray-200 hover:cursor-pointer hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
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

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-tracked-primary to-tracked-primary/80 p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Available Training Programs</h2>
            <p className="text-white/90 text-lg">Choose from our comprehensive range of technical and vocational courses</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tracked-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading programs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Programs Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-tracked-primary to-indigo-900 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex-1 pr-2 leading-snug">
                      {program.title}
                    </h3>
                  </div>
                  <div className="text-white/90 text-sm font-medium">
                    Duration: {program.duration} hours
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {program.description}
                  </p>

                  {/* Core Competencies */}
                  {program.core_competencies && program.core_competencies.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2 border-b border-gray-200 pb-1">
                        Key Competencies
                      </h4>
                      <ul className="space-y-1.5 pl-1">
                        {program.core_competencies.slice(0, 3).map((comp, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="inline-block w-1 h-1 rounded-full bg-tracked-primary mr-2 mt-1.5 flex-shrink-0"></span>
                            <span className="line-clamp-1">{comp}</span>
                          </li>
                        ))}
                        {program.core_competencies.length > 3 && (
                          <li className="text-xs text-tracked-primary font-medium pl-3">
                            +{program.core_competencies.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Career Opportunities */}
                  {program.career_opportunities && program.career_opportunities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2 border-b border-gray-200 pb-1">
                        Career Paths
                      </h4>
                      <ul className="space-y-1.5 pl-1">
                        {program.career_opportunities.slice(0, 2).map((opp, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="inline-block w-1 h-1 rounded-full bg-tracked-primary mr-2 mt-1.5 flex-shrink-0"></span>
                            <span className="line-clamp-1">{opp}</span>
                          </li>
                        ))}
                        {program.career_opportunities.length > 2 && (
                          <li className="text-xs text-tracked-primary font-medium pl-3">
                            +{program.career_opportunities.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => handleViewDetails(program)}
                    className="mt-auto w-full hover:cursor-pointer bg-tracked-primary hover:bg-indigo-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && programs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaGraduationCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Programs Available</h3>
            <p className="text-gray-600">
              There are currently no training programs available. Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-tracked-primary to-indigo-900 px-6 py-5 rounded-t-xl flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {selectedProgram.title}
                </h3>
                <div className="text-white/90 font-medium">
                  Duration: {selectedProgram.duration} hours
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 hover:cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {/* Description Section */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-tracked-primary">
                  Program Overview
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedProgram.description}</p>
              </div>

              {/* Core Competencies Section */}
              {selectedProgram.core_competencies && selectedProgram.core_competencies.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-tracked-primary">
                    Core Competencies
                  </h4>
                  <div className="space-y-2">
                    {selectedProgram.core_competencies.map((comp, idx) => (
                      <div key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg border-l-4 border-tracked-primary">
                        <span className="text-gray-700 text-sm">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Opportunities Section */}
              {selectedProgram.career_opportunities && selectedProgram.career_opportunities.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-tracked-primary">
                    Career Opportunities
                  </h4>
                  <div className="space-y-2">
                    {selectedProgram.career_opportunities.map((opp, idx) => (
                      <div key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg border-l-4 border-amber-500">
                        <span className="text-gray-700 text-sm">{opp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrollment Status */}
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-1">Enrollment Status</h4>
                <p className="text-gray-700 text-sm">
                  This program is currently <span className="font-bold text-green-600 uppercase">{selectedProgram.availability}</span> for enrollment.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gray-600 hover:cursor-pointer hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
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

export default TrainingPrograms;