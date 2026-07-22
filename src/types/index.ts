import type { Lang } from '@/lib/i18n'

export interface Subject {
  id: string
  displayName: string
  displayNameSr: string
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface Flashcard {
  question: string
  answer: string
  sourceHint: string | null
  difficulty: Difficulty
}

export type ModelProvider = 'OPENAI' | 'ANTHROPIC'

export interface ChatSession {
  id: string
  /** null until the first message is sent - the server derives the title from it. */
  title: string | null
  subjectId: string
  lang: Lang
  provider: ModelProvider
  createdAt: string
}

export interface ChatMessageResponse {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

/** Payload of the SSE `done` event, which fires once just before the stream closes. */
export interface ChatDone {
  messageId: string
  inputTokens: number | null
  outputTokens: number | null
  latencyMs: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id?: string
  /** Only live replies carry usage - the backend doesn't store it per message. */
  usage?: ChatDone
  /** The stream ended without `done`, so the reply is incomplete and retryable. */
  failed?: boolean
}

export interface ApiError {
  error: string
  message: string
}

export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  displayName: string
  role: Role
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: Role
  subjectIds: string[]
}

export interface AdminSubject {
  id: string
  displayName: string
  displayNameSr: string
  systemPrompt: string | null
  archived: boolean
  createdAt: string
}

export interface SubjectRequest {
  displayName: string
  displayNameSr: string
  systemPrompt?: string | null
}

export type DocumentStatus = 'PENDING' | 'INGESTING' | 'READY' | 'FAILED'

export interface DocumentResponse {
  id: string
  fileName: string
  status: DocumentStatus
  uploadedAt: string
  errorMessage: string | null
}
