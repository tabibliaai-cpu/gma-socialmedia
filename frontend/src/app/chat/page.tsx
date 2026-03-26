'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import { chatAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    username: string;
    avatar_url?: string;
    badge_type?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

function ChatPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    // Check if we need to open a specific user's chat from URL
    const userId = searchParams.get('user');
    if (userId && conversations.length >= 0) {
      startChatWithUser(userId);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.participant.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChatWithUser = async (userId: string) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.participant.id === userId);
    if (existing) {
      setSelectedChat(existing);
      return;
    }
    
    // Start new conversation
    try {
      const { data } = await chatAPI.startConversation(userId);
      setSelectedChat(data);
      loadConversations();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data } = await chatAPI.getConversation(userId);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await chatAPI.sendMessage(selectedChat.participant.id, newMessage);
      setNewMessage('');
      loadMessages(selectedChat.participant.id);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Conversations List */}
        <aside className={`w-full md:w-[350px] border-r border-[#2f3336] flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="sticky top-0 bg-black z-10 p-4 border-b border-[#2f3336]">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <button className="p-2 hover:bg-[#181836] rounded-full transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71767b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-10 pr-4 py-2.5 bg-[#202327] border-none rounded-full text-white placeholder-[#71767b] focus:bg-black focus:ring-1 focus:ring-[#1d9bf0]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1d9bf0]"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-[#71767b] text-lg">No messages yet</p>
                <p className="text-[#71767b] text-sm mt-2">Start a conversation with someone</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-[#181836] transition-colors ${
                    selectedChat?.id === conv.id ? 'bg-[#181836]' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold shrink-0">
                    {conv.participant.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-white truncate">{conv.participant.username}</p>
                    <p className="text-[#71767b] text-sm truncate">{conv.last_message?.content || 'No messages'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat ? (
            <>
              <div className="sticky top-0 bg-black z-10 p-4 border-b border-[#2f3336] flex items-center gap-3">
                {/* Back button for mobile */}
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold shrink-0">
                  {selectedChat.participant.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{selectedChat.participant.username}</p>
                  <p className="text-[#71767b] text-sm truncate">@{selectedChat.participant.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                        msg.sender_id === user?.id
                          ? 'bg-[#1d9bf0] text-white rounded-br-sm'
                          : 'bg-[#202327] text-white rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-[#71767b]'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-[#2f3336]">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Start a new message"
                    className="flex-1 px-4 py-3 bg-[#202327] border-none rounded-full text-white placeholder-[#71767b] focus:bg-black focus:ring-1 focus:ring-[#1d9bf0]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#202327] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#71767b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Select a conversation</h2>
                <p className="text-[#71767b] text-wrap">Choose from your existing conversations, or start a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
