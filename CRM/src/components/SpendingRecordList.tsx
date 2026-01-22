import { useState } from 'react';
import { useStore } from '../store/store';
import SpendingRecordForm from './SpendingRecordForm';

interface SpendingRecordListProps {
  customerId: string;
}

export default function SpendingRecordList({ customerId }: SpendingRecordListProps) {
  const spendingRecords = useStore((state) => state.spendingRecords);
  const deleteSpendingRecord = useStore((state) => state.deleteSpendingRecord);
  const customerRecords = spendingRecords
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

  const [editingId, setEditingId] = useState<string | null>(null);

  if (customerRecords.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-2">No spending records yet</p>;
  }

  return (
    <div className="space-y-2">
      {customerRecords.map((record) => (
        <div key={record.id}>
          {editingId === record.id ? (
            <SpendingRecordForm
              customerId={customerId}
              recordId={record.id}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600">${record.amount.toFixed(2)}</span>
                  <span className="text-gray-600">- {record.service}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {record.date} at {record.time}
                  <span className="ml-2">• Added by: {record.createdBy}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setEditingId(record.id)}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this record?')) {
                      deleteSpendingRecord(record.id);
                    }
                  }}
                  className="px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
