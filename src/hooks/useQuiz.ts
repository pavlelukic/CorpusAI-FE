import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateQuiz } from '@/api/quiz'
import { useLang } from '@/lib/LangContext'
import type { ApiError, Flashcard } from '@/types'

type QuizStatus = 'idle' | 'loading' | 'active' | 'done'

interface GenerateParams {
  topic?: string
  count?: number
}

export function useQuiz(subjectId: string) {
  const { lang } = useLang()
  const [status, setStatus] = useState<QuizStatus>('idle')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const mutation = useMutation<Flashcard[], ApiError, GenerateParams>({
    mutationFn: ({ topic, count }) => generateQuiz(subjectId, lang, topic, count),
    onSuccess: (data) => {
      setCards(data)
      setCurrentIndex(0)
      setStatus('active')
    },
    onError: () => {
      setStatus('idle')
    },
  })

  function generate(topic?: string, count?: number) {
    setStatus('loading')
    mutation.mutate({ topic, count })
  }

  function goNext() {
    if (currentIndex >= cards.length - 1) {
      setStatus('done')
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }

  function goPrev() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  function reviewAgain() {
    setCurrentIndex(0)
    setStatus('active')
  }

  function reset() {
    setStatus('idle')
    setCards([])
    setCurrentIndex(0)
    mutation.reset()
  }

  return {
    status,
    cards,
    currentIndex,
    goNext,
    goPrev,
    generate,
    reset,
    reviewAgain,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
