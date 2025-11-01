import { useState, useEffect } from 'react';
import TrainerSidebar from '../../layouts/trainer/TrainerSidebar';
import AnnouncementModal from '../../components/trainer/AnnouncementModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getTrainerToken } from '../../utils/trainerAuth';
import toast from 'react-hot-toast';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMenu,
  MdCampaign,
  MdPeople,
  MdGroup,
  MdArchive,
  MdUnarchive
} from 'react-icons/md';

const TrainerAnnouncements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete' or 'archive'
    announcementId: null,
    isArchived: false
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_type: 'all', // 'all' or 'specific'
    batch_ids: []
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchBatches();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = getTrainerToken();
      const response = await fetch('http://localhost:8000/api/trainer/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        toast.error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = getTrainerToken();
      const response = await fetch('http://localhost:8000/api/trainer/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map batches with both id and batch_id
        const batchesData = (data.data || []).map(batch => ({
          id: batch.id,
          batch_name: batch.batch_id || 'Unknown Batch',
          program_name: batch.program_name
        }));
        setBatches(batchesData);
      } else {
        console.error('Failed to fetch batches:', response.status);
        toast.error('Failed to load batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    }
  };

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        target_type: announcement.target_type || 'all',
        batch_ids: announcement.batches ? announcement.batches.map(b => b.id) : []
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        target_type: 'all',
        batch_ids: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_type: 'all',
      batch_ids: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.target_type === 'specific' && formData.batch_ids.length === 0) {
      toast.error('Please select at least one batch');
      return;
    }

    try {
      const token = getTrainerToken();
      const url = editingAnnouncement
        ? `http://localhost:8000/api/trainer/announcements/${editingAnnouncement.id}`
        : 'http://localhost:8000/api/trainer/announcements';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(editingAnnouncement ? 'Announcement updated successfully' : 'Announcement created successfully');
        handleCloseModal();
        fetchAnnouncements();
      } else {
        toast.error(responseData.message || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Error saving announcement');
    }
  };

  const handleDelete = async (password) => {
    const { announcementId } = confirmModal;

    try {
      const token = getTrainerToken();
      
      // First verify password
      const verifyResponse = await fetch('http://localhost:8000/api/trainer/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        toast.error(verifyData.message || 'Incorrect password');
        return;
      }

      // If password is correct, proceed with deletion
      const response = await fetch(`http://localhost:8000/api/trainer/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully');
        setConfirmModal({ isOpen: false, type: null, announcementId: null, isArchived: false });
        fetchAnnouncements();
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement');
    }
  };

  const handleArchive = async () => {
    const { announcementId, isArchived } = confirmModal;

    try {
      const token = getTrainerToken();
      const response = await fetch(`http://localhost:8000/api/trainer/announcements/${announcementId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ is_archived: isArchived })
      });

      if (response.ok) {
        toast.success(isArchived ? 'Announcement hidden from students' : 'Announcement visible to students');
        setConfirmModal({ isOpen: false, type: null, announcementId: null, isArchived: false });
        fetchAnnouncements();
      } else {
        toast.error('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error archiving announcement:', error);
      toast.error('Error updating announcement');
    }
  };

  const openDeleteModal = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      announcementId: id,
      isArchived: false
    });
  };

  const openArchiveModal = (id, isArchived) => {
    setConfirmModal({
      isOpen: true,
      type: 'archive',
      announcementId: id,
      isArchived: isArchived
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      announcementId: null,
      isArchived: false
    });
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return badges[priority] || badges.normal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TrainerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100"
              >
                <MdMenu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
                <p className="text-sm text-gray-600">Create and manage announcements for your students</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              <span className="hidden sm:inline">New Announcement</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-6 max-w-[1600px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tracked-primary"></div>
              <span className="ml-3 text-gray-600">Loading announcements...</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MdCampaign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Announcements Yet</h2>
              <p className="text-gray-600 mb-4">Create your first announcement to communicate with your students</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex hover:cursor-pointer items-center gap-2 px-6 py-3 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
              >
                <MdAdd className="h-5 w-5" />
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${announcement.is_archived ? 'opacity-60 border-2 border-gray-300' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </span>
                        {announcement.is_archived && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posted: {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {announcement.updated_at !== announcement.created_at && (
                          <span>Updated: {new Date(announcement.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                      {/* Target Display */}
                      <div className="mt-2">
                        {announcement.target_type === 'all' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            <MdPeople className="h-4 w-4" />
                            All Students
                          </span>
                        ) : announcement.batches && announcement.batches.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {announcement.batches.map((batch) => (
                              <span key={batch.id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                <MdGroup className="h-4 w-4" />
                                {batch.batch_name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openArchiveModal(announcement.id, !announcement.is_archived)}
                        className={`p-2 ${announcement.is_archived ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} rounded-md transition-colors`}
                        title={announcement.is_archived ? 'Show to students' : 'Hide from students'}
                      >
                        {announcement.is_archived ? <MdUnarchive className="h-5 w-5" /> : <MdArchive className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnnouncementModal
        showModal={showModal}
        editingAnnouncement={editingAnnouncement}
        formData={formData}
        setFormData={setFormData}
        batches={batches}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.type === 'delete' ? handleDelete : handleArchive}
        title={confirmModal.type === 'delete' ? 'Delete Announcement' : (confirmModal.isArchived ? 'Hide Announcement' : 'Show Announcement')}
        message={
          confirmModal.type === 'delete'
            ? 'Are you sure you want to permanently delete this announcement? This action cannot be undone.'
            : confirmModal.isArchived
            ? 'Are you sure you want to hide this announcement from students? You can restore it later.'
            : 'Are you sure you want to show this announcement to students?'
        }
        confirmText={confirmModal.type === 'delete' ? 'Delete' : (confirmModal.isArchived ? 'Hide' : 'Show')}
        cancelText="Cancel"
        requirePassword={confirmModal.type === 'delete'}
        confirmButtonClass={
          confirmModal.type === 'delete'
            ? 'bg-red-600 hover:bg-red-700'
            : confirmModal.isArchived
            ? 'bg-orange-600 hover:bg-orange-700'
            : 'bg-green-600 hover:bg-green-700'
        }
      />
    </div>
  );
};

export default TrainerAnnouncements;
