import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// In production (Vercel), API is on same domain, so use relative path
// In development, use localhost:4000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

// Create axios instance
export const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hook to get authenticated API client
export function useApi() {
  const { getToken } = useAuth();

  // Add auth token to requests
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}

export default api;
