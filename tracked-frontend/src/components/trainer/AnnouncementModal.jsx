import { MdClose, MdSave, MdCancel } from 'react-icons/md';

const AnnouncementModal = ({
  showModal,
  editingAnnouncement,
  formData,
  setFormData,
  batches,
  onClose,
  onSubmit
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
        <div className="bg-tracked-primary p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:cursor-pointer rounded-full p-2"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Target Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_type"
                    value="all"
                    checked={formData.target_type === 'all'}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value, batch_ids: [] })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">All Students</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_type"
                    value="specific"
                    checked={formData.target_type === 'specific'}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Specific Batches</span>
                </label>
              </div>
            </div>

            {/* Batch Selection (shown only when 'specific' is selected) */}
            {formData.target_type === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batches <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                  {batches.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No batches available (Loading...)</p>
                  ) : (
                    batches.map((batch) => (
                      <label key={batch.id} className="flex items-center hover:bg-gray-100 p-2 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.batch_ids.includes(batch.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, batch_ids: [...formData.batch_ids, batch.id] });
                            } else {
                              setFormData({ ...formData, batch_ids: formData.batch_ids.filter(id => id !== batch.id) });
                            }
                          }}
                          className="w-4 h-4 text-tracked-primary border-gray-300 rounded focus:ring-tracked-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {batch.batch_name}
                          {batch.program_name && <span className="text-gray-500 text-xs ml-1">({batch.program_name})</span>}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {formData.batch_ids.length > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    {formData.batch_ids.length} batch{formData.batch_ids.length > 1 ? 'es' : ''} selected
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-tracked-primary focus:border-tracked-primary"
                placeholder="Enter announcement content"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center hover:cursor-pointer gap-2 px-6 py-2 bg-tracked-primary text-white rounded-md hover:bg-tracked-secondary transition-colors"
            >
              <MdSave className="h-5 w-5" />
              {editingAnnouncement ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center hover:cursor-pointer gap-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <MdCancel className="h-5 w-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
