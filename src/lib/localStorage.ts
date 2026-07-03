import type { Lang } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

const sessionKey = (subjectId: string, lang: Lang) => `chat_session_${subjectId}_${lang}`
const messagesKey = (subjectId: string, lang: Lang) => `chat_messages_${subjectId}_${lang}`

export function getChatSession(subjectId: string, lang: Lang): string | null {
  return localStorage.getItem(sessionKey(subjectId, lang))
}

export function setChatSession(subjectId: string, lang: Lang, id: string): void {
  localStorage.setItem(sessionKey(subjectId, lang), id)
}

export function getChatMessages(subjectId: string, lang: Lang): ChatMessage[] {
  const raw = localStorage.getItem(messagesKey(subjectId, lang))
  return raw ? JSON.parse(raw) : []
}

export function setChatMessages(subjectId: string, lang: Lang, messages: ChatMessage[]): void {
  localStorage.setItem(messagesKey(subjectId, lang), JSON.stringify(messages))
}

export function clearChat(subjectId: string, lang: Lang): void {
  localStorage.removeItem(sessionKey(subjectId, lang))
  localStorage.removeItem(messagesKey(subjectId, lang))
}
