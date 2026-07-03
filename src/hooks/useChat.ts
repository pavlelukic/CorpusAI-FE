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
import { t } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

export function useChat(subjectId: string) {
  const { lang } = useLang()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesRef = useRef<ChatMessage[]>([])
  const sessionIdRef = useRef<string>('')
  const cancelStreamRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let sessionId = getChatSession(subjectId, lang)
    if (!sessionId) {
      sessionId = uuidv4()
      setChatSession(subjectId, lang, sessionId)
    }
    sessionIdRef.current = sessionId

    const stored = getChatMessages(subjectId, lang)
    messagesRef.current = stored
    setMessages(stored)
    setIsStreaming(false)

    return () => {
      cancelStreamRef.current?.()
      cancelStreamRef.current = null
    }
  }, [subjectId, lang])

  function updateMessages(next: ChatMessage[]) {
    messagesRef.current = next
    setMessages(next)
  }

  function send(message: string) {
    const trimmed = message.trim()
    if (!trimmed || isStreaming) return

    const next: ChatMessage[] = [
      ...messagesRef.current,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '' },
    ]
    updateMessages(next)
    setChatMessages(subjectId, lang, next)
    setIsStreaming(true)

    cancelStreamRef.current = streamChat(
      subjectId,
      sessionIdRef.current,
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
