import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import toast from 'react-hot-toast';

const TrainerAssessments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assessmentRecords, setAssessmentRecords] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    program_id: '',
    batch_id: '',
    assessment_date: '',
    tesda_assessor: '',
    result: 'competent',
    remarks: ''
  });
  const [students, setStudents] = useState([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const competencyStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'competent', label: 'Competent' },
    { value: 'not_competent', label: 'Not Competent' },
  ];

  useEffect(() => {
    fetchAssessmentRecords();
    fetchPrograms();
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchAssessmentRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('https://api.smitracked.cloud/api/trainer/tesda-assessments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAssessmentRecords(data.data || []);
      } else {
        setError(data.message || 'Failed to load TESDA assessment records');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assessment records:', err);
      setError(err.message || 'Failed to load assessment records. Please try again.');
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('https://api.smitracked.cloud/api/trainer/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPrograms(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch('https://api.smitracked.cloud/api/trainer/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setBatches(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('trainerToken');
      
      const response = await fetch('https://api.smitracked.cloud/api/trainer/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data || []);
      } else {
        toast.error('Failed to load students: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Error loading students. Please check your connection.');
    }
  };

  const handleStudentSelect = (student) => {
    setFormData({
      ...formData,
      student_id: student.student_id,
      student_name: student.first_name + ' ' + student.last_name,
      program_id: student.program_id || '',
      batch_id: student.batch_id || ''
    });
    setStudentSearchQuery(student.student_id);
    setShowStudentDropdown(false);
  };

  const filteredStudents = students.filter(student => 
    student.student_id?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (student.first_name + ' ' + student.last_name).toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData({
      student_id: '',
      student_name: '',
      program_id: '',
      batch_id: '',
      assessment_date: '',
      tesda_assessor: '',
      result: 'competent',
      remarks: ''
    });
    setStudentSearchQuery('');
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id || '',
      student_name: record.student_name || '',
      program_id: record.program_id || '',
      batch_id: record.batch_id || '',
      assessment_date: record.assessment_date || '',
      tesda_assessor: record.tesda_assessor || '',
      result: record.result || 'competent',
      remarks: record.remarks || ''
    });
    setStudentSearchQuery(record.student_id || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('trainerToken');
      const url = editingRecord 
        ? `https://api.smitracked.cloud/api/trainer/tesda-assessments/${editingRecord.id}`
        : 'https://api.smitracked.cloud/api/trainer/tesda-assessments';
      
      const response = await fetch(url, {
        method: editingRecord ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingRecord ? 'Assessment record updated successfully' : 'Assessment record added successfully');
        setShowModal(false);
        fetchAssessmentRecords();
      } else {
        toast.error(data.message || 'Failed to save assessment record');
      }
    } catch (err) {
      console.error('Error saving assessment record:', err);
      toast.error('Failed to save assessment record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('trainerToken');
      const response = await fetch(`https://api.smitracked.cloud/api/trainer/tesda-assessments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Assessment record deleted successfully');
        fetchAssessmentRecords();
      } else {
        toast.error(data.message || 'Failed to delete assessment record');
      }
    } catch (err) {
      console.error('Error deleting assessment record:', err);
      toast.error('Failed to delete assessment record');
    }
  };

  const filteredRecords = assessmentRecords.filter(record => {
    const matchesProgram = selectedProgram === 'all' || record.program_id === parseInt(selectedProgram);
    const matchesBatch = selectedBatch === 'all' || record.batch_id === parseInt(selectedBatch);
    const matchesStatus = selectedStatus === 'all' || record.result === selectedStatus;
    const matchesSearch = record.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student_id?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProgram && matchesBatch && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (result) => {
    switch (result) {
      case 'competent':
        return 'bg-green-100 text-green-800';
      case 'not_competent':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (result) => {
    switch (result) {
      case 'competent':
        return 'Competent';
      case 'not_competent':
        return 'Not Competent';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const calculateStats = () => {
    const total = assessmentRecords.length;
    const competent = assessmentRecords.filter(r => r.result === 'competent').length;
    const notCompetent = assessmentRecords.filter(r => r.result === 'not_competent').length;
    const pending = assessmentRecords.filter(r => r.result === 'pending').length;
    const competencyRate = total > 0 ? ((competent / total) * 100).toFixed(1) : 0;

    return { total, competent, notCompetent, pending, competencyRate };
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
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
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TESDA Assessment Records</h1>
              <p className="text-sm text-gray-600 mt-1">Manage competency assessment results</p>
            </div>
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Assessment
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Program Filter */}
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white"
              >
                <option value="all">All Programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>

              {/* Batch Filter */}
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_id}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white"
              >
                {competencyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search students..."
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Competent</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.competent}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Not Competent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.notCompetent}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Competency Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.competencyRate}%</p>
            </div>
          </div>

          {/* Content */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading TESDA assessment records...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800">Error Loading Assessment Records</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchAssessmentRecords}
                className="mt-3 px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{record.student_name}</h3>
                            <p className="text-sm text-gray-500">ID: {record.student_id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.result)}`}>
                            {getStatusLabel(record.result)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Program / Batch</p>
                            <p className="text-sm font-medium text-gray-900">
                              {programs.find(p => p.id === record.program_id)?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {batches.find(b => b.id === record.batch_id)?.batch_id || 'N/A'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Assessment Date</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(record.assessment_date)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">TESDA Assessor</p>
                            <p className="text-sm font-medium text-gray-900">{record.tesda_assessor || 'N/A'}</p>
                          </div>
                        </div>

                        {record.remarks && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-1">Remarks:</p>
                            <p className="text-sm text-gray-600">{record.remarks}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(record)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Records Found</h3>
                <p className="text-gray-500 mb-4">
                  Start by adding TESDA competency assessment results for your students.
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add First Record
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? 'Edit Assessment Record' : 'Add New Assessment Record'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Student * {students.length > 0 ? <span className="text-xs text-green-600">({students.length} students available)</span> : <span className="text-xs text-red-600">(No students loaded - <button type="button" onClick={fetchStudents} className="underline">Click to retry</button>)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        setShowStudentDropdown(true);
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                      placeholder={students.length === 0 ? "No students available - check console for errors" : "Type student ID or name..."}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showStudentDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {students.length === 0 ? (
                          <div className="px-4 py-3 text-center">
                            <p className="text-sm text-gray-500">Loading students...</p>
                            <p className="text-xs text-gray-400 mt-1">Check console (F12) for errors</p>
                          </div>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => handleStudentSelect(student)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {student.first_name} {student.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    {programs.find(p => p.id === student.program_id)?.name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {batches.find(b => b.id === student.batch_id)?.batch_id || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500">
                            <p>No students match "{studentSearchQuery}"</p>
                            <p className="text-xs text-gray-400 mt-1">Total available: {students.length}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program *
                  </label>
                  <input
                    type="text"
                    required
                    value={programs.find(p => p.id === formData.program_id)?.name || ''}
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={batches.find(b => b.id === formData.batch_id)?.batch_id || ''}
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.assessment_date}
                    onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TESDA Assessor
                  </label>
                  <input
                    type="text"
                    value={formData.tesda_assessor}
                    onChange={(e) => setFormData({...formData, tesda_assessor: e.target.value})}
                    placeholder="Assessor name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Result *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="competent"
                        checked={formData.result === 'competent'}
                        onChange={(e) => setFormData({...formData, result: e.target.value})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Competent
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="not_competent"
                        checked={formData.result === 'not_competent'}
                        onChange={(e) => setFormData({...formData, result: e.target.value})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Not Competent
                      </span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows="3"
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    placeholder="Additional notes or comments..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerAssessments;
