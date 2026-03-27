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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-success/10 rounded-full mix-blend-screen filter blur-[80px] animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center justify-center gap-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(120,86,255,0.3)] transform transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
              <span className="text-white font-bold text-2xl tracking-tighter">GPM</span>
            </div>
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="mt-2 text-dark-500 text-lg">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full px-5 py-4 glass-input rounded-xl text-white placeholder-dark-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 glass-input rounded-xl text-white placeholder-dark-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(120,86,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] text-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#141518] text-dark-500 rounded-full border border-white/5">or continue with</span>
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
        <div className="mt-8 text-center animate-fade-in drop-shadow-md">
          <p className="text-dark-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-white hover:text-primary font-semibold transition-colors duration-200">
              Sign up for GPM
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
