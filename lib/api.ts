import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// For Next.js API routes, we use relative paths
const API_URL = process.env.NODE_ENV === 'production' ? '' : '';

// Create axios instance
export const api = axios.create({
  baseURL: '/api', // Use relative path for Next.js API routes
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
