import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
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
