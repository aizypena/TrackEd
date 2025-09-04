import { Link } from 'react-router-dom';

const ApplicantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Applicant Dashboard</h1>
          <Link to="/" className="hover:text-indigo-200">← Back to Home</Link>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Application Status</h3>
            <p className="text-gray-600 mb-4">Check your application progress</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              View Status
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Available Programs</h3>
            <p className="text-gray-600 mb-4">Browse training programs</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Browse Programs
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-gray-600 mb-4">Upload required documents</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
