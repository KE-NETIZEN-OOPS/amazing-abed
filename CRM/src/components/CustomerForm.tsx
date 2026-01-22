import { useState } from 'react';
import { useStore } from '../store/store';
import type { CustomerLabel } from '../types';

interface CustomerFormProps {
  modelId: string;
  onClose: () => void;
  customerId?: string;
}

export default function CustomerForm({ modelId, onClose, customerId }: CustomerFormProps) {
  const customers = useStore((state) => state.customers);
  const addCustomer = useStore((state) => state.addCustomer);
  const updateCustomer = useStore((state) => state.updateCustomer);

  const existingCustomer = customerId ? customers.find((c) => c.id === customerId) : null;

  const [formData, setFormData] = useState({
    name: existingCustomer?.name || '',
    label: (existingCustomer?.label || 'shrimp') as CustomerLabel,
    phoneNumber: existingCustomer?.phoneNumber || '',
    age: existingCustomer?.age || 0,
    preferences: existingCustomer?.preferences || '',
    interests: existingCustomer?.interests || '',
    generalNotes: existingCustomer?.generalNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingCustomer) {
      updateCustomer(customerId!, formData);
    } else {
      addCustomer({
        modelId,
        ...formData,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
          <select
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value as CustomerLabel })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="shrimp">Shrimp</option>
            <option value="fish">Fish</option>
            <option value="dolphin">Dolphin</option>
            <option value="whale">Whale</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
        <textarea
          value={formData.preferences}
          onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
        <textarea
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
        <textarea
          value={formData.generalNotes}
          onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {existingCustomer ? 'Update' : 'Add'} Customer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
