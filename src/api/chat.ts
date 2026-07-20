import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL } from '@/lib/api'
import { getToken } from '@/lib/auth'
import type { Lang } from '@/lib/i18n'

interface ChatChunkResponse {
  token: string
}

export function streamChat(
  subjectId: string,
  sessionId: string,
  message: string,
  lang: Lang,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: unknown) => void,
): () => void {
  const controller = new AbortController()
  const token = getToken()

  fetchEventSource(`${API_BASE_URL}/api/chat/${subjectId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sessionId, message, lang }),
    signal: controller.signal,
    async onopen(response) {
      if (!response.ok) {
        throw new Error(`Chat stream failed with status ${response.status}`)
      }
    },
    onmessage(event) {
      const chunk: ChatChunkResponse = JSON.parse(event.data)
      onToken(chunk.token)
    },
    onclose() {
      onDone()
    },
    onerror(err) {
      if (!controller.signal.aborted) onError(err)
      throw err
    },
  }).catch(() => {
    // errors are already reported via onerror above; this only
    // silences the unhandled rejection once the stream ends
  })

  return () => controller.abort()
}
