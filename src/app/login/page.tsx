import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import ProductGrid from '@/components/ProductGrid';

export const metadata: Metadata = {
  title: 'Login - Dashboard',
  description: 'Login to access the dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProductGrid />
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 