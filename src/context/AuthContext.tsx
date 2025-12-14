import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: Record<string, { password: string; user: User }> = {
  'student@canteen.com': {
    password: 'password123',
    user: {
      id: '1',
      email: 'student@canteen.com',
      name: 'John Doe',
      role: 'student',
      profileComplete: false,
      walletBalance: 500,
    },
  },
  'admin@canteen.com': {
    password: 'password123',
    user: {
      id: '2',
      email: 'admin@canteen.com',
      name: 'Admin User',
      role: 'admin',
      profileComplete: true,
      walletBalance: 0,
    },
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const userData = mockUsers[email.toLowerCase()]
    
    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password')
    }

    const loggedInUser = { ...userData.user }
    setUser(loggedInUser)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    localStorage.setItem('auth_token', `token_${Date.now()}`)
    
    return loggedInUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('canteen_cart')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    // Also update in mockUsers if needed
    if (mockUsers[updatedUser.email]) {
      mockUsers[updatedUser.email].user = updatedUser
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
