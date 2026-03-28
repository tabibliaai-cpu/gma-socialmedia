import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  username?: string; // top-level username returned on login/register
  profile?: {
    username: string;
    bio: string;
    avatar_url: string;
    badge_type: string;
    followers_count: number;
    following_count: number;
    name?: string;
    cover_url?: string;
    location?: string;
    website?: string;
    profession?: string;
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
