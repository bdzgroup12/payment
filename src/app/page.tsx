'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
}

interface Store {
  name: string;
  description: string;
  backgroundColor: string;
  products: Product[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setError(null);
      const response = await fetch('/api/store', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch store data' }));
        throw new Error(errorData.error || 'Failed to fetch store data');
      }
      
      const data = await response.json();
      setStore(data);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch store data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStore();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: store?.backgroundColor || '#f9fafb' }}>
      {/* Products Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {store?.name || 'Our Products'}
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            {store?.description || 'Choose from our selection of premium packages'}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              No products available
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-gray-500">{product.description}</p>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    ${product.price}
                  </p>
                  <Link
                    href={`/checkout?productId=${product.id}`}
                    className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Login Section */}
      <div className="max-w-md mx-auto px-4 pb-12">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
