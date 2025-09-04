import { Link } from 'react-router-dom';

const TrainerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Trainer Dashboard</h1>
          <Link to="/" className="hover:text-purple-200">← Back to Home</Link>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">My Classes</h3>
            <p className="text-gray-600 mb-4">Manage your training sessions</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              View Classes
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Student Progress</h3>
            <p className="text-gray-600 mb-4">Monitor student performance</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              View Progress
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Materials</h3>
            <p className="text-gray-600 mb-4">Upload and manage course materials</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              Manage Materials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
