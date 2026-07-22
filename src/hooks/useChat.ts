import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMessages, streamMessage, STREAM_INCOMPLETE } from '@/api/chats'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { ApiError, ChatDone, ChatMessage, ChatMessageResponse } from '@/types'

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

  // Usage lives in the query cache rather than component state so it survives leaving the
  // conversation and coming back. Keyed by the id the `done` event reports, which is the id the
  // server returns for that message, so it also survives a transcript refetch. A reload starts
  // empty on purpose - the backend stores no usage per message, so older replies have none.
  const usageKey = ['chatUsage', sessionId]
  const usageById = queryClient.getQueryData<Record<string, ChatDone>>(usageKey) ?? {}

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
        queryClient.setQueryData<Record<string, ChatDone>>(usageKey, (prev) => ({
          ...prev,
          [done.messageId]: done,
        }))

        const now = new Date().toISOString()
        queryClient.setQueryData<ChatMessageResponse[]>(transcriptKey, (cached) => [
          ...(cached ?? []),
          // The user message's real id is never sent to us; a refetch replaces this one.
          { id: `local-${done.messageId}`, role: 'USER', content: text, createdAt: now },
          { id: done.messageId, role: 'ASSISTANT', content: streamedRef.current, createdAt: now },
        ])
        setLive([])
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
      usage: usageById[message.id],
    })),
    ...live,
  ]

  return { messages, isStreaming, isLoading, error, send, retry }
}
