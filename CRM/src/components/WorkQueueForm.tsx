import { useState } from 'react';
import { useStore } from '../store/store';
import type { TaskStatus } from '../types';

interface WorkQueueFormProps {
  modelId: string;
  date: string;
  onClose: () => void;
  itemId?: string;
}

export default function WorkQueueForm({ modelId, date, onClose, itemId }: WorkQueueFormProps) {
  const workQueueItems = useStore((state) => state.workQueueItems);
  const addWorkQueueItem = useStore((state) => state.addWorkQueueItem);
  const updateWorkQueueItem = useStore((state) => state.updateWorkQueueItem);

  const existingItem = itemId ? workQueueItems.find((i) => i.id === itemId) : null;

  const [formData, setFormData] = useState({
    title: existingItem?.title || '',
    description: existingItem?.description || '',
    status: (existingItem?.status || 'not_started') as TaskStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingItem) {
      updateWorkQueueItem(itemId!, formData);
    } else {
      addWorkQueueItem({
        modelId,
        date,
        ...formData,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Custom video for customer"
          required
        />
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={4}
          placeholder="Add any details or instructions..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {existingItem ? 'Update' : 'Add'} Task
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
