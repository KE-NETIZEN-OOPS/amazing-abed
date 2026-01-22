import { useStore } from '../store/store';

interface ModelStatsProps {
  modelId: string;
}

export default function ModelStats({ modelId }: ModelStatsProps) {
  const getModelStats = useStore((state) => state.getModelStats);
  const getModelBookings = useStore((state) => state.getModelBookings);
  const models = useStore((state) => state.models);
  
  const model = models.find((m) => m.id === modelId);
  const stats = getModelStats(modelId);
  const bookings = getModelBookings(modelId);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {model?.username}'s Statistics & Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{stats.totalBookings}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Total Earnings</p>
          <p className="text-3xl font-bold text-green-800 mt-1">${stats.totalEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Completed</p>
          <p className="text-3xl font-bold text-purple-800 mt-1">{stats.completedBookings}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-800 mt-1">{stats.pendingBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Average Booking Value</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">${stats.averageBookingValue.toFixed(2)}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.totalBookings > 0
              ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Bookings</h3>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                  </p>
                  <p className="text-sm text-gray-600">Status: {booking.status}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    booking.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
