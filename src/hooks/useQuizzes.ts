import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteQuiz,
  generateQuiz,
  getQuiz,
  listQuizzes,
  submitQuiz,
  type GenerateQuizRequest,
} from '@/api/quizzes'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type {
  ApiError,
  Quiz,
  QuizAnswer,
  QuizDetail,
  QuizSubmissionResponse,
  QuizSummary,
} from '@/types'

/**
 * One quiz in full. Generating seeds this key, so arriving straight from the setup form costs no
 * request; a direct visit or a refresh fetches it. Submitting merges the grading in place too.
 */
export function useQuiz(quizId: string) {
  return useQuery<QuizDetail, ApiError>({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId),
    enabled: quizId.length > 0,
  })
}

export function useQuizzes(subjectId: string) {
  const { lang } = useLang()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['quizzes', subjectId],
    queryFn: () => listQuizzes(subjectId),
    enabled: subjectId.length > 0,
  })

  const generateMutation = useMutation<Quiz, ApiError, GenerateQuizRequest>({
    mutationFn: (request) => generateQuiz(subjectId, request),
    onSuccess: (quiz) => {
      // A fresh quiz is always in the taking state; seed a detail so the take view needs no fetch.
      const detail: QuizDetail = {
        quizId: quiz.quizId,
        subjectId: quiz.subjectId,
        topic: quiz.topic,
        lang: quiz.lang,
        provider: quiz.provider,
        questionCount: quiz.questions.length,
        score: null,
        completedAt: null,
        createdAt: quiz.createdAt,
        questions: quiz.questions,
      }
      queryClient.setQueryData(['quiz', quiz.quizId], detail)
      queryClient.setQueryData<QuizSummary[]>(['quizzes', subjectId], (prev) => [
        {
          quizId: quiz.quizId,
          subjectId: quiz.subjectId,
          topic: quiz.topic,
          lang: quiz.lang,
          provider: quiz.provider,
          questionCount: quiz.questions.length,
          score: null,
          completedAt: null,
          createdAt: quiz.createdAt,
        },
        ...(prev ?? []),
      ])
    },
    // No toast here - the form renders the no-material case as a friendly note, not a failure.
  })

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (quizId) => deleteQuiz(quizId),
    onSuccess: (_, quizId) => {
      queryClient.setQueryData<QuizSummary[]>(['quizzes', subjectId], (prev) =>
        prev?.filter((quiz) => quiz.quizId !== quizId),
      )
      queryClient.removeQueries({ queryKey: ['quiz', quizId] })
      toast.success(t('quiz.deleteSuccess', lang))
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  return {
    quizzes: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    deleteQuiz: deleteMutation.mutate,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  }
}

/**
 * Submitting is final. The response carries the grading but not the taker's own picks, so those
 * are merged back from the submitted answers - giving a complete results view without a refetch.
 */
export function useSubmitQuiz(quizId: string) {
  const { lang } = useLang()
  const queryClient = useQueryClient()

  return useMutation<QuizSubmissionResponse, ApiError, QuizAnswer[]>({
    mutationFn: (answers) => submitQuiz(quizId, answers),
    onSuccess: (response, answers) => {
      const current = queryClient.getQueryData<QuizDetail>(['quiz', quizId])
      if (!current) return

      const resultByQuestion = new Map(response.results.map((r) => [r.questionId, r]))
      const selectedByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedIndex]))
      const completedAt = new Date().toISOString()

      const merged: QuizDetail = {
        ...current,
        score: response.score,
        completedAt,
        questions: current.questions.map((question) => {
          const result = resultByQuestion.get(question.id)
          return {
            ...question,
            selectedIndex: selectedByQuestion.get(question.id),
            correct: result?.correct,
            correctIndex: result?.correctIndex,
            explanation: result?.explanation ?? undefined,
          }
        }),
      }
      queryClient.setQueryData(['quiz', quizId], merged)
      queryClient.setQueryData<QuizSummary[]>(['quizzes', current.subjectId], (prev) =>
        prev?.map((quiz) =>
          quiz.quizId === quizId ? { ...quiz, score: response.score, completedAt } : quiz,
        ),
      )
    },
    onError: (err) => {
      // The page only shows Submit while completedAt is null, so a 409 means the server already
      // has a result the client missed; surface it and refetch into the results state.
      if (err?.error === 'CONFLICT') {
        toast.error(t('quiz.alreadySubmitted', lang))
        queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
        return
      }
      toast.error(err?.message || t('error.generic', lang))
    },
  })
}
