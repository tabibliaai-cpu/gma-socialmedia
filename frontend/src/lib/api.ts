import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; username: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getUserProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updatePrivacy: (data: any) => api.put('/users/privacy', data),
  follow: (userId: string) => api.post(`/users/follow/${userId}`),
  unfollow: (userId: string) => api.post(`/users/unfollow/${userId}`),
  checkFollow: (userId: string) => api.get(`/users/check-follow/${userId}`),
  getFollowers: (username: string) => api.get(`/users/${username}/followers`),
  getFollowing: (username: string) => api.get(`/users/${username}/following`),
  createShareLink: () => api.post('/users/share-link'),
  getSharedProfile: (token: string) => api.get(`/users/shared/${token}`),
};

// Posts API
export const postsAPI = {
  create: (data: any) => api.post('/posts', data),
  getFeed: (page = 1, limit = 20) => api.get(`/posts/feed?page=${page}&limit=${limit}`),
  getExplore: (page = 1, limit = 20) => api.get(`/posts/explore?page=${page}&limit=${limit}`),
  getUserPosts: (userId: string, page = 1, limit = 20) =>
    api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/posts/${id}`),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  like: (id: string) => api.post(`/posts/${id}/like`),
  unlike: (id: string) => api.delete(`/posts/${id}/like`),
  share: (id: string) => api.post(`/posts/${id}/share`),
  bookmark: (id: string) => api.post(`/posts/${id}/bookmark`),
  unbookmark: (id: string) => api.delete(`/posts/${id}/bookmark`),
  getBookmarks: () => api.get('/posts/bookmarks'),
  getComments: (id: string, page = 1) => api.get(`/posts/${id}/comments?page=${page}`),
  addComment: (id: string, content: string) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId: string) => api.delete(`/posts/comments/${commentId}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (userId: string, page = 1) =>
    api.get(`/chat/conversation/${userId}?page=${page}`),
  startConversation: (userId: string) => api.post(`/chat/start/${userId}`),
  sendMessage: (userId: string, message: string, mediaUrl?: string) =>
    api.post(`/chat/message`, { receiverId: userId, message, mediaUrl }),
  block: (userId: string) => api.post(`/chat/block/${userId}`),
  nuclearBlock: (userId: string) => api.post(`/chat/nuclear-block/${userId}`),
  unblock: (userId: string) => api.delete(`/chat/block/${userId}`),
  setPaidSettings: (price: number, enabled: boolean) =>
    api.post('/chat/paid-settings', { price, enabled }),
  unlockChat: (creatorId: string, amount: number, paymentId: string) =>
    api.post(`/chat/unlock/${creatorId}`, { amount, paymentId }),
};

// CRM API
export const crmAPI = {
  createLead: (data: any) => api.post('/crm/leads', data),
  getLeads: (status?: string) => api.get(`/crm/leads${status ? `?status=${status}` : ''}`),
  updateLeadStatus: (id: string, status: string, notes?: string) =>
    api.put(`/crm/leads/${id}/status`, { status, notes }),
  convertLead: (id: string, data: any) => api.post(`/crm/leads/${id}/convert`, data),
  createDeal: (data: any) => api.post('/crm/deals', data),
  getDeals: (status?: string) => api.get(`/crm/deals${status ? `?status=${status}` : ''}`),
  updateDealStatus: (id: string, status: string) =>
    api.put(`/crm/deals/${id}/status`, { status }),
  getDealStats: () => api.get('/crm/deals/stats'),
  createOrder: (data: any) => api.post('/crm/orders', data),
  getOrders: (status?: string) => api.get(`/crm/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/crm/orders/${id}/status`, { status }),
  getCommissions: () => api.get('/crm/commissions'),
  getDashboard: () => api.get('/crm/dashboard'),
};

// Ads API
export const adsAPI = {
  create: (data: any) => api.post('/ads', data),
  getAll: () => api.get('/ads'),
  getStats: () => api.get('/ads/stats'),
  getById: (id: string) => api.get(`/ads/${id}`),
  update: (id: string, data: any) => api.put(`/ads/${id}`, data),
  toggle: (id: string, active: boolean) => api.put(`/ads/${id}/toggle`, { active }),
  delete: (id: string) => api.delete(`/ads/${id}`),
  recordImpression: (id: string) => api.post(`/ads/${id}/impression`),
  recordClick: (id: string) => api.post(`/ads/${id}/click`),
};

// Articles API
export const articlesAPI = {
  create: (data: any) => api.post('/articles', data),
  getAll: (page = 1, limit = 20) => api.get(`/articles?page=${page}&limit=${limit}`),
  getByAuthor: (authorId: string) => api.get(`/articles/author/${authorId}`),
  getPurchased: () => api.get('/articles/purchased'),
  getEarnings: () => api.get('/articles/earnings'),
  getById: (id: string) => api.get(`/articles/${id}`),
  update: (id: string, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
  purchase: (id: string, paymentId: string) =>
    api.post(`/articles/${id}/purchase`, { paymentId }),
};

// Search API
export const searchAPI = {
  search: (query: string, type = 'all') => api.get(`/search?q=${query}&type=${type}`),
  searchWithFactCheck: (query: string) => api.get(`/search/fact-check?q=${query}`),
  getTrending: () => api.get('/search/trending'),
  getSuggestions: (query: string) => api.get(`/search/suggestions?q=${query}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (page = 1) => api.get(`/notifications?page=${page}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Payments API
export const paymentsAPI = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verify: (data: any) => api.post('/payments/verify', data),
  getTransactions: (type?: string) =>
    api.get(`/payments/transactions${type ? `?type=${type}` : ''}`),
  getEarnings: () => api.get('/payments/earnings'),
};

// AI API
export const aiAPI = {
  createAutomation: (data: any) => api.post('/ai/automations', data),
  getAutomations: () => api.get('/ai/automations'),
  toggleAutomation: (id: string, active: boolean) =>
    api.put(`/ai/automations/${id}/toggle`, { active }),
  deleteAutomation: (id: string) => api.delete(`/ai/automations/${id}`),
  generateFollowUp: (leadId: string) => api.post(`/ai/followup/${leadId}`),
  generateDealSuggestion: (dealId: string) => api.post(`/ai/deal-suggestion/${dealId}`),
  factCheck: (content: string) => api.post('/ai/fact-check', { content }),
  summarize: (content: string) => api.post('/ai/summarize', { content }),
};

// Affiliates API
export const affiliatesAPI = {
  // UPGRADED: Now only requires the username, the backend handles the rest!
  create: (data: { username: string }) => api.post('/affiliates', data),
  
  getBusinessAffiliates: () => api.get('/affiliates'),
  getUserAffiliates: () => api.get('/affiliates/mine'),
  remove: (id: string) => api.delete(`/affiliates/${id}`),
  updateLabel: (id: string, label: string) => api.put(`/affiliates/${id}/label`, { label }),
  purchaseSlots: (slots: number, paymentId: string) =>
    api.post('/affiliates/purchase-slots', { slots, paymentId }),
};
