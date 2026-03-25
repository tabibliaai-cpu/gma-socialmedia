'use client';

import MainLayout from '@/components/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>

        <div className="p-4">
          <div className="bg-[#16181c] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Privacy & Security</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Private Account</p>
                  <p className="text-sm text-[#71767b]">Only followers can see your posts</p>
                </div>
                <button className="w-12 h-6 bg-[#1d9bf0] rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-[#2f3336] pt-4">
                <div>
                  <p className="text-white font-medium">Allow DMs from everyone</p>
                  <p className="text-sm text-[#71767b]">Receive messages from anyone</p>
                </div>
                <button className="w-12 h-6 bg-[#2f3336] rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-[#2f3336] pt-4">
                <div>
                  <p className="text-white font-medium">Show in search</p>
                  <p className="text-sm text-[#71767b]">Allow others to find you</p>
                </div>
                <button className="w-12 h-6 bg-[#1d9bf0] rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-[#2f3336] pt-4">
                <div>
                  <p className="text-white font-medium">Show activity status</p>
                  <p className="text-sm text-[#71767b]">Show when you're online</p>
                </div>
                <button className="w-12 h-6 bg-[#2f3336] rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
