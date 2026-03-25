'use client';

import MainLayout from '@/components/MainLayout';
import { Globe, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
];

export default function LanguagePage() {
  const [selected, setSelected] = useState('en');

  const handleSave = () => {
    toast.success('Language settings saved!');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Globe className="h-6 w-6 mr-2" />
            Language
          </h1>
        </div>

        <div className="p-4">
          <div className="bg-[#16181c] rounded-xl overflow-hidden mb-6">
            <div className="p-4 border-b border-[#2f3336]">
              <p className="text-white font-medium">Select your language</p>
              <p className="text-sm text-[#71767b]">This will change the language of the app.</p>
            </div>

            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`w-full p-4 flex items-center justify-between hover:bg-[#1a1a2a] transition-colors ${
                  index !== languages.length - 1 ? 'border-b border-[#2f3336]' : ''
                }`}
              >
                <div>
                  <p className="text-white font-medium">{lang.name}</p>
                  <p className="text-sm text-[#71767b]">{lang.native}</p>
                </div>
                {selected === lang.code && (
                  <Check className="h-5 w-5 text-[#1d9bf0]" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
