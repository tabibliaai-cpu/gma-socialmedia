'use client';

import MainLayout from '@/components/MainLayout';
import { Shield, Smartphone, Key, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function TwoFactorPage() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState(1);
  const [code] = useState('ABCD-EFGH-IJKL-MNOP');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Two-Factor Authentication
          </h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Info */}
          <div className="bg-[#16181c] rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#1d9bf0]/10 rounded-full">
                <Shield className="h-8 w-8 text-[#1d9bf0]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Protect your account</h2>
                <p className="text-[#71767b] mt-1">
                  Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app when you sign in.
                </p>
              </div>
            </div>
          </div>

          {!enabled ? (
            <>
              {/* Step 1 */}
              {step === 1 && (
                <div className="bg-[#16181c] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <h3 className="text-white font-semibold">Download an authenticator app</h3>
                  </div>
                  <p className="text-[#71767b] mb-4">
                    Install Google Authenticator, Authy, or similar app on your phone.
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]"
                  >
                    I have an authenticator app
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="bg-[#16181c] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <h3 className="text-white font-semibold">Scan QR code or enter code</h3>
                  </div>
                  
                  {/* Mock QR Code */}
                  <div className="bg-white p-4 rounded-xl w-fit mx-auto mb-4">
                    <div className="w-32 h-32 bg-[#16181c] flex items-center justify-center">
                      <Key className="h-12 w-12 text-white" />
                    </div>
                  </div>

                  <p className="text-[#71767b] text-center mb-2">Or enter this code manually:</p>
                  
                  <div className="flex items-center justify-center space-x-2 bg-black p-3 rounded-lg">
                    <code className="text-white font-mono">{code}</code>
                    <button onClick={handleCopy} className="text-[#1d9bf0] hover:text-[#1a8cd8]">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full mt-6 py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="bg-[#16181c] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <h3 className="text-white font-semibold">Verify code</h3>
                  </div>
                  
                  <p className="text-[#71767b] mb-4">
                    Enter the 6-digit code from your authenticator app:
                  </p>

                  <div className="flex justify-center space-x-2 mb-6">
                    {[1,2,3,4,5,6].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 bg-black border border-[#2f3336] rounded-lg text-white text-center text-xl font-bold focus:border-[#1d9bf0] focus:outline-none"
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setEnabled(true);
                      toast.success('Two-factor authentication enabled!');
                    }}
                    className="w-full py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]"
                  >
                    Verify & Enable
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#16181c] rounded-xl p-6">
              <div className="flex items-center space-x-3 text-green-500 mb-4">
                <Check className="h-6 w-6" />
                <span className="font-semibold">Two-factor authentication is enabled</span>
              </div>
              <p className="text-[#71767b] mb-4">
                Your account is protected with two-factor authentication.
              </p>
              <button
                onClick={() => setEnabled(false)}
                className="px-6 py-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
