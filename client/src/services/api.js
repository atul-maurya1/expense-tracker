import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://expense-tracker-f8fs.onrender.com/api'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on auth pages
      const pathname = window.location.pathname
      if (!pathname.includes('/login') && !pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  }
)

export default api
