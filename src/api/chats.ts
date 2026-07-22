import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL, apiFetch, clearAuthAndRedirect } from '@/lib/api'
import { getToken } from '@/lib/auth'
import type { Lang } from '@/lib/i18n'
import type {
  ApiError,
  ChatDone,
  ChatMessageResponse,
  ChatSession,
  ModelProvider,
} from '@/types'

interface CreateChatRequest {
  subjectId: string
  lang: Lang
  provider: ModelProvider
}

interface ChatChunkResponse {
  token: string
}

/** Raised when the stream closes before the `done` event, i.e. the reply never finished. */
export const STREAM_INCOMPLETE = 'STREAM_INCOMPLETE'

export function createChat(request: CreateChatRequest): Promise<ChatSession> {
  return apiFetch<ChatSession>('/api/chats', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listChats(subjectId: string): Promise<ChatSession[]> {
  return apiFetch<ChatSession[]>(`/api/chats?subjectId=${encodeURIComponent(subjectId)}`)
}

export function getMessages(sessionId: string): Promise<ChatMessageResponse[]> {
  return apiFetch<ChatMessageResponse[]>(`/api/chats/${sessionId}/messages`)
}

export function deleteChat(sessionId: string): Promise<void> {
  return apiFetch<void>(`/api/chats/${sessionId}`, { method: 'DELETE' })
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'error' in value && 'message' in value
}

function toApiError(err: unknown): ApiError {
  if (isApiError(err)) return err
  return { error: 'STREAM_FAILED', message: err instanceof Error ? err.message : String(err) }
}

interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (done: ChatDone) => void
  onError: (err: ApiError) => void
}

/** How long the stream may go without an event before it counts as dead. */
const IDLE_TIMEOUT_MS = 60_000

/**
 * Streams one turn of the conversation. Failures before the first token (403/404) arrive as a
 * normal JSON error body; after that the stream simply stops, so a close without a `done` event
 * is reported through onError as STREAM_INCOMPLETE. Returns an abort function.
 */
export function streamMessage(
  sessionId: string,
  message: string,
  { onToken, onDone, onError }: StreamCallbacks,
): () => void {
  const controller = new AbortController()
  const token = getToken()
  let sawDone = false
  let idleTimer: number | undefined

  function stopIdleTimer() {
    window.clearTimeout(idleTimer)
    idleTimer = undefined
  }

  // A connection can be left hanging with the answer already delivered but no `done` - waiting
  // out the server's 300s would leave the cursor blinking on a reply that is never coming.
  function restartIdleTimer() {
    stopIdleTimer()
    idleTimer = window.setTimeout(() => {
      if (sawDone) return
      onError({ error: STREAM_INCOMPLETE, message: 'The reply stopped arriving' })
      controller.abort()
    }, IDLE_TIMEOUT_MS)
  }

  fetchEventSource(`${API_BASE_URL}/api/chats/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
    // Without this the library aborts on tab-hide and re-issues the request on return, which
    // would persist the user message twice and start a second generation.
    openWhenHidden: true,
    async onopen(response) {
      if (response.ok) {
        restartIdleTimer()
        return
      }
      if (response.status === 401) throw clearAuthAndRedirect()
      throw await response.json().catch(() => ({
        error: 'SERVER_ERROR',
        message: `Chat stream failed with status ${response.status}`,
      }))
    },
    onmessage(event) {
      restartIdleTimer()
      if (event.event === 'token') {
        const chunk: ChatChunkResponse = JSON.parse(event.data)
        onToken(chunk.token)
      } else if (event.event === 'done') {
        sawDone = true
        stopIdleTimer()
        onDone(JSON.parse(event.data) as ChatDone)
      }
    },
    onclose() {
      stopIdleTimer()
      // The server closes immediately after `done`; closing without it means the turn died.
      if (!sawDone) {
        onError({ error: STREAM_INCOMPLETE, message: 'The reply did not finish streaming' })
      }
    },
    onerror(err) {
      stopIdleTimer()
      if (!controller.signal.aborted) onError(toApiError(err))
      // Rethrowing stops the library's automatic reconnect, which would re-send the message.
      throw err
    },
  }).catch(() => {
    // Reported through onError above; this only silences the rejection the throw creates.
  })

  return () => {
    stopIdleTimer()
    controller.abort()
  }
}
