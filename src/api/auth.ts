import { apiFetch } from '@/lib/api'
import type { AuthResponse, User } from '@/types'

interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

interface LoginRequest {
  email: string
  password: string
}

export function register(body: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify(body) },
    { skipAuthRedirect: true },
  )
}

export function login(body: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
    { skipAuthRedirect: true },
  )
}

export function me(): Promise<User> {
  return apiFetch<User>('/api/auth/me', undefined, { skipAuthRedirect: true })
}
