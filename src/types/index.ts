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
