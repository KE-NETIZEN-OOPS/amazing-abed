import { useState } from 'react';
import { useStore } from '../store/store';
import type { CustomerLabel } from '../types';
import CustomerForm from './CustomerForm';
import CustomerCard from './CustomerCard';

interface CustomerSectionProps {
  modelId: string;
}

export default function CustomerSection({ modelId }: CustomerSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const customers = useStore((state) => state.customers);
  const modelCustomers = customers.filter((c) => c.modelId === modelId);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CustomerForm modelId={modelId} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-4">
        {modelCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
        {modelCustomers.length === 0 && (
          <p className="text-gray-500 text-center py-8">No customers yet. Add your first customer!</p>
        )}
      </div>
    </div>
  );
}
