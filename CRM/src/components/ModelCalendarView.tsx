import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store';
import CalendarSection from './CalendarSection';

export default function ModelCalendarView() {
  const { modelId } = useParams<{ modelId: string }>();
  const models = useStore((state) => state.models);
  const model = models.find((m) => m.id === modelId);

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Model not found</p>
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{model.username}'s Public Calendar</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${model.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">{model.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CalendarSection modelId={modelId!} />
      </div>
    </div>
  );
}
