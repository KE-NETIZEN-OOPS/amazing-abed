import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import ModelStatsModal from './ModelStatsModal';

export default function ChatterDashboard() {
  const navigate = useNavigate();
  const models = useStore((state) => state.models);
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  const getAvailableModelsForDate = useStore((state) => state.getAvailableModelsForDate);
  const getModelAvailability = useStore((state) => state.getModelAvailability);
  const createBooking = useStore((state) => state.createBooking);
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const [selectedModelForStats, setSelectedModelForStats] = useState<string | null>(null);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toISOString().split('T')[0];
  const [dateInput, setDateInput] = useState(today);

  const availableModels = selectedDate ? (getAvailableModelsForDate(selectedDate) || []) : [];

  const handleDateSelect = () => {
    setSelectedDate(dateInput);
  };

  const handleConfirmBooking = (modelId: string) => {
    if (!currentUser || !selectedDate) return;
    
    // Default time to current hour or 9 AM
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:00`;
    
    createBooking(modelId, currentUser.id, selectedDate, time);
    alert(`Booking confirmed with ${models.find(m => m.id === modelId)?.username}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Chatter Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{currentUser?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a date to see available models
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleDateSelect}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              View Availability
            </button>
          </div>
        </div>

        {/* Available Models */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Available Models for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
              </h2>
              <span className="text-sm text-gray-600">
                {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
              </span>
            </div>

            {availableModels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No models available on this date</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableModels.map((model) => {
                  const availability = selectedDate ? getModelAvailability(model.id, selectedDate) : null;
                  return (
                    <div
                      key={model.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{model.username}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                model.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                            <span className="text-sm text-gray-600">
                              {model.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {availability && (
                        <div className="mb-3 text-sm text-gray-600">
                          {availability.startTime && availability.endTime && (
                            <p>
                              Available: {availability.startTime} - {availability.endTime}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmBooking(model.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✓ Confirm Booking
                        </button>
                        <button
                          onClick={() => setSelectedModelForStats(model.id)}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                          Stats
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* All Models List */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{model.username}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          model.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {model.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedModelForStats(model.id)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                  >
                    View Stats
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedModelForStats && (
          <ModelStatsModal
            modelId={selectedModelForStats}
            onClose={() => setSelectedModelForStats(null)}
          />
        )}
      </div>
    </div>
  );
}
