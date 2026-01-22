import { useStore } from '../store/store';

interface EarningsDisplayProps {
  modelId: string;
}

export default function EarningsDisplay({ modelId }: EarningsDisplayProps) {
  const getModelTotalEarnings = useStore((state) => state.getModelTotalEarnings);
  const models = useStore((state) => state.models);
  const model = models.find((m) => m.id === modelId);

  const totalEarnings = getModelTotalEarnings(modelId);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-indigo-100 text-sm font-medium">Total Earnings</p>
          <p className="text-4xl font-bold mt-1">${totalEarnings.toFixed(2)}</p>
          <p className="text-indigo-100 text-sm mt-2">for {model?.username}</p>
        </div>
        <div className="text-6xl">💰</div>
      </div>
    </div>
  );
}
