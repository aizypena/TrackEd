import { useState } from 'react';
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
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [tempGrade, setTempGrade] = useState('');

  const programs = [
    { value: 'bartending-nc-ii', label: 'Bartending NC II' },
    { value: 'barista-training-nc-ii', label: 'Barista Training NC II' },
    { value: 'housekeeping-nc-ii', label: 'Housekeeping NC II' },
    { value: 'food-beverage-services-nc-ii', label: 'Food and Beverage Services NC II' },
    { value: 'bread-pastry-production-nc-ii', label: 'Bread and Pastry Production NC II' },
  ];

  const sections = [
    { value: 'morning-a', label: 'Morning A - 8:00 AM to 12:00 PM' },
    { value: 'morning-b', label: 'Morning B - 9:00 AM to 1:00 PM' },
    { value: 'afternoon-a', label: 'Afternoon A - 1:00 PM to 5:00 PM' },
    { value: 'afternoon-b', label: 'Afternoon B - 2:00 PM to 6:00 PM' },
  ];

  const gradeCategories = [
    { id: 'written', label: 'Written Works', weight: 0.3 },
    { id: 'performance', label: 'Performance Tasks', weight: 0.5 },
    { id: 'exam', label: 'Final Exam', weight: 0.2 },
  ];

  const students = [
    {
      id: 1,
      name: 'John Doe',
      studentId: 'STU-2025-001',
      program: 'bartending-nc-ii',
      section: 'morning-a',
      grades: {
        written: 88,
        performance: 92,
        exam: 90
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      studentId: 'STU-2025-002',
      program: 'barista-training-nc-ii',
      section: 'morning-b',
      grades: {
        written: 95,
        performance: 89,
        exam: 93
      }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      studentId: 'STU-2025-003',
      program: 'housekeeping-nc-ii',
      section: 'afternoon-a',
      grades: {
        written: 82,
        performance: 88,
        exam: 85
      }
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesSection && matchesSearch;
  });

  const calculateFinalGrade = (grades) => {
    return gradeCategories.reduce((total, category) => {
      return total + (grades[category.id] * category.weight);
    }, 0).toFixed(2);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 85) return 'text-blue-600';
    if (grade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEditGrade = (studentId, category) => {
    const student = students.find(s => s.id === studentId);
    setEditingGrade({ studentId, category });
    setTempGrade(student.grades[category].toString());
  };

  const handleSaveGrade = () => {
    const grade = parseFloat(tempGrade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }
    
    // Here you would typically update the backend
    console.log('Saving grade:', {
      studentId: editingGrade.studentId,
      category: editingGrade.category,
      grade: grade
    });
    
    setEditingGrade(null);
    setTempGrade('');
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
                    <option key={program.value} value={program.value}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
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
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.studentId}</div>
                          <div className="text-xs text-gray-400">
                            {programs.find(p => p.value === student.program)?.label}
                          </div>
                        </div>
                      </td>
                      {gradeCategories.map((category) => (
                        <td key={category.id} className="px-6 py-4 whitespace-nowrap">
                          {editingGrade?.studentId === student.id && editingGrade?.category === category.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tempGrade}
                                onChange={(e) => setTempGrade(e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                              />
                              <button
                                onClick={handleSaveGrade}
                                className="text-green-600 hover:text-green-800"
                              >
                                <MdCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingGrade(null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <MdClose className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getGradeColor(student.grades[category.id])}`}>
                                {student.grades[category.id]}
                              </span>
                              <button
                                onClick={() => handleEditGrade(student.id, category.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <MdEdit className="h-4 w-4" />
                              </button>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerGrades;
