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

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
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
