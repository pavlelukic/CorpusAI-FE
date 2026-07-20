import type { User } from '@/types'

const TOKEN_KEY = 'corpusai_token'
const USER_KEY = 'corpusai_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getCachedUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setCachedUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearCachedUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function sweepLegacyChatKeys(): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('chat_session_') || key.startsWith('chat_messages_'))) {
      localStorage.removeItem(key)
    }
  }
}