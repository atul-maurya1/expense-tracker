import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Extract the user object from the API response.
function extractUser(responseData) {
  const data = responseData?.data ?? responseData
  const user = data?.user ?? data

  if (
    !user ||
    typeof user !== 'object' ||
    Array.isArray(user) ||
    (!user._id && !user.id && !user.email)
  ) {
    return null
  }

  return user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check the current authentication session.
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me')
      const userData = extractUser(response.data)

      setUser(userData)
      return userData
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
        return null
      }

      console.error('Failed to refresh user:', error)
      throw error
    }
  }, [])

  // Check authentication when the application loads.
  useEffect(() => {
    let active = true

    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me')

        if (active) {
          setUser(extractUser(response.data))
        }
      } catch (error) {
        if (active && error.response?.status === 401) {
          localStorage.removeItem('token')
          setUser(null)
        } else if (active) {
          console.error('Authentication check failed:', error)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [])

  // Login an existing user.
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    const token = response.data?.token || response.data?.data?.token
    if (token) {
      localStorage.setItem('token', token)
    }

    const userData = extractUser(response.data)

    if (userData) {
      setUser(userData)
      return userData
    }

    // If the login response doesn't include a user,
    // retrieve the authenticated user from the backend.
    const authenticatedUser = await refreshUser()

    if (!authenticatedUser) {
      throw new Error(
        'Unable to retrieve the authenticated user after login.'
      )
    }

    return authenticatedUser
  }

  // Register a new account.
  const register = async (formData) => {
    const response = await api.post('/auth/register', formData)
    const token = response.data?.token || response.data?.data?.token
    if (token) {
      localStorage.setItem('token', token)
    }

    const userData = extractUser(response.data)

    if (userData) {
      setUser(userData)
    }

    return response.data
  }

  // Logout the current user.
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to access authentication context.
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export default AuthContext
