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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden py-12">
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
          <h1 className="mt-6 text-4xl font-bold text-white tracking-tight">Join GPM</h1>
          <p className="mt-2 text-dark-500 text-lg">Create your account</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full px-5 py-4 glass-input rounded-xl text-white placeholder-dark-500 focus:outline-none"
                placeholder="johndoe"
                required
                minLength={3}
              />
            </div>

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
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2 ml-1">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-4 glass-input rounded-xl text-white focus:outline-none appearance-none cursor-pointer"
              >
                <option value="user" className="bg-dark-100">Personal Account</option>
                <option value="creator" className="bg-dark-100">Creator Account</option>
                <option value="business" className="bg-dark-100">Business Account</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(120,86,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] text-lg"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-8 text-xs text-dark-500 text-center uppercase tracking-wider font-semibold">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-white transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Sign In Link */}
        <div className="mt-8 text-center animate-fade-in drop-shadow-md">
          <p className="text-dark-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-primary font-semibold transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
