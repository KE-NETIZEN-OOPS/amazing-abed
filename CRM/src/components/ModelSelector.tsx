import { useStore } from '../store/store';

export default function ModelSelector() {
  const models = useStore((state) => state.models);
  const selectedModelId = useStore((state) => state.selectedModelId);
  const setSelectedModel = useStore((state) => state.setSelectedModel);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Model</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedModelId === model.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedModel(model.id)}
          >
            <div className="flex items-center justify-between">
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
            </div>
          </div>
        ))}
      </div>
      {models.length === 0 && (
        <p className="text-gray-500 text-center py-4">No models available.</p>
      )}
    </div>
  );
}
