import { useState, useEffect } from 'react';
import type { TaskStatus } from '../types';

interface CalendarEventModalProps {
  event: any;
  onClose: () => void;
  onUpdate?: (updates: any) => void;
  onDelete?: () => void;
  onSave?: (eventData: any) => void;
  isNew?: boolean;
}

export default function CalendarEventModal({
  event,
  onClose,
  onUpdate,
  onDelete,
  onSave,
  isNew = false,
}: CalendarEventModalProps) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    notes: event.notes || '',
    status: (event.status || 'not_started') as TaskStatus,
    isBlocked: event.isBlocked || false,
    isOnline: event.isOnline !== undefined ? event.isOnline : false,
    start: event.start ? new Date(event.start).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    end: event.end ? new Date(event.end).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        notes: event.notes || '',
        status: (event.status || 'not_started') as TaskStatus,
        isBlocked: event.isBlocked || false,
        isOnline: event.isOnline !== undefined ? event.isOnline : false,
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew && onSave) {
      onSave({
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end),
      });
    } else if (onUpdate) {
      onUpdate({
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              {isNew ? 'Add Event' : 'Edit Event'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                <input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="not_started">Not Started (Red)</option>
                <option value="in_progress">In Progress (Yellow)</option>
                <option value="done">Done (Green)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={formData.isBlocked}
                  onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isBlocked" className="text-sm font-medium text-gray-700">
                  Block Time (Unavailable)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isOnline"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">
                  Online Status
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={6}
                placeholder="Add any additional notes or information..."
              />
            </div>

            {!isNew && event.createdBy && (
              <div className="text-sm text-gray-500 border-t pt-3">
                <p>Created by: {event.createdBy}</p>
                {event.updatedBy && event.updatedBy !== event.createdBy && (
                  <p>Last updated by: {event.updatedBy}</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {isNew ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Event
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Update
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDelete();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
