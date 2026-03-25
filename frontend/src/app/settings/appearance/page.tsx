'use client';

import MainLayout from '@/components/MainLayout';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AppearancePage() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#1d9bf0');

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
    { id: 'system', label: 'System', icon: Monitor, description: 'Follow system' },
  ];

  const colors = [
    { id: 'blue', color: '#1d9bf0', label: 'Blue' },
    { id: 'purple', color: '#7856ff', label: 'Purple' },
    { id: 'green', color: '#00ba7c', label: 'Green' },
    { id: 'pink', color: '#f91880', label: 'Pink' },
    { id: 'orange', color: '#ff7a00', label: 'Orange' },
  ];

  const handleSave = () => {
    toast.success('Appearance settings saved!');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Palette className="h-6 w-6 mr-2" />
            Appearance
          </h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div className="bg-[#16181c] rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4">Theme</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    theme === t.id
                      ? 'border-[#1d9bf0] bg-[#1d9bf0]/10'
                      : 'border-[#2f3336] hover:border-[#536471]'
                  }`}
                >
                  <t.icon className="h-8 w-8 mx-auto mb-2 text-white" />
                  <p className="text-white font-medium">{t.label}</p>
                  <p className="text-xs text-[#71767b]">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-[#16181c] rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4">Accent Color</h2>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.color)}
                  className={`w-12 h-12 rounded-full transition-transform ${
                    accentColor === c.color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-[#16181c] rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4">Font Size</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#71767b]">A</span>
              <input
                type="range"
                min="12"
                max="20"
                defaultValue="16"
                className="flex-1 accent-[#1d9bf0]"
              />
              <span className="text-xl text-[#71767b]">A</span>
            </div>
          </div>

          {/* Save */}
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
