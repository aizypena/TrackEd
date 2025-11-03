import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSave,
  MdBackup,
} from 'react-icons/md';

const SystemSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Mock settings data
  const [settings, setSettings] = useState({
    backup: {
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      includeStudentData: true,
      includeAssessments: true,
      backupTime: '00:00',
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

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
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
                <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure your TESDA training management system</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  saveStatus === 'saving'
                    ? 'bg-gray-400'
                    : saveStatus === 'saved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <MdSave className="h-5 w-5 mr-2" />
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                  ? 'Saved!'
                  : 'Save Changes'}
              </button>
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
                    <h2 className="text-lg font-semibold text-gray-900">Backup Settings</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Configure automatic backup and data retention settings</p>
                </div>

                {/* Settings Content */}
                <div className="px-4 py-6 sm:p-6 lg:p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.backup.autoBackupEnabled}
                            onChange={(e) => handleInputChange('backup', 'autoBackupEnabled', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                          />
                          <span className="ml-3 text-base">Enable Automatic Backup</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                        <select
                          value={settings.backup.backupFrequency}
                          onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
                          className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                        <input
                          type="time"
                          value={settings.backup.backupTime}
                          onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
                          className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (Days)</label>
                        <input
                          type="number"
                          value={settings.backup.backupRetentionDays}
                          onChange={(e) => handleInputChange('backup', 'backupRetentionDays', parseInt(e.target.value))}
                          className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                        />
                      </div>
                      <div className="space-y-4">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
