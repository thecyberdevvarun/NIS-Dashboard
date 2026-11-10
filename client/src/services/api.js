import axios from 'axios';
import { toast } from 'react-toastify';

export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;
export const USER_KEY = import.meta.env.VITE_USER_KEY;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One place for error toasts, so components only handle success.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ||
      (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check that the API is running' : 'Something went wrong');
    const isLogin = err.config?.url?.includes('/auth/login');
    if (status === 401 && !isLogin) window.dispatchEvent(new Event('auth:logout'));
    toast.error(message, { toastId: message });
    err.message = message;
    return Promise.reject(err);
  }
);

export default api;
