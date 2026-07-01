import type { ChatMessage } from '@/types'

const sessionKey = (subjectId: string) => `chat_session_${subjectId}`
const messagesKey = (subjectId: string) => `chat_messages_${subjectId}`

export function getChatSession(subjectId: string): string | null {
  return localStorage.getItem(sessionKey(subjectId))
}

export function setChatSession(subjectId: string, id: string): void {
  localStorage.setItem(sessionKey(subjectId), id)
}

export function getChatMessages(subjectId: string): ChatMessage[] {
  const raw = localStorage.getItem(messagesKey(subjectId))
  return raw ? JSON.parse(raw) : []
}

export function setChatMessages(subjectId: string, messages: ChatMessage[]): void {
  localStorage.setItem(messagesKey(subjectId), JSON.stringify(messages))
}

export function clearChat(subjectId: string): void {
  localStorage.removeItem(sessionKey(subjectId))
  localStorage.removeItem(messagesKey(subjectId))
}
