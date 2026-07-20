import type { ApiError } from '@/types'
import { clearCachedUser, clearToken, getToken } from '@/lib/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface ApiFetchOptions {
  /**
   * Skip the global "401 → clear auth and redirect to /login" behavior. Used by the auth
   * endpoints: a login 401 is a wrong-credentials message the form must show, and the boot
   * me() check clears auth quietly on its own rather than hard-reloading mid-render.
   */
  skipAuthRedirect?: boolean
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401 && !options?.skipAuthRedirect) {
    clearToken()
    clearCachedUser()
    window.location.assign('/login')
    // Reject the caller's promise so nothing proceeds while the redirect happens.
    throw { error: 'UNAUTHORIZED', message: 'Session expired' } satisfies ApiError
  }

  if (!response.ok) {
    const body: ApiError = await response.json()
    throw body
  }

  return response.json()
}
