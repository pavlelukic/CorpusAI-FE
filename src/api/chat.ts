import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL } from '@/lib/api'

export function streamChat(
  subjectId: string,
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: unknown) => void,
): () => void {
  const controller = new AbortController()

  fetchEventSource(`${API_BASE_URL}/api/chat/${subjectId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
    signal: controller.signal,
    async onopen(response) {
      if (!response.ok) {
        throw new Error(`Chat stream failed with status ${response.status}`)
      }
    },
    onmessage(event) {
      if (event.data === '[DONE]') {
        onDone()
        return
      }
      onToken(event.data)
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
