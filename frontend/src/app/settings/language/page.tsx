'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
];

export default function LanguageSettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(
    lang => 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.includes(searchQuery) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    const lang = languages.find(l => l.code === code);
    toast.success(`Language changed to ${lang?.name}`);
  };

  const currentLanguage = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Globe className="h-6 w-6 mr-2" />
          Language
        </h1>

        {/* Current Selection */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">Current Language</p>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {selectedLanguage.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{currentLanguage?.name}</p>
              <p className="text-sm text-gray-400">{currentLanguage?.native}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search languages..."
            className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Language List */}
        <div className="bg-dark-200 rounded-xl overflow-hidden">
          {filteredLanguages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between p-4 hover:bg-dark-300 transition-colors ${
                index !== filteredLanguages.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-dark-300 flex items-center justify-center text-white text-xs font-bold">
                  {lang.code.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-white">{lang.name}</p>
                  <p className="text-sm text-gray-500">{lang.native}</p>
                </div>
              </div>
              {selectedLanguage === lang.code && (
                <Check className="h-5 w-5 text-primary-400" />
              )}
            </button>
          ))}
        </div>

        {filteredLanguages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No languages found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
