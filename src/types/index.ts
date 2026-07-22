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

/** A row in the history list - the same set without its cards. */
export interface FlashcardSetSummary {
  setId: string
  subjectId: string
  /** null when the set covers the whole subject rather than one topic. */
  topic: string | null
  lang: Lang
  provider: ModelProvider
  createdAt: string
}

export interface FlashcardSet extends FlashcardSetSummary {
  cards: Flashcard[]
}

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
  // Null on user messages, on replies stored before the backend recorded usage, and when the
  // usage row failed to write. Token counts are also null on their own when a provider reports
  // none, so each field is guarded separately.
  inputTokens: number | null
  outputTokens: number | null
  latencyMs: number | null
  model: string | null
}

/** What the stats line under a completed assistant reply renders. */
export interface ChatUsage {
  inputTokens: number | null
  outputTokens: number | null
  latencyMs: number
  model: string | null
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
  usage?: ChatUsage
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
