import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import ModelStats from './ModelStats';
import ModelCalendarEditor from './ModelCalendarEditor';
import CustomerRequests from './CustomerRequests';

export default function ModelDashboard() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const models = useStore((state) => state.models);
  const currentModel = models.find((m) => m.id === currentUser?.id);
  const toggleModelOnlineStatus = useStore((state) => state.toggleModelOnlineStatus);
  const logout = useStore((state) => state.logout);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentModel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Model profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentModel.username}'s Dashboard</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${currentModel.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {currentModel.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleModelOnlineStatus(currentModel.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentModel.isOnline
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {currentModel.isOnline ? 'Go Offline' : 'Go Online'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Section */}
        <div className="mb-6">
          <ModelStats modelId={currentModel.id} />
        </div>

        {/* Customer Requests */}
        <div className="mb-6">
          <CustomerRequests modelId={currentModel.id} />
        </div>

        {/* Calendar Editor */}
        <div>
          <ModelCalendarEditor modelId={currentModel.id} />
        </div>
      </div>
    </div>
  );
}
