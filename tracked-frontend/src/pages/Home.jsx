import { Link } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';

const Home = () => {
  const portals = [
    {
      title: "Apply for Training",
      description: "Start your journey with SMI's training programs",
      link: "/applicants/dashboard",
      color: "indigo",
      icon: "📝",
      features: ["Browse Programs", "Submit Applications", "Track Status", "Upload Documents"]
    },
    {
      title: "Student Access",
      description: "Continue your learning journey with SMI",
      link: "/students/dashboard",
      color: "green",
      icon: "🎓",
      features: ["Access Courses", "Track Progress", "Complete Assignments", "View Certificates"]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 border-blue-200",
      green: "bg-green-600 hover:bg-green-700 border-green-200",
      purple: "bg-purple-600 hover:bg-purple-700 border-purple-200",
      orange: "bg-orange-600 hover:bg-orange-700 border-orange-200",
      indigo: "bg-indigo-600 hover:bg-indigo-700 border-indigo-200"
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SMI Training Institute
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering individuals through comprehensive training programs. 
            Join SMI to advance your skills, achieve your goals, and transform your career.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Training</h3>
              <p className="text-gray-600 text-sm">Industry-leading programs designed by experienced professionals</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-900 mb-2">Career Growth</h3>
              <p className="text-gray-600 text-sm">Accelerate your career with our comprehensive skill development programs</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600 text-sm">Earn recognized certificates to validate your expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started Today</h2>
            <p className="text-lg text-gray-600">Choose how you'd like to begin your journey with SMI</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
>
            {portals.map((portal, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{portal.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{portal.title}</h3>
                      <p className="text-gray-600 text-sm">{portal.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {portal.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link 
                    to={portal.link}
                    className={`block w-full ${getColorClasses(portal.color)} text-white font-medium py-3 px-4 rounded-lg text-center transition duration-200 transform hover:scale-105`}
                  >
                    Access {portal.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/smi-logo.jpg" 
                alt="SMI Logo" 
                className="h-8 w-auto mr-3 opacity-80"
              />
              <span className="text-lg font-semibold">SMI Training Institute</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 SMI Training Institute. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
