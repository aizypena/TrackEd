import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import {
  MdMenu,
  MdBackup,
  MdCloudDownload,
  MdHistory,
  MdCheckCircle,
} from 'react-icons/md';

const SystemSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [lastBackup, setLastBackup] = useState('2025-11-02 23:45:00');

  // Mock settings data
  const [settings, setSettings] = useState({
    backup: {
      includeStudentData: true,
      includeAssessments: true,
    },
  });

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleManualBackup = async () => {
    setBackupStatus('backing-up');
    toast.loading('Creating backup...', { id: 'backup' });
    
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update last backup time
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      setLastBackup(formattedDate);
      
      setBackupStatus('completed');
      toast.success('Backup completed successfully!', { id: 'backup' });
      
      // Download backup file (simulated)
      const backupData = {
        timestamp: formattedDate,
        includeStudentData: settings.backup.includeStudentData,
        includeAssessments: settings.backup.includeAssessments,
        database: 'tracked_db',
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${now.getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => setBackupStatus(''), 2000);
    } catch (error) {
      setBackupStatus('failed');
      toast.error('Backup failed. Please try again.', { id: 'backup' });
      setTimeout(() => setBackupStatus(''), 2000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Database Backup</h1>
                <p className="text-sm text-gray-500">Create and download manual database backups</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center space-x-2">
                    <MdBackup className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Manual Backup</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Create an instant backup and download it to your computer</p>
                </div>

                {/* Settings Content */}
                <div className="px-4 py-6 sm:p-6 lg:p-8">
                  {/* Manual Backup Section */}
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MdCloudDownload className="h-6 w-6 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Create Database Backup</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Create an instant backup of your database. The backup file will be downloaded to your computer.
                        </p>
                        {lastBackup && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <MdHistory className="h-4 w-4" />
                            <span>Last backup: {lastBackup}</span>
                          </div>
                        )}
                        
                        {/* Backup Options */}
                        <div className="mb-6 space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-3">Backup Options:</p>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.backup.includeStudentData}
                              onChange={(e) => handleInputChange('backup', 'includeStudentData', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                            />
                            <span className="ml-3 text-base">Include Student Data</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.backup.includeAssessments}
                              onChange={(e) => handleInputChange('backup', 'includeAssessments', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                            />
                            <span className="ml-3 text-base">Include Assessments</span>
                          </label>
                        </div>

                        <button
                          onClick={handleManualBackup}
                          disabled={backupStatus === 'backing-up'}
                          className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                            backupStatus === 'backing-up'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : backupStatus === 'completed'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                        >
                          {backupStatus === 'backing-up' ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating Backup...
                            </>
                          ) : backupStatus === 'completed' ? (
                            <>
                              <MdCheckCircle className="h-5 w-5 mr-2" />
                              Backup Completed!
                            </>
                          ) : (
                            <>
                              <MdBackup className="h-5 w-5 mr-2" />
                              Create Backup Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default SystemSettings;
