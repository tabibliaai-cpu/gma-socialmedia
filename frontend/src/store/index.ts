import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    username: string;
    bio: string;
    avatar_url: string;
    badge_type: string;
    followers_count: number;
    following_count: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// Posts store
interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  removePost: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  loading: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (id) => set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
  setLoading: (loading) => set({ loading }),
}));

// Chat store
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  encrypted_message: string;
  media_url?: string;
  message_type: string;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partner: {
    username: string;
    avatar_url: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Message[];
  onlineUsers: string[];
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (userId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (userId) => set({ activeConversation: userId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId) ? state.onlineUsers : [...state.onlineUsers, userId],
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({ onlineUsers: state.onlineUsers.filter((id) => id !== userId) })),
}));

// Notifications store
interface Notification {
  id: string;
  type: string;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
