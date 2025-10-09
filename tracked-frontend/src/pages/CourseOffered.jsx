import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/applicants/Navbar';
import Footer from '../layouts/applicants/Footer';
import { programAPI } from '../services/programAPI';

function CourseOffered() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await programAPI.getAll({ availability: 'available' });
        if (response.success) {
          setPrograms(response.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-tracked-primary to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Academic Programs</h1>
          <p className="text-xl mb-6">TESDA-Accredited Technical and Vocational Courses</p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Comprehensive training programs designed to prepare students for successful careers 
            in the hospitality and culinary industries
          </p>
        </div>
      </div>

      {/* Program Overview */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Programs?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our TESDA-accredited programs combine theoretical knowledge with hands-on practical training, 
              ensuring graduates are industry-ready and equipped with in-demand skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TESDA Certified</h3>
              <p className="text-gray-600">All programs are officially accredited by TESDA, ensuring quality education and recognized certification.</p>
            </div>
            <div className="text-center">
              <div className="bg-tracked-secondary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals with years of experience in hospitality and culinary fields.</p>
            </div>
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Career Ready</h3>
              <p className="text-gray-600">Practical training and industry connections prepare graduates for immediate employment opportunities.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Listings */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Available Programs</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
              <p className="mt-4 text-gray-600">Loading programs...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md inline-block">
                <p>Error loading programs: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && programs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Available</h3>
              <p className="text-gray-600">Check back soon for upcoming programs.</p>
            </div>
          )}

          {/* Programs List */}
          {!loading && !error && programs.length > 0 && (
            <div className="space-y-8">
              {programs.map((program) => (
                <div key={program.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      {/* Course Header */}
                      <div className="flex-1">
                        <div className="mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{program.title}</h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Duration: {program.duration} Hours
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-6">{program.description}</p>
                        
                        {/* Course Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Core Competencies */}
                          {program.core_competencies && program.core_competencies.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Core Competencies</h4>
                              <ul className="space-y-2">
                                {program.core_competencies.map((competency, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="w-2 h-2 bg-tracked-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span className="text-gray-700 text-sm">{competency}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Career Opportunities */}
                          {program.career_opportunities && program.career_opportunities.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Career Opportunities</h4>
                              <div className="space-y-2">
                                {program.career_opportunities.map((career, index) => (
                                  <div key={index} className="bg-gray-50 px-3 py-2 rounded-md">
                                    <span className="text-gray-800 text-sm font-medium">{career}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Enrollment Button */}
                      <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
                        <a 
                          href="/signup" 
                          className="inline-block bg-tracked-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition duration-200 w-full lg:w-auto text-center"
                        >
                          Enroll Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admission Information */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Information</h2>
            <p className="text-lg text-gray-600">Ready to start your educational journey? Here's what you need to know.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Admission Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Valid ID</li>
                <li>• Transcript of Record</li>
                <li>• Diploma</li>
                <li>• Passport Size Photo with White Background</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Scholarship Programs</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• TESDA Training for Work Scholarship Program</li>
                <li>• Private Enterprise Partnership</li>
                <li>• Special Training for Employment Program</li>
                <li>• Self-funded options available</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Class Schedule Options</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Monday to Friday: 8:00 AM - 5:00 PM</li>
                <li>• Flexible scheduling available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-tracked-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Begin Your Professional Journey Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful graduates who have launched their careers through our programs
          </p>
          <div className="space-x-4">
            <a 
              href="/signup" 
              className="inline-block bg-white text-tracked-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Apply for Admission
            </a>
            <a 
              href="/about" 
              className="inline-block bg-tracked-secondary hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Learn More About SMI
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CourseOffered;