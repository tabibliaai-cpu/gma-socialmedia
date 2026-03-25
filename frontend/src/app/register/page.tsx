'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.register({ email, password, username, role });
      login(data.access_token, data.user);
      toast.success('Account created successfully!');
      router.push('/feed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <h1 className="mt-6 text-3xl font-bold text-white">Join GPM</h1>
          <p className="mt-2 text-dark-600">Create your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-50 border border-dark-100 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:bg-dark-50 focus:ring-0 transition-all"
                placeholder="johndoe"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:bg-dark-50 focus:ring-0 transition-all"
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
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:bg-dark-50 focus:ring-0 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-2">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-100 border border-dark-200 rounded-xl text-white focus:border-primary focus:bg-dark-50 focus:ring-0 transition-all appearance-none cursor-pointer"
              >
                <option value="user">Personal Account</option>
                <option value="creator">Creator Account</option>
                <option value="business">Business Account</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-gray-100 disabled:bg-dark-200 disabled:cursor-not-allowed text-black font-bold rounded-full transition-all text-base"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-dark-500 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-dark-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
