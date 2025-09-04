import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-orange-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Staff Dashboard</h1>
          <Link to="/" className="hover:text-orange-200">← Back to Home</Link>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Schedule Management</h3>
            <p className="text-gray-600 mb-4">Manage training schedules</p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
              Manage Schedule
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Resource Allocation</h3>
            <p className="text-gray-600 mb-4">Allocate resources and facilities</p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
              Manage Resources
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Communication</h3>
            <p className="text-gray-600 mb-4">Send announcements and updates</p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
              Send Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
