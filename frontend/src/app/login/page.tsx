'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Call the login API
    const { data } = await authAPI.login({ email, password });
    
    // 2. Validate that we received the token
    if (data && data.access_token) {
      // 3. Use the login function from AuthContext to sync state
      // This sets the token in localStorage and updates the global user state
      login(data.access_token, data.user);
      
      toast.success('Welcome back!');
      
      // 4. Redirect to the feed
      router.push('/feed');
    } else {
      throw new Error('No access token received from server');
    }
  } catch (error: any) {
    // 5. Display the specific error message from the backend
    // This is now safe because your api.ts interceptor ignores 401s on the login route
    const errorMessage = error.response?.data?.message || 'Invalid email or password';
    toast.error(errorMessage);
    console.error('Login Error:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">GPM</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-dark-600">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-50 border border-dark-100 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:ring-0 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:ring-0 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-gray-100 disabled:bg-dark-200 disabled:cursor-not-allowed text-black font-bold rounded-full transition-all text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-50 text-dark-500">or</span>
            </div>
          </div>

          {/* Forgot Password */}
          <Link
            href="/forgot-password"
            className="block text-center text-primary hover:underline text-sm"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-dark-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
