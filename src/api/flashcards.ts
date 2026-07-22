import { apiFetch } from '@/lib/api'
import type { Lang } from '@/lib/i18n'
import type { FlashcardSet, FlashcardSetSummary, ModelProvider } from '@/types'

export interface GenerateFlashcardsRequest {
  /** Omitted for a whole-subject set; the server also normalises blank to null. */
  topic?: string
  count: number
  lang: Lang
  provider: ModelProvider
}

/**
 * A live LLM call that retries internally on an unusable response, so it can take considerably
 * longer than one round trip. Returns the finished set, cards included.
 */
export function generateFlashcards(
  subjectId: string,
  request: GenerateFlashcardsRequest,
): Promise<FlashcardSet> {
  return apiFetch<FlashcardSet>(`/api/flashcards/${subjectId}/generate`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function listSets(subjectId: string): Promise<FlashcardSetSummary[]> {
  return apiFetch<FlashcardSetSummary[]>(
    `/api/flashcards?subjectId=${encodeURIComponent(subjectId)}`,
  )
}

export function getSet(setId: string): Promise<FlashcardSet> {
  return apiFetch<FlashcardSet>(`/api/flashcards/${setId}`)
}

export function deleteSet(setId: string): Promise<void> {
  return apiFetch<void>(`/api/flashcards/${setId}`, { method: 'DELETE' })
}
