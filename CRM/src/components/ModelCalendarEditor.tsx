import { useState } from 'react';
import { useStore } from '../store/store';

interface ModelCalendarEditorProps {
  modelId: string;
}

export default function ModelCalendarEditor({ modelId }: ModelCalendarEditorProps) {
  const setAvailability = useStore((state) => state.setAvailability);
  const getModelAvailability = useStore((state) => state.getModelAvailability);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const availability = getModelAvailability(modelId, selectedDate);
  const isAvailable = availability?.isAvailable || false;

  const handleToggleAvailability = () => {
    if (isAvailable) {
      // Mark as unavailable
      setAvailability(modelId, selectedDate, false);
    } else {
      // Mark as available with times
      setAvailability(modelId, selectedDate, true, startTime, endTime);
    }
  };

  const handleUpdateTimes = () => {
    if (isAvailable) {
      setAvailability(modelId, selectedDate, true, startTime, endTime);
    }
  };

  // Generate next 30 days
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Your Availability</h2>
      <p className="text-sm text-gray-600 mb-6">
        Mark dates as available to allow chatters to book with you. Your availability is visible to all chatters.
      </p>

      {/* Date Selection and Time Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today.toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleToggleAvailability}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
          </button>
          {isAvailable && (
            <button
              onClick={handleUpdateTimes}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Update Times
            </button>
          )}
        </div>

        {isAvailable && availability && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Available on {new Date(selectedDate).toLocaleDateString()} from {availability.startTime} to {availability.endTime}
            </p>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Next 30 Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => {
            const dateAvailability = getModelAvailability(modelId, date);
            const isDateAvailable = dateAvailability?.isAvailable || false;
            const isSelected = date === selectedDate;
            const dateObj = new Date(date);
            const isToday = date === today.toISOString().split('T')[0];

            return (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  if (dateAvailability) {
                    setStartTime(dateAvailability.startTime || '09:00');
                    setEndTime(dateAvailability.endTime || '17:00');
                  }
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : isDateAvailable
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="text-xs mb-1">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg">{dateObj.getDate()}</div>
                {isDateAvailable && (
                  <div className="text-xs mt-1">✓</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
