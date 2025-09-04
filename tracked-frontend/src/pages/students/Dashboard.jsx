import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Student Dashboard</h1>
          <Link to="/" className="hover:text-green-200">← Back to Home</Link>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">My Courses</h3>
            <p className="text-gray-600 mb-4">View enrolled courses and progress</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              View Courses
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Assignments</h3>
            <p className="text-gray-600 mb-4">Complete pending assignments</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              View Assignments
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600 mb-4">Track your learning progress</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
