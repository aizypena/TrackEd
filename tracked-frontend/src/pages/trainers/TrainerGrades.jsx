import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import {
  MdMenu,
  MdSearch,
  MdFilterList,
  MdSave,
  MdDownload,
  MdEdit,
  MdCheck,
  MdClose,
  MdWarning
} from 'react-icons/md';

const TrainerGrades = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [tempGrade, setTempGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('trainerToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/trainer/grades', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Handle authentication errors
      if (response.status === 401) {
        sessionStorage.removeItem('trainerToken');
        sessionStorage.removeItem('trainerUser');
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data || []);
        setPrograms(data.programs || []);
        setBatches(data.batches || []);
      } else {
        setError(data.message || 'Failed to load grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(err.message || 'Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const gradeCategories = [
    { id: 'written', label: 'Written Test', weight: 0.2, editable: false },
    { id: 'oral', label: 'Oral Questioning', weight: 0.2, editable: true },
    { id: 'demonstration', label: 'Demonstration', weight: 0.4, editable: true },
    { id: 'observation', label: 'Observation', weight: 0.2, editable: true },
  ];

  const filteredStudents = students.filter(student => {
    const matchesProgram = selectedProgram === 'all' || student.program_id === parseInt(selectedProgram);
    const matchesBatch = selectedBatch === 'all' || student.batch_id === selectedBatch;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesBatch && matchesSearch;
  });

  const calculateFinalGrade = (grades) => {
    let total = 0;
    let hasAllGrades = true;
    
    gradeCategories.forEach(category => {
      const grade = grades[category.id];
      if (grade !== null && grade !== undefined) {
        total += grade * category.weight;
      } else {
        hasAllGrades = false;
      }
    });
    
    return hasAllGrades ? total.toFixed(2) : '-';
  };

  const getGradeColor = (grade) => {
    if (grade === '-' || grade === null || grade === undefined) return 'text-gray-400';
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'text-green-600';
    if (numGrade >= 85) return 'text-blue-600';
    if (numGrade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEditGrade = (studentId, category) => {
    const student = students.find(s => s.id === studentId);
    const currentGrade = student.grades[category];
    setEditingGrade({ studentId, category });
    setTempGrade(currentGrade !== null && currentGrade !== undefined ? currentGrade.toString() : '');
  };

  const handleSaveGrade = async () => {
    const grade = parseFloat(tempGrade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }
    
    try {
      setSaving(true);
      const token = sessionStorage.getItem('trainerToken');
      
      const response = await fetch('http://localhost:8000/api/trainer/grades/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: editingGrade.studentId,
          assessment_type: editingGrade.category,
          score: grade,
          assessment_title: `${gradeCategories.find(c => c.id === editingGrade.category)?.label || 'Assessment'}`,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setStudents(students.map(student => {
          if (student.id === editingGrade.studentId) {
            return {
              ...student,
              grades: {
                ...student.grades,
                [editingGrade.category]: grade
              }
            };
          }
          return student;
        }));
        
        setEditingGrade(null);
        setTempGrade('');
      } else {
        alert(data.message || 'Failed to update grade');
      }
    } catch (err) {
      console.error('Error updating grade:', err);
      alert('Failed to update grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <TrainerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-2">Student Grades</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <MdDownload className="h-5 w-5 mr-2" />
                Export Grades
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Program Filter */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading grades...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MdWarning className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Grades</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchGrades}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    {gradeCategories.map((category) => (
                      <th key={category.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {category.label}
                        <span className="block text-gray-400">
                          ({(category.weight * 100)}%)
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.student_id}</div>
                          <div className="text-xs text-gray-400">{student.program}</div>
                        </div>
                      </td>
                      {gradeCategories.map((category) => (
                        <td key={category.id} className="px-6 py-4 whitespace-nowrap">
                          {category.editable && editingGrade?.studentId === student.id && editingGrade?.category === category.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tempGrade}
                                onChange={(e) => setTempGrade(e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                disabled={saving}
                              />
                              <button
                                onClick={handleSaveGrade}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                disabled={saving}
                              >
                                <MdCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingGrade(null)}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                disabled={saving}
                              >
                                <MdClose className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getGradeColor(student.grades[category.id])}`}>
                                {student.grades[category.id] !== null && student.grades[category.id] !== undefined 
                                  ? student.grades[category.id] 
                                  : '-'}
                              </span>
                              {category.editable && (
                                <button
                                  onClick={() => handleEditGrade(student.id, category.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Edit grade"
                                >
                                  <MdEdit className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getGradeColor(calculateFinalGrade(student.grades))}`}>
                          {calculateFinalGrade(student.grades)}
                        </span>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={gradeCategories.length + 2} className="px-6 py-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerGrades;
