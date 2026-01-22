import { useState } from 'react';
import { useStore } from '../store/store';
import type { Customer } from '../types';
import CustomerForm from './CustomerForm';
import SpendingRecordForm from './SpendingRecordForm';
import SpendingRecordList from './SpendingRecordList';

interface CustomerCardProps {
  customer: Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSpendingForm, setShowSpendingForm] = useState(false);
  const deleteCustomer = useStore((state) => state.deleteCustomer);
  const getCustomerTotal = useStore((state) => state.getCustomerTotal);

  const totalSpending = getCustomerTotal(customer.id);

  const labelColors = {
    shrimp: 'bg-pink-100 text-pink-800',
    fish: 'bg-blue-100 text-blue-800',
    dolphin: 'bg-purple-100 text-purple-800',
    whale: 'bg-yellow-100 text-yellow-800',
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <CustomerForm
          modelId={customer.modelId}
          customerId={customer.id}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${labelColors[customer.label]}`}>
              {customer.label.charAt(0).toUpperCase() + customer.label.slice(1)}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {customer.phoneNumber && <p>📞 {customer.phoneNumber}</p>}
            {customer.age > 0 && <p>Age: {customer.age}</p>}
            {customer.preferences && <p>Preferences: {customer.preferences}</p>}
            {customer.interests && <p>Interests: {customer.interests}</p>}
            {customer.generalNotes && (
              <p className="mt-2 text-gray-700 bg-gray-50 p-2 rounded">{customer.generalNotes}</p>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Created by: {customer.createdBy}</p>
            {customer.updatedBy !== customer.createdBy && (
              <p>Last updated by: {customer.updatedBy}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this customer?')) {
                deleteCustomer(customer.id);
              }
            }}
            className="px-3 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-700">Spending Record</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-600">Total: ${totalSpending.toFixed(2)}</span>
            <button
              onClick={() => setShowSpendingForm(!showSpendingForm)}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
            >
              {showSpendingForm ? 'Cancel' : '+ Add'}
            </button>
          </div>
        </div>
        {showSpendingForm && (
          <div className="mb-3">
            <SpendingRecordForm customerId={customer.id} onClose={() => setShowSpendingForm(false)} />
          </div>
        )}
        <SpendingRecordList customerId={customer.id} />
      </div>
    </div>
  );
}
