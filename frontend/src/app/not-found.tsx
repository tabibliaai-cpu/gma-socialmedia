'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary-600">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-6 py-3 bg-dark-200 text-white rounded-xl hover:bg-dark-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          
          <Link
            href="/feed"
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go to Feed</span>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 mb-4">Looking for something specific?</p>
          <Link
            href="/explore"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300"
          >
            <Search className="h-4 w-4" />
            <span>Search the platform</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
