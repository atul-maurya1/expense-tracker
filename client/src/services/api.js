import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  'https://expense-tracker-f8fs.onrender.com/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      window.location.replace('/login');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject(error);
  }
);

export default api;