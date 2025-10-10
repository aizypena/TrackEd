import React, { useState } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import {
  MdMenu,
  MdSave,
  MdSchool,
  MdEmail,
  MdSecurity,
  MdBackup,
  MdBuildCircle,
  MdPerson,
  MdLanguage,
  MdSchedule,
} from 'react-icons/md';

const SystemSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      instituteName: 'TESDA Training Center',
      address: 'Manila, Philippines',
      contactEmail: 'admin@tesda-training.edu.ph',
      contactPhone: '+63 912 345 6789',
      websiteUrl: 'https://tesda-training.edu.ph',
    },
    academic: {
      maxStudentsPerBatch: 30,
      defaultProgramDuration: '6 months',
      assessmentPassingRate: 75,
      attendanceRequired: 85,
      allowLateEnrollment: true,
      lateEnrollmentDays: 7,
    },
    security: {
      passwordExpiryDays: 90,
      maxLoginAttempts: 5,
      sessionTimeoutMinutes: 30,
      requireTwoFactor: true,
      allowMultipleSessions: false,
    },
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

  const tabIcons = {
    general: <MdBuildCircle className="h-5 w-5" />,
    academic: <MdSchool className="h-5 w-5" />,
    security: <MdSecurity className="h-5 w-5" />,
    backup: <MdBackup className="h-5 w-5" />,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.general.address}
                  onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={settings.general.contactPhone}
                  onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Students per Batch</label>
                <input
                  type="number"
                  value={settings.academic.maxStudentsPerBatch}
                  onChange={(e) => handleInputChange('academic', 'maxStudentsPerBatch', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Program Duration</label>
                <input
                  type="text"
                  value={settings.academic.defaultProgramDuration}
                  onChange={(e) => handleInputChange('academic', 'defaultProgramDuration', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Passing Rate (%)</label>
                <input
                  type="number"
                  value={settings.academic.assessmentPassingRate}
                  onChange={(e) => handleInputChange('academic', 'assessmentPassingRate', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Attendance (%)</label>
                <input
                  type="number"
                  value={settings.academic.attendanceRequired}
                  onChange={(e) => handleInputChange('academic', 'attendanceRequired', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allow Late Enrollment</label>
                <div className="mt-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.academic.allowLateEnrollment}
                      onChange={(e) => handleInputChange('academic', 'allowLateEnrollment', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                    />
                    <span className="ml-3 text-base">Enable late enrollment</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Late Enrollment Days</label>
                <input
                  type="number"
                  value={settings.academic.lateEnrollmentDays}
                  onChange={(e) => handleInputChange('academic', 'lateEnrollmentDays', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
          </div>
        );



      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (Days)</label>
                <input
                  type="number"
                  value={settings.security.passwordExpiryDays}
                  onChange={(e) => handleInputChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(e) => handleInputChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.requireTwoFactor}
                    onChange={(e) => handleInputChange('security', 'requireTwoFactor', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                  />
                  <span className="ml-3 text-base">Require Two-Factor Authentication</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.allowMultipleSessions}
                    onChange={(e) => handleInputChange('security', 'allowMultipleSessions', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
                  />
                  <span className="ml-3 text-base">Allow Multiple Sessions</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
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
        );

      default:
        return null;
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
                {/* Navigation Tabs */}
                <div className="px-4 sm:px-6 lg:px-8">
                  <nav className="-mb-px flex space-x-8">
                    {Object.entries(tabIcons).map(([key, icon]) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`${
                          activeTab === key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                      >
                        {icon}
                        <span className="capitalize">{key}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Settings Content */}
                <div className="px-4 py-6 sm:p-6 lg:p-8">{renderTabContent()}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
