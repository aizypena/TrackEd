import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and company name */}
          <div className="flex items-center">
            <img 
              src="/smi-logo.jpg" 
              alt="SMI Logo" 
              className="h-10 w-auto mr-3"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">SMI INSTITUTE INC.</h1>
              <p className="text-xs text-gray-600">Excellence in Education</p>
            </div>
          </div>

          {/* Right side - Navigation items */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
            >
              About
            </Link>
            <Link 
              to="/courses" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
            >
              Course Offered
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
            >
              FAQ
            </Link>
            <Link 
              to="/login"
              className="bg-blue-600 hover:cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;