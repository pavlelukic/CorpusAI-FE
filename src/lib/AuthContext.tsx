import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  clearCachedUser,
  clearToken,
  getCachedUser,
  getToken,
  setCachedUser,
  setToken,
  sweepLegacyChatKeys,
} from '@/lib/auth'
import { login as loginRequest, me, register as registerRequest } from '@/api/auth'
import type { AuthResponse, User } from '@/types'

interface AuthContextValue {
  user: User | null
  /** True while the boot-time me() check is in flight; guards should wait it out. */
  isBootstrapping: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, displayName: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Hydrate optimistically from the cached user so a valid session paints instantly;
  // the effect below re-validates the token against the server.
  const [user, setUser] = useState<User | null>(() => (getToken() ? getCachedUser() : null))
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => getToken() !== null)

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    me()
      .then((freshUser) => {
        if (cancelled) return
        setCachedUser(freshUser)
        setUser(freshUser)
      })
      .catch(() => {
        // Stale/invalid token — silent logout (me() opts out of the global redirect).
        if (cancelled) return
        clearToken()
        clearCachedUser()
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function persistAuth(response: AuthResponse): User {
    setToken(response.token)
    setCachedUser(response.user)
    sweepLegacyChatKeys()
    setUser(response.user)
    return response.user
  }

  async function login(email: string, password: string): Promise<User> {
    return persistAuth(await loginRequest({ email, password }))
  }

  async function register(email: string, password: string, displayName: string): Promise<User> {
    return persistAuth(await registerRequest({ email, password, displayName }))
  }

  function logout(): void {
    clearToken()
    clearCachedUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isBootstrapping, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
