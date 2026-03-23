'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChatStore } from '@/store';
import { chatAPI } from '@/lib/api';
import { formatDate, encryptMessage, decryptMessage } from '@/lib/utils';
import { Send, Image, MoreVertical, Phone, Video, User, Circle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function ChatPage() {
  const { user } = useAuth();
  const { isConnected, sendMessage: socketSend, sendTyping, markAsRead } = useSocket();
  const { conversations, activeConversation, messages, onlineUsers, setConversations, setActiveConversation, setMessages, addMessage } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    // Generate encryption key for this session
    setEncryptionKey(localStorage.getItem('chat_key') || generateKey());
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateKey = () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('chat_key', key);
    return key;
  };

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data } = await chatAPI.getConversation(userId);
      setMessages(data);
      markAsRead(userId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const encrypted = await encryptMessage(newMessage, encryptionKey);
      socketSend(activeConversation, encrypted);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (activeConversation) {
      sendTyping(activeConversation, true);
      setTimeout(() => sendTyping(activeConversation, false), 3000);
    }
  };

  const activeConv = conversations.find(c => c.partnerId === activeConversation);

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-dark-200 rounded-xl overflow-hidden h-[calc(100vh-140px)] flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r border-gray-700 ${activeConversation ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setActiveConversation(conv.partnerId)}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-dark-300 transition-colors ${
                      activeConversation === conv.partnerId ? 'bg-dark-300' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                        {conv.partner?.avatar_url ? (
                          <img src={conv.partner.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          conv.partner?.username?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {onlineUsers.includes(conv.partnerId) && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 text-green-500 fill-current" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{conv.partner?.username}</span>
                        <span className="text-xs text-gray-500">{formatDate(conv.lastMessage?.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage?.encrypted_message?.substring(0, 30)}...
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : ''}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {activeConv?.partner?.avatar_url ? (
                        <img src={activeConv.partner.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        activeConv?.partner?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{activeConv?.partner?.username}</p>
                      <p className="text-xs text-gray-500">
                        {onlineUsers.includes(activeConversation) ? 'Online' : 'Offline'}
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMine ? 'bg-primary-600 text-white' : 'bg-dark-300 text-white'
                        }`}>
                          {msg.media_url && (
                            <img src={msg.media_url} alt="" className="rounded-lg mb-2 max-w-full" />
                          )}
                          <p>{msg.encrypted_message}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white">
                      <Image className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-dark-300 border border-gray-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white rounded-full"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
