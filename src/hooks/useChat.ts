import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMessages, streamMessage, STREAM_INCOMPLETE } from '@/api/chats'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { ApiError, ChatMessage, ChatMessageResponse } from '@/types'

export function useChat(sessionId: string) {
  const { lang } = useLang()
  const queryClient = useQueryClient()
  const transcriptKey = ['chatMessages', sessionId]

  const {
    data: history,
    isLoading,
    error,
  } = useQuery<ChatMessageResponse[], ApiError>({
    queryKey: transcriptKey,
    queryFn: () => getMessages(sessionId),
    enabled: sessionId.length > 0,
    // Only this tab writes to the transcript, and a refetch mid-turn would briefly show the
    // server's copy of a message that is still living in local state.
    refetchOnWindowFocus: false,
  })

  // The turn in flight. Completed turns move into the query cache, so this is empty at rest.
  const [live, setLive] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const cancelRef = useRef<(() => void) | null>(null)
  const streamedRef = useRef('')
  const lastSentRef = useRef('')

  useEffect(() => {
    return () => {
      cancelRef.current?.()
      cancelRef.current = null
    }
  }, [])

  function runStream(text: string) {
    streamedRef.current = ''
    lastSentRef.current = text
    setLive([
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ])
    setIsStreaming(true)

    cancelRef.current = streamMessage(sessionId, text, {
      onToken: (token) => {
        streamedRef.current += token
        setLive((prev) => {
          if (prev.length === 0) return prev
          const updated = [...prev]
          const last = updated[updated.length - 1]
          updated[updated.length - 1] = { ...last, content: last.content + token }
          return updated
        })
      },
      onDone: (done) => {
        cancelRef.current = null
        setIsStreaming(false)

        // Write the finished turn in from the `done` payload so the stats appear immediately,
        // then refetch: the server holds the real message ids and the model that actually ran,
        // neither of which the stream tells us.
        const now = new Date().toISOString()
        queryClient.setQueryData<ChatMessageResponse[]>(transcriptKey, (cached) => [
          ...(cached ?? []),
          {
            id: `local-${done.messageId}`,
            role: 'USER',
            content: text,
            createdAt: now,
            inputTokens: null,
            outputTokens: null,
            latencyMs: null,
            model: null,
          },
          {
            id: done.messageId,
            role: 'ASSISTANT',
            content: streamedRef.current,
            createdAt: now,
            inputTokens: done.inputTokens,
            outputTokens: done.outputTokens,
            latencyMs: done.latencyMs,
            model: null,
          },
        ])
        setLive([])
        queryClient.invalidateQueries({ queryKey: transcriptKey })
        // The server titles a session from its first message, so the list is now stale.
        queryClient.invalidateQueries({ queryKey: ['chats'] })
      },
      onError: (err) => {
        cancelRef.current = null
        setIsStreaming(false)
        // Leave the half-written reply on screen, flagged, rather than dropping what arrived.
        setLive((prev) =>
          prev.map((message, i) =>
            i === prev.length - 1 && message.role === 'assistant'
              ? { ...message, failed: true }
              : message,
          ),
        )
        if (err.error !== STREAM_INCOMPLETE) {
          toast.error(err.message || t('error.generic', lang))
        }
      },
    })
  }

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    runStream(trimmed)
  }

  /** Re-sends the last message. The backend already stored it, so the transcript will hold both. */
  function retry() {
    if (isStreaming || !lastSentRef.current) return
    runStream(lastSentRef.current)
  }

  const messages: ChatMessage[] = [
    ...(history ?? []).map((message) => ({
      id: message.id,
      role: message.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: message.content,
      // latencyMs is the presence signal: the token counts can be null on their own when a
      // provider reports none, but a recorded turn always has a latency.
      usage:
        message.latencyMs === null
          ? undefined
          : {
              inputTokens: message.inputTokens,
              outputTokens: message.outputTokens,
              latencyMs: message.latencyMs,
              model: message.model,
            },
    })),
    ...live,
  ]

  return { messages, isStreaming, isLoading, error, send, retry }
}
