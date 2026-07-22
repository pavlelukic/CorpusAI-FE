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

/**
 * Any 401 means the token is dead. Shared with the SSE stream, which bypasses apiFetch.
 * Returns the error to throw so nothing proceeds while the redirect happens.
 */
export function clearAuthAndRedirect(): ApiError {
  clearToken()
  clearCachedUser()
  window.location.assign('/login')
  return { error: 'UNAUTHORIZED', message: 'Session expired' }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  const token = getToken()

  // Let the browser set Content-Type (with the multipart boundary) for FormData bodies;
  // forcing application/json here would corrupt document uploads.
  const isFormData = init?.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401 && !options?.skipAuthRedirect) {
    throw clearAuthAndRedirect()
  }

  if (!response.ok) {
    const body: ApiError = await response.json()
    throw body
  }

  // 204 (and other empty bodies) have nothing to parse — grant/revoke/archive/delete.
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  return response.json()
}
