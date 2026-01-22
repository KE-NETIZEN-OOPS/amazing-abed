import { useStore } from '../store/store';

interface SpendingRecordSectionProps {
  modelId: string;
}

export default function SpendingRecordSection({ modelId }: SpendingRecordSectionProps) {
  const customers = useStore((state) => state.customers);
  const spendingRecords = useStore((state) => state.spendingRecords);
  const getCustomerTotal = useStore((state) => state.getCustomerTotal);

  const modelCustomers = customers.filter((c) => c.modelId === modelId);
  const allRecords = spendingRecords.filter((r) =>
    modelCustomers.some((c) => c.id === r.customerId)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">All Spending Records</h2>
      <div className="space-y-3">
        {allRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No spending records yet</p>
        ) : (
          allRecords
            .sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.time}`);
              const dateB = new Date(`${b.date}T${b.time}`);
              return dateB.getTime() - dateA.getTime();
            })
            .map((record) => {
              const customer = modelCustomers.find((c) => c.id === record.customerId);
              return (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {customer?.name || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-indigo-600">${record.amount.toFixed(2)}</span>
                        {' - '}
                        {record.service}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.date} at {record.time} • Added by: {record.createdBy}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Customer Total: ${getCustomerTotal(record.customerId).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
