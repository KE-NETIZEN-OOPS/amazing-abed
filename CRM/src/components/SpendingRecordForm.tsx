import { useState } from 'react';
import { useStore } from '../store/store';

interface SpendingRecordFormProps {
  customerId: string;
  onClose: () => void;
  recordId?: string;
}

export default function SpendingRecordForm({ customerId, onClose, recordId }: SpendingRecordFormProps) {
  const spendingRecords = useStore((state) => state.spendingRecords);
  const addSpendingRecord = useStore((state) => state.addSpendingRecord);
  const updateSpendingRecord = useStore((state) => state.updateSpendingRecord);

  const existingRecord = recordId ? spendingRecords.find((r) => r.id === recordId) : null;

  const [formData, setFormData] = useState({
    amount: existingRecord?.amount || 0,
    service: existingRecord?.service || '',
    date: existingRecord?.date || new Date().toISOString().split('T')[0],
    time: existingRecord?.time || new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingRecord) {
      updateSpendingRecord(recordId!, formData);
    } else {
      addSpendingRecord({
        customerId,
        ...formData,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-3 rounded border border-gray-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Service</label>
          <input
            type="text"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          {existingRecord ? 'Update' : 'Add'} Record
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
