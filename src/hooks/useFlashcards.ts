import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteSet,
  generateFlashcards,
  getSet,
  listSets,
  type GenerateFlashcardsRequest,
} from '@/api/flashcards'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { ApiError, FlashcardSet, FlashcardSetSummary } from '@/types'

/**
 * One saved set. Generating seeds this key with the response, so arriving straight from the
 * setup form costs no request; a direct visit or a refresh fetches it.
 */
export function useFlashcardSet(setId: string) {
  return useQuery<FlashcardSet, ApiError>({
    queryKey: ['flashcardSet', setId],
    queryFn: () => getSet(setId),
    enabled: setId.length > 0,
  })
}

export function useFlashcards(subjectId: string) {
  const { lang } = useLang()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['flashcardSets', subjectId],
    queryFn: () => listSets(subjectId),
    enabled: subjectId.length > 0,
  })

  const generateMutation = useMutation<FlashcardSet, ApiError, GenerateFlashcardsRequest>({
    mutationFn: (request) => generateFlashcards(subjectId, request),
    onSuccess: (set) => {
      // The response already holds the cards, so the study view needs no request of its own.
      queryClient.setQueryData(['flashcardSet', set.setId], set)
      queryClient.setQueryData<FlashcardSetSummary[]>(['flashcardSets', subjectId], (prev) => [
        set,
        ...(prev ?? []),
      ])
    },
    // No toast here - the form renders the no-material case as a friendly note, not a failure.
  })

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (setId) => deleteSet(setId),
    onSuccess: (_, setId) => {
      queryClient.setQueryData<FlashcardSetSummary[]>(['flashcardSets', subjectId], (prev) =>
        prev?.filter((set) => set.setId !== setId),
      )
      queryClient.removeQueries({ queryKey: ['flashcardSet', setId] })
      toast.success(t('flashcards.deleteSuccess', lang))
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  return {
    sets: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    deleteSet: deleteMutation.mutate,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  }
}
