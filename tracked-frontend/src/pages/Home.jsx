import { Link } from 'react-router-dom';

const Home = () => {
  const portals = [
    {
      title: "Admin Portal",
      description: "Manage users, courses, and system settings",
      link: "/admin/dashboard",
      color: "blue",
      icon: "👤",
      features: ["User Management", "Course Setup", "Reports & Analytics"]
    },
    {
      title: "Student Portal",
      description: "Access courses, track progress, and complete assignments",
      link: "/students/dashboard",
      color: "green",
      icon: "🎓",
      features: ["Course Access", "Progress Tracking", "Assignments"]
    },
    {
      title: "Trainer Portal",
      description: "Manage classes, monitor progress, and upload materials",
      link: "/trainers/dashboard",
      color: "purple",
      icon: "👨‍🏫",
      features: ["Class Management", "Student Monitoring", "Materials Upload"]
    },
    {
      title: "Staff Portal",
      description: "Handle scheduling, resources, and communication",
      link: "/staff/dashboard",
      color: "orange",
      icon: "👥",
      features: ["Schedule Management", "Resource Allocation", "Communication"]
    },
    {
      title: "Applicant Portal",
      description: "Apply for programs and track application status",
      link: "/applicants/dashboard",
      color: "indigo",
      icon: "📝",
      features: ["Program Applications", "Status Tracking", "Document Upload"]
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Logo" 
              className="h-12 w-auto mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TrackEd</h1>
              <p className="text-sm text-gray-600">Training Tracking System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to TrackEd
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive training management system designed to streamline education, 
            track progress, and enhance learning experiences for all stakeholders.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor learning progress and performance in real-time</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Goal Management</h3>
              <p className="text-gray-600 text-sm">Set and achieve learning objectives efficiently</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600 text-sm">Connect trainers, students, and administrators seamlessly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Portal</h2>
            <p className="text-lg text-gray-600">Access your dedicated workspace based on your role</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
              <span className="text-lg font-semibold">TrackEd</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 TrackEd Training Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
