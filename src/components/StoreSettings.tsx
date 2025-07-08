'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
}

interface StoreData {
  id: string;
  name: string;
  backgroundColor: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  products: Product[];
}

export default function StoreSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await fetch('/api/store');
      if (!response.ok) throw new Error('Failed to fetch store data');
      const data = await response.json();
      setStore(data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      backgroundColor: formData.get('backgroundColor'),
      stripeSecretKey: formData.get('stripeSecretKey'),
      stripePublishableKey: formData.get('stripePublishableKey'),
      products: store?.products.map((product, index) => ({
        id: product.id,
        title: formData.get(`productTitle_${index}`),
        price: parseFloat(formData.get(`productPrice_${index}`) as string),
        description: formData.get(`productDescription_${index}`),
      })),
    };

    try {
      const response = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update store');
      
      await fetchStoreData();
      router.refresh();
    } catch (error) {
      console.error('Error updating store:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Store Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Store Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={store.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <input
              type="color"
              name="backgroundColor"
              id="backgroundColor"
              defaultValue={store.backgroundColor}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Stripe Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Stripe Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700">
              Stripe Secret Key
            </label>
            <input
              type="password"
              name="stripeSecretKey"
              id="stripeSecretKey"
              defaultValue={store.stripeSecretKey}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="sk_test_..."
            />
            <p className="mt-1 text-sm text-gray-500">For testing, use a Stripe test key starting with sk_test_</p>
          </div>
          <div>
            <label htmlFor="stripePublishableKey" className="block text-sm font-medium text-gray-700">
              Stripe Publishable Key
            </label>
            <input
              type="text"
              name="stripePublishableKey"
              id="stripePublishableKey"
              defaultValue={store.stripePublishableKey}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="pk_test_..."
            />
            <p className="mt-1 text-sm text-gray-500">For testing, use a Stripe test key starting with pk_test_</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <div className="space-y-6">
          {store.products.map((product, index) => (
            <div key={product.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-medium mb-4">Product {index + 1}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor={`productTitle_${index}`} className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name={`productTitle_${index}`}
                    id={`productTitle_${index}`}
                    defaultValue={product.title}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`productPrice_${index}`} className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    name={`productPrice_${index}`}
                    id={`productPrice_${index}`}
                    defaultValue={product.price}
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`productDescription_${index}`} className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name={`productDescription_${index}`}
                    id={`productDescription_${index}`}
                    defaultValue={product.description}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 