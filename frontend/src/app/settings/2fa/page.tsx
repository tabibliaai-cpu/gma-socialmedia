'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import CredentialField from '@/components/CredentialField';
import { Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  const mockApiKey = 'sk_live_' + Math.random().toString(36).substring(2, 15);
  const mockSecret = 'secret_' + Math.random().toString(36).substring(2, 25);
  const mockRecoveryCodes = [
    'ABCD-EFGH-IJKL',
    'MNOP-QRST-UVWX',
    'YZ12-3456-7890',
  ];

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          Security
        </h1>

        {/* Two-Factor Authentication */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-primary-400" />
              <div>
                <h2 className="font-semibold text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <div className={`h-5 w-5 bg-white rounded-full transform transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm">2FA is enabled</span>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4">API Keys</h2>
          <div className="space-y-4">
            <CredentialField
              label="Public Key"
              value={mockApiKey}
              isSecret={false}
            />
            <CredentialField
              label="Secret Key"
              value={mockSecret}
              isSecret={true}
              showRegenerate
              onRegenerate={() => toast.success('New secret key generated')}
            />
          </div>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-sm">
                Never share your secret key. Regenerate it immediately if you suspect it's been compromised.
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Codes */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recovery Codes</h2>
            <button
              onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              {showRecoveryCodes ? 'Hide' : 'Show'} Codes
            </button>
          </div>

          {showRecoveryCodes && (
            <div className="space-y-2">
              {mockRecoveryCodes.map((code, i) => (
                <code key={i} className="block bg-dark-300 px-3 py-2 rounded text-sm text-gray-300 font-mono">
                  {code}
                </code>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                Store these codes safely. They can be used to access your account if you lose 2FA.
              </p>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-dark-200 rounded-xl p-4">
          <h2 className="font-semibold text-white mb-4">Active Sessions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
              <div>
                <p className="text-white text-sm">Current Session</p>
                <p className="text-xs text-gray-500">Chrome on Windows • Active now</p>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                Current
              </span>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-red-400 hover:text-red-300 text-sm">
            Sign out all other sessions
          </button>
        </div>
      </div>
    </div>
  );
}
