import { useState } from 'react';
import { useStore } from '../store/store';

interface CustomerRequestsProps {
  modelId: string;
}

export default function CustomerRequests({ modelId }: CustomerRequestsProps) {
  const getModelBookings = useStore((state) => state.getModelBookings);
  const confirmBooking = useStore((state) => state.confirmBooking);
  const cancelBooking = useStore((state) => state.cancelBooking);
  const completeBooking = useStore((state) => state.completeBooking);
  
  const bookings = getModelBookings(modelId);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleConfirm = (bookingId: string) => {
    if (confirm('Confirm this booking?')) {
      confirmBooking(bookingId);
    }
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('Cancel this booking?')) {
      cancelBooking(bookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Customer Requests</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmed ({counts.confirmed})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filter === 'all' ? 'No customer requests yet' : `No ${filter} requests`}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === 'all' && 'When chatters book with you, their requests will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings
            .sort((a, b) => {
              // Sort by date and time, newest first
              const dateA = new Date(`${a.date}T${a.time}`);
              const dateB = new Date(`${b.date}T${b.time}`);
              return dateB.getTime() - dateA.getTime();
            })
            .map((booking) => (
              <div
                key={booking.id}
                className={`border-2 rounded-lg p-4 ${getStatusColor(booking.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Booking Request
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-900'
                            : booking.status === 'confirmed'
                            ? 'bg-blue-200 text-blue-900'
                            : booking.status === 'completed'
                            ? 'bg-green-200 text-green-900'
                            : 'bg-red-200 text-red-900'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {booking.time}
                      </p>
                      <p className="text-xs opacity-75 mt-2">
                        Requested on:{' '}
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                      {booking.confirmedAt && (
                        <p className="text-xs opacity-75">
                          Confirmed on:{' '}
                          {new Date(booking.confirmedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          if (confirm('Mark this booking as completed?')) {
                            completeBooking(booking.id);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
