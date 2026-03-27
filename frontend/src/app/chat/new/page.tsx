'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Navbar from '@/components/Navbar';
import { Send, Phone, Video, MoreVertical, Image, Smile, Paperclip, Mic } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  encrypted_message: string;
  media_url?: string;
  message_type: string;
  created_at: string;
}

export default function NewChatPage() {
  const { user } = useAuth();
  const { sendMessage, isConnected } = useSocket();
  const { messages, setMessages } = useChatStore();
  const [receiverId, setReceiverId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preFilledUserId = params.get('userId');
    if (preFilledUserId) setReceiverId(preFilledUserId);
    setMessages([]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!newMessage.trim() || !receiverId.trim()) return;

    sendMessage(receiverId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-dark-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-sm">?</span>
              </div>
              <div>
                <input
                  type="text"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  placeholder="Enter User ID to chat..."
                  className="bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500">
                  {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-center">
                <div>
                  <p className="mb-2">Enter a User ID to start a new conversation</p>
                  <p className="text-sm">You can find User IDs in profile URLs</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary-600 text-white' : 'bg-dark-300 text-white'
                      }`}>
                      <p>{msg.encrypted_message}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Image className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-dark-300 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="p-2 text-gray-400 hover:text-white">
                <Smile className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || !receiverId.trim()}
                className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white rounded-full"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
