import { apiFetch } from '@/lib/api'
import type { Flashcard } from '@/types'

export function generateQuiz(
  subjectId: string,
  topic?: string,
  count?: number,
): Promise<Flashcard[]> {
  return apiFetch<Flashcard[]>(`/api/quiz/${subjectId}/generate`, {
    method: 'POST',
    body: JSON.stringify({ topic, count }),
  })
}
