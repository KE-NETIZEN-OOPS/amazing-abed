import { useStore } from '../store/store';

interface ModelStatsModalProps {
  modelId: string;
  onClose: () => void;
}

export default function ModelStatsModal({ modelId, onClose }: ModelStatsModalProps) {
  const getModelStats = useStore((state) => state.getModelStats);
  const models = useStore((state) => state.models);
  
  const model = models.find((m) => m.id === modelId);
  const stats = getModelStats(modelId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {model?.username}'s Statistics
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-blue-800 mt-1">{stats.totalBookings}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-green-800 mt-1">${stats.totalEarnings.toFixed(2)}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-purple-800 mt-1">{stats.completedBookings}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-800 mt-1">{stats.pendingBookings}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 font-medium">Average Booking Value</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">${stats.averageBookingValue.toFixed(2)}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
