import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import IssueVoucher from '../../components/admin/IssueVoucher';
import { voucherAPI } from '../../services/voucherAPI';
import toast from 'react-hot-toast';
import {
  MdMenu,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdClose,
  MdPrint,
  MdFileDownload,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdHourglassEmpty,
  MdLocalOffer,
  MdPerson,
  MdSchool,
  MdDateRange,
  MdAttachMoney,
} from 'react-icons/md';

const VoucherManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // Fetch vouchers on component mount
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getAll();
      if (response.success) {
        setVouchers(response.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for programs
  const programs = [
    { id: 'bartending-nc-ii', name: 'Bartending NC II', cost: 15000 },
    { id: 'barista-training-nc-ii', name: 'Barista Training NC II', cost: 12000 },
    { id: 'housekeeping-nc-ii', name: 'Housekeeping NC II', cost: 10000 },
    { id: 'food-beverage-nc-ii', name: 'Food and Beverage Services NC II', cost: 13500 },
    { id: 'bread-pastry-nc-ii', name: 'Bread and Pastry Production NC II', cost: 11000 },
    { id: 'events-management-nc-iii', name: 'Events Management NC III', cost: 18000 },
    { id: 'chefs-catering-nc-ii', name: "Chef's Catering Services NC II", cost: 16000 },
    { id: 'cookery-nc-ii', name: 'Cookery NC II', cost: 14000 }
  ];

  const handleAddVoucher = () => {
    setShowAddModal(true);
    setEditingVoucher(null);
  };

  const handleEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setShowAddModal(true);
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!window.confirm('Are you sure you want to delete this voucher?')) {
      return;
    }
    
    try {
      const response = await voucherAPI.delete(voucherId);
      if (response.success) {
        toast.success('Voucher deleted successfully');
        fetchVouchers();
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Failed to delete voucher');
    }
  };

  const handleBulkAction = (action) => {
    // Implement bulk actions (print, export, etc.)
    console.log('Bulk action:', action, 'for vouchers:', selectedVouchers);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MdLocalOffer className="h-4 w-4 mr-1" />;
      case 'used':
        return <MdCheckCircle className="h-4 w-4 mr-1" />;
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
                <h1 className="text-2xl font-semibold text-gray-900">Voucher Management</h1>
                <p className="text-sm text-gray-500">Issue and manage training vouchers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkAction('print')}
                className="inline-flex items-center hover:cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={selectedVouchers.length === 0}
              >
                <MdPrint className="h-5 w-5 mr-2" />
                Print Selected
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="inline-flex hover:cursor-pointer items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MdFileDownload className="h-5 w-5 mr-2" />
                Export
              </button>
              <button
                onClick={handleAddVoucher}
                className="inline-flex items-center hover:cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MdAdd className="h-5 w-5 mr-2" />
                Issue Voucher
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 min-w-0 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search vouchers..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Programs</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                </select>
                <button
                  onClick={() => setLoading(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <MdRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vouchers</p>
                  <p className="text-2xl font-semibold text-gray-900">150</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdLocalOffer className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Vouchers</p>
                  <p className="text-2xl font-semibold text-gray-900">85</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">43 expire this month</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Used Vouchers</p>
                  <p className="text-2xl font-semibold text-gray-900">45</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <MdCheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Out of 180 total</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <MdAccessTime className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Requires attention</p>
            </div>
          </div>

          {/* Vouchers List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVouchers(vouchers.map(v => v.id));
                          } else {
                            setSelectedVouchers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedVouchers.includes(voucher.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVouchers([...selectedVouchers, voucher.id]);
                            } else {
                              setSelectedVouchers(selectedVouchers.filter(id => id !== voucher.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{voucher.voucher_id}</div>
                          <div className="text-sm text-gray-500">
                            Issued: {new Date(voucher.issue_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Batch {voucher.batch_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                          {getStatusIcon(voucher.status)}
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{voucher.used_count}</span>
                          <span className="text-gray-500"> / {voucher.quantity}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {voucher.quantity - voucher.used_count} remaining
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEditVoucher(voucher)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(voucher.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Voucher Modal */}
      <IssueVoucher
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingVoucher(null);
        }}
        voucher={editingVoucher}
        programs={programs}
        onSuccess={() => {
          fetchVouchers();
        }}
      />
    </div>
  );
};

export default VoucherManagement;
