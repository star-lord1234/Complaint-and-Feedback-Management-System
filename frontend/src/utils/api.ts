const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; role: string; department?: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Complaints API
export const complaintsAPI = {
  getAll: async () => {
    return apiRequest('/complaints');
  },

  getById: async (id: string) => {
    return apiRequest(`/complaints/${id}`);
  },

  create: async (data: { title: string; description: string; category: string; priority: string; anonymous?: boolean }) => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return apiRequest(`/complaints/${id}`, {
      method: 'DELETE',
    });
  },
};

// Feedback API
export const feedbackAPI = {
  getAll: async () => {
    return apiRequest('/feedback');
  },

  create: async (data: { rating: number; category: string; comments: string }) => {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    return apiRequest('/admin/users');
  },

  createUser: async (userData: { name: string; email: string; password: string; role: string; department?: string }) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getInsights: async () => {
    return apiRequest('/admin/insights');
  },
};

// Save token to localStorage
export const saveAuthToken = (token: string) => {
  localStorage.setItem('access_token', token);
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

