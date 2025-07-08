'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  store: {
    id: string;
    name: string;
    stripePublishableKey: string;
  };
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('No product selected');
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/store`);
      if (!response.ok) throw new Error('Failed to fetch store data');
      const storeData = await response.json();
      
      const product = storeData.products.find((p: any) => p.id === productId);
      if (!product) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      // Add store data to product
      setProduct({
        ...product,
        store: {
          id: storeData.id,
          name: storeData.name,
          stripePublishableKey: storeData.stripePublishableKey
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!product || !product.store.stripePublishableKey) {
      setError('Stripe not configured');
      return;
    }

    try {
      setLoading(true);

      // Initialize Stripe
      const stripe = await loadStripe(product.store.stripePublishableKey);
      if (!stripe) throw new Error('Failed to load Stripe');

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 