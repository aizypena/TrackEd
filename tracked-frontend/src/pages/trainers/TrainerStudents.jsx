import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import { getTrainerToken, getTrainerUser } from '../../utils/trainerAuth';
import { 
  MdMenu,
  MdSearch,
  MdPeople,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCalendarToday,
  MdRefresh,
  MdDownload,
  MdPrint
} from 'react-icons/md';

const TrainerStudents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trainerUser, setTrainerUser] = useState(null);

  useEffect(() => {
    const user = getTrainerUser();
    setTrainerUser(user);
    fetchTrainerBatches();
  }, []);

  useEffect(() => {
    if (batches.length > 0) {
      fetchStudents();
    } else if (batches.length === 0 && !loading) {
      // If no batches and not initially loading, stop loading state
      setLoading(false);
    }
  }, [selectedBatch, batches]);

  const fetchTrainerBatches = async () => {
    try {
      const token = getTrainerToken();
      const response = await fetch('http://localhost:8000/api/trainer/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedBatches = data.data || [];
        setBatches(fetchedBatches);
        
        // If no batches, stop loading immediately
        if (fetchedBatches.length === 0) {
          setLoading(false);
        }
      } else {
        console.error('Failed to fetch trainer batches');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching trainer batches:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getTrainerToken();
      
      // If batches haven't loaded yet, don't fetch students
      if (batches.length === 0) {
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/trainer/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Get all students from the API (now includes program_name directly)
        let allStudents = data.data || [];
        
        // If a specific batch is selected, filter students by that batch
        if (selectedBatch !== 'all') {
          allStudents = allStudents.filter(s => s.batch_id.toString() === selectedBatch.toString());
        }
        
        // Rename batch_string_id to batch_name for display
        const studentsWithBatchName = allStudents.map(student => ({
          ...student,
          batch_name: student.batch_string_id || 'N/A'
        }));
        
        setStudents(studentsWithBatchName);
      } else {
        console.error('Failed to fetch students:', data);
        console.error('Error message:', data.message);
        console.error('Error details:', data.error);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.toLowerCase();
    const studentId = student.student_id?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || studentId.includes(query);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-tracked-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-tracked-primary-dark"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">My Students</h1>
                <p className="text-sm text-blue-100">View students from your assigned batches</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-tracked-secondary rounded-md">
                <MdPeople className="h-5 w-5" />
                <span className="text-sm font-medium">{filteredStudents.length} Students</span>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="container mx-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdSchool className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdPeople className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Batches</p>
                  <p className="text-2xl font-bold text-green-600">{batches.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MdCalendarToday className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Filtered Results</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredStudents.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                  />
                </div>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_id} - {batch.program_name || 'Unknown Program'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button 
                  onClick={fetchStudents}
                  disabled={loading}
                  className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tracked-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {students.length === 0 
                          ? 'No students found in your assigned batches.'
                          : 'No students match your search criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-tracked-primary flex items-center justify-center text-white font-semibold">
                                {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {capitalizeName(student.first_name)} {student.middle_name ? capitalizeName(student.middle_name) + ' ' : ''}{capitalizeName(student.last_name)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {student.student_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <MdEmail className="h-4 w-4 text-gray-400" />
                            {student.email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MdPhone className="h-4 w-4 text-gray-400" />
                            {student.phone_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.batch_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.program_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(student.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerStudents;
