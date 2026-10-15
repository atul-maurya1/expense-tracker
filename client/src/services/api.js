import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const pathname = window.location.pathname;

    if (
      status === 401 &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/register')
    ) {
      localStorage.removeItem('token');
      window.location.replace('/login');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    error.message = message;
    return Promise.reject(error);
  }
);

export default api;