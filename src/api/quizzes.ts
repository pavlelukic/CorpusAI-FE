import { apiFetch } from '@/lib/api'
import type { Lang } from '@/lib/i18n'
import type {
  ModelProvider,
  Quiz,
  QuizAnswer,
  QuizDetail,
  QuizSubmissionResponse,
  QuizSummary,
} from '@/types'

export interface GenerateQuizRequest {
  /** Omitted for a whole-subject quiz; the server also normalises blank to null. */
  topic?: string
  count: number
  lang: Lang
  provider: ModelProvider
}

/**
 * A live LLM call that retries internally on an unusable response, so it can take considerably
 * longer than one round trip. Returns the finished quiz, questions without answers.
 */
export function generateQuiz(subjectId: string, request: GenerateQuizRequest): Promise<Quiz> {
  return apiFetch<Quiz>(`/api/quizzes/${subjectId}/generate`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listQuizzes(subjectId: string): Promise<QuizSummary[]> {
  return apiFetch<QuizSummary[]>(`/api/quizzes?subjectId=${encodeURIComponent(subjectId)}`)
}

export function getQuiz(quizId: string): Promise<QuizDetail> {
  return apiFetch<QuizDetail>(`/api/quizzes/${quizId}`)
}

/** The only path that reveals the answers. One submit per quiz; a second is a 409. */
export function submitQuiz(
  quizId: string,
  answers: QuizAnswer[],
): Promise<QuizSubmissionResponse> {
  return apiFetch<QuizSubmissionResponse>(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export function deleteQuiz(quizId: string): Promise<void> {
  return apiFetch<void>(`/api/quizzes/${quizId}`, { method: 'DELETE' })
}
