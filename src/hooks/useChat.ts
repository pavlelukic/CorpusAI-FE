import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { streamChat } from '@/api/chat'
import {
  clearChat as clearStoredChat,
  getChatMessages,
  getChatSession,
  setChatMessages,
  setChatSession,
} from '@/lib/localStorage'
import { useLang } from '@/lib/LangContext'
import { t, type Lang } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

function loadSessionId(subjectId: string, lang: Lang): string {
  const existing = getChatSession(subjectId, lang)
  if (existing) return existing
  const created = uuidv4()
  setChatSession(subjectId, lang, created)
  return created
}

export function useChat(subjectId: string) {
  const { lang } = useLang()
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages(subjectId, lang))
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesRef = useRef<ChatMessage[]>(messages)
  const sessionIdRef = useRef<string | null>(null)
  if (sessionIdRef.current === null) {
    sessionIdRef.current = loadSessionId(subjectId, lang)
  }
  const cancelStreamRef = useRef<(() => void) | null>(null)

  // subjectId/lang changes are handled by remounting via a `key`, not here.
  useEffect(() => {
    return () => {
      cancelStreamRef.current?.()
      cancelStreamRef.current = null
    }
  }, [])

  function updateMessages(next: ChatMessage[]) {
    messagesRef.current = next
    setMessages(next)
  }

  function send(message: string) {
    const trimmed = message.trim()
    if (!trimmed || isStreaming) return

    const withUserMessage: ChatMessage[] = [...messagesRef.current, { role: 'user', content: trimmed }]
    const withPlaceholder: ChatMessage[] = [
      ...withUserMessage,
      { role: 'assistant', content: '' },
    ]

    updateMessages(withPlaceholder)
    // Persist only the user message — avoids a stray empty assistant bubble if the
    // stream never finishes. The full pair is persisted once onDone fires.
    setChatMessages(subjectId, lang, withUserMessage)
    setIsStreaming(true)

    cancelStreamRef.current = streamChat(
      subjectId,
      sessionIdRef.current!, // always initialized by the lazy-init check above
      trimmed,
      lang,
      (token) => {
        const updated = [...messagesRef.current]
        const last = updated[updated.length - 1]
        updated[updated.length - 1] = { ...last, content: last.content + token }
        updateMessages(updated)
      },
      () => {
        setIsStreaming(false)
        cancelStreamRef.current = null
        setChatMessages(subjectId, lang, messagesRef.current)
      },
      () => {
        setIsStreaming(false)
        cancelStreamRef.current = null
        toast.error(t('error.generic', lang))
      },
    )
  }

  function clearChat() {
    cancelStreamRef.current?.()
    cancelStreamRef.current = null
    clearStoredChat(subjectId, lang)
    const newSessionId = uuidv4()
    setChatSession(subjectId, lang, newSessionId)
    sessionIdRef.current = newSessionId
    setIsStreaming(false)
    updateMessages([])
  }

  return { messages, isStreaming, send, clearChat }
}