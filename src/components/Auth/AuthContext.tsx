import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulated user database (in a real app, this would be on the server)
const USERS_STORAGE_KEY = 'finsense_users'
const AUTH_TOKEN_KEY = 'finsense_auth_token'
const CURRENT_USER_KEY = 'finsense_current_user'

// Helper functions for localStorage
const getStoredUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const storeUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const getStoredToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

const storeToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

const removeToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

const storeCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

// Generate a simple JWT-like token (in a real app, this would be done on the server)
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

const validateToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token))
    return payload.exp > Date.now()
  } catch {
    return false
  }
}

const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token))
    return payload.userId
  } catch {
    return null
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      // Create demo user if it doesn't exist
      const users = getStoredUsers()
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@finsense.com',
        firstName: 'Demo',
        lastName: 'User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3B82F6&color=fff'
      }
      
      if (!users.find(u => u.email === 'demo@finsense.com')) {
        users.push(demoUser)
        storeUsers(users)
        localStorage.setItem('password_demo-user-123', 'demo123')
      }

      const token = getStoredToken()
      if (token && validateToken(token)) {
        const storedUser = getCurrentUser()
        if (storedUser) {
          setUser(storedUser)
        } else {
          // Token exists but no user data, try to reconstruct from token
          const userId = getUserIdFromToken(token)
          if (userId) {
            const foundUser = users.find(u => u.id === userId)
            if (foundUser) {
              setUser(foundUser)
              storeCurrentUser(foundUser)
            } else {
              removeToken() // Invalid token
            }
          } else {
            removeToken() // Invalid token
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const users = getStoredUsers()
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        return { success: false, error: 'User not found. Please check your email or sign up.' }
      }

      // In a real app, you'd hash and compare passwords
      // For demo purposes, we'll use a simple check
      const storedPassword = localStorage.getItem(`password_${user.id}`)
      if (storedPassword !== password) {
        return { success: false, error: 'Invalid password. Please try again.' }
      }

      const token = generateToken(user.id)
      storeToken(token)
      storeCurrentUser(user)
      setUser(user)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const users = getStoredUsers()
      
      // Check if user already exists
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' }
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=3B82F6&color=fff`
      }

      // Store user and password
      users.push(newUser)
      storeUsers(users)
      localStorage.setItem(`password_${newUser.id}`, userData.password)

      // Auto-login after signup
      const token = generateToken(newUser.id)
      storeToken(token)
      storeCurrentUser(newUser)
      setUser(newUser)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const users = getStoredUsers()
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { success: false, error: 'No account found with this email address.' }
    }

    // In a real app, you'd send a password reset email
    // For demo purposes, we'll just return success
    return { success: true }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 