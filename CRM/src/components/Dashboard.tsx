import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import ModelSelector from './ModelSelector';
import CustomerSection from './CustomerSection';
import SpendingRecordSection from './SpendingRecordSection';
import CalendarSection from './CalendarSection';
import WorkQueueSection from './WorkQueueSection';
import EarningsDisplay from './EarningsDisplay';

export default function Dashboard() {
  const selectedModelId = useStore((state) => state.selectedModelId);
  const models = useStore((state) => state.models);
  const currentUser = useStore((state) => state.currentUser);
  const [showPublicCalendar, setShowPublicCalendar] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{currentUser?.username}</span>
                <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                  {currentUser?.role}
                </span>
              </span>
              {currentUser?.role === 'model' && selectedModelId && (
                <Link
                  to={`/model/${selectedModelId}/calendar`}
                  target="_blank"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  View Public Calendar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ModelSelector />

        {selectedModelId && selectedModel && (
          <>
            <EarningsDisplay modelId={selectedModelId} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <CustomerSection modelId={selectedModelId} />
              <SpendingRecordSection modelId={selectedModelId} />
            </div>

            <div className="mt-6">
              <CalendarSection modelId={selectedModelId} />
            </div>

            <div className="mt-6">
              <WorkQueueSection modelId={selectedModelId} />
            </div>
          </>
        )}

        {!selectedModelId && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">Please select a model to view their dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
}
