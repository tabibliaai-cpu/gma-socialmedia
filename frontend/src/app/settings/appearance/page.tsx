'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppearanceSettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('blue');

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  const accentColors = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'pink', color: 'bg-pink-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'red', color: 'bg-red-500' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success('Theme preference saved');
  };

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    toast.success('Accent color saved');
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Appearance</h1>

        {/* Theme Selection */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Theme
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as any)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <t.icon className={`h-8 w-8 mx-auto mb-2 ${theme === t.id ? 'text-primary-400' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${theme === t.id ? 'text-white' : 'text-gray-400'}`}>
                  {t.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4">Accent Color</h2>
          <div className="flex items-center space-x-4">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleAccentChange(color.id)}
                className={`relative h-10 w-10 rounded-full ${color.color} transition-transform hover:scale-110`}
              >
                {accentColor === color.id && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4">Font Size</h2>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm bg-dark-300 text-gray-400 rounded-lg hover:text-white">
              Small
            </button>
            <button className="px-4 py-2 text-base bg-primary-600 text-white rounded-lg">
              Medium
            </button>
            <button className="px-4 py-2 text-lg bg-dark-300 text-gray-400 rounded-lg hover:text-white">
              Large
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-dark-200 rounded-xl p-4">
          <h2 className="font-semibold text-white mb-4">Preview</h2>
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-600"></div>
              <div>
                <p className="font-medium text-white">John Doe</p>
                <p className="text-sm text-gray-400">@johndoe</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              This is how your content will look with the selected theme and accent color.
            </p>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              Primary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
