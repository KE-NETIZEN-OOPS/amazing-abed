import { useState } from 'react';
import { useStore } from '../store/store';
import type { TaskStatus } from '../types';
import WorkQueueForm from './WorkQueueForm';

interface WorkQueueSectionProps {
  modelId: string;
}

export default function WorkQueueSection({ modelId }: WorkQueueSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const workQueueItems = useStore((state) => state.workQueueItems);
  const updateWorkQueueItem = useStore((state) => state.updateWorkQueueItem);
  const deleteWorkQueueItem = useStore((state) => state.deleteWorkQueueItem);

  const modelItems = workQueueItems
    .filter((item) => item.modelId === modelId)
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusColors = {
    not_started: 'bg-red-100 text-red-800 border-red-300',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    done: 'bg-green-100 text-green-800 border-green-300',
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    updateWorkQueueItem(id, { status: newStatus });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Work Queue</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4">
          <WorkQueueForm
            modelId={modelId}
            date={selectedDate}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {modelItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks for {new Date(selectedDate).toLocaleDateString()}. Add a task to get started!
          </p>
        ) : (
          modelItems.map((item) => (
            <div
              key={item.id}
              className={`border-2 rounded-lg p-4 ${statusColors[item.status]}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm mb-2 bg-white bg-opacity-50 p-2 rounded">
                      {item.description}
                    </p>
                  )}
                  <div className="text-xs opacity-75 mt-2">
                    <p>Created by: {item.createdBy}</p>
                    {item.updatedBy !== item.createdBy && (
                      <p>Last updated by: {item.updatedBy}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as TaskStatus)}
                    className={`px-3 py-1 rounded text-sm font-medium border-2 ${
                      statusColors[item.status]
                    }`}
                  >
                    <option value="not_started">Not Started (Red)</option>
                    <option value="in_progress">In Progress (Yellow)</option>
                    <option value="done">Done (Green)</option>
                  </select>
                  <button
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        deleteWorkQueueItem(item.id);
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
