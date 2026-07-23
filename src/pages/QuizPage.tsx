import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useQuiz, useSubmitQuiz } from '@/hooks/useQuizzes'
import { t } from '@/lib/i18n'
import type { ApiError, QuizAnswer } from '@/types'
import AppHeader from '@/components/AppHeader'
import QuizProgress from '@/components/QuizProgress'
import QuizQuestion from '@/components/QuizQuestion'
import QuizResults from '@/components/QuizResults'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function QuizPage() {
  const { quizId = '' } = useParams()
  // Remounting resets the in-progress answers when moving between quizzes, without an effect.
  return <QuizView key={quizId} quizId={quizId} />
}

function QuizView({ quizId }: { quizId: string }) {
  const { lang, setLang } = useLang()
  const { subjects } = useSubjects()
  const { data: quiz, isLoading, error } = useQuiz(quizId)
  const { mutate: submit, isPending: isSubmitting } = useSubmitQuiz(quizId)
  const subject = subjects?.find((s) => s.id === quiz?.subjectId)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  // A quiz owns its language, so opening one hands the interface that language - including on a
  // direct visit or refresh, where nothing else has had the chance to set it.
  useEffect(() => {
    if (quiz && quiz.lang !== lang) setLang(quiz.lang)
  }, [quiz, lang, setLang])

  if (error) {
    return <QuizError error={error} />
  }

  const completed = quiz?.completedAt != null
  const questions = quiz?.questions ?? []
  const answeredCount = Object.keys(answers).length
  const blanks = questions.length - answeredCount
  const backTo = quiz ? `/subjects/${quiz.subjectId}/quizzes` : '/'

  function handleSubmitClick() {
    if (answeredCount === 0) {
      toast.error(t('quiz.needAnswer', lang))
      return
    }
    setConfirmOpen(true)
  }

  function doSubmit() {
    setConfirmOpen(false)
    const payload: QuizAnswer[] = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex,
    }))
    submit(payload)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        backTo={backTo}
        compact
        title={
          <>
            <span className="max-w-full truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {subject?.displayName ?? quiz?.subjectId ?? ''}
            </span>
            <span className="flex max-w-full items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">{subject?.displayNameSr}</span>
              {quiz && (
                <span className="max-w-[50%] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  {quiz.topic ?? t('quiz.wholeSubject', lang)}
                </span>
              )}
            </span>
          </>
        }
        langLocked
        langLockedHint={t('quiz.langLocked', lang)}
      />

      {quiz && !completed && <QuizProgress answered={answeredCount} total={questions.length} />}

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-6 py-8 sm:py-10">
          {isLoading && (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[220px] rounded-2xl" />
              ))}
            </div>
          )}

          {quiz && completed && <QuizResults quiz={quiz} />}

          {quiz && !completed && (
            <div className="flex flex-col gap-4">
              {questions.map((question, i) => (
                <QuizQuestion
                  key={question.id}
                  index={i}
                  total={questions.length}
                  question={question}
                  mode="taking"
                  selectedIndex={answers[question.id]}
                  onSelect={(optionIndex) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {quiz && !completed && (
        <div className="shrink-0 border-t border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-[760px] items-center justify-between gap-4 px-6 py-3.5">
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {t('quiz.progressAnswered', lang, {
                answered: String(answeredCount),
                total: String(questions.length),
              })}
            </span>
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="h-11 rounded-xl px-6 text-[15px]"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? t('quiz.submitting', lang) : t('quiz.submit', lang)}
              </Button>
              <span className="text-[11px] text-muted-foreground">{t('quiz.submitOnce', lang)}</span>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quiz.submitConfirm.title', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {blanks > 0
                ? t('quiz.submitConfirm.bodyBlanks', lang, { n: String(blanks) })
                : t('quiz.submitConfirm.bodyFinal', lang)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
            <Button onClick={doSubmit}>{t('quiz.submitConfirm.confirm', lang)}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function QuizError({ error }: { error: ApiError }) {
  const { lang } = useLang()
  const known = error.error === 'FORBIDDEN' || error.error === 'NOT_FOUND'
  const forbidden = error.error === 'FORBIDDEN'

  const title = forbidden ? 'forbidden.title' : known ? 'quiz.notFound.title' : 'error.boundaryTitle'
  const subtitle = forbidden
    ? 'quiz.forbidden.subtitle'
    : known
      ? 'quiz.notFound.subtitle'
      : 'error.generic'

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex max-w-[440px] flex-col items-center px-6 pt-32 text-center">
        <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
          {t(title, lang)}
        </h1>
        <p className="mt-3 mb-8 text-[15px] text-muted-foreground">{t(subtitle, lang)}</p>
        {known ? (
          <Button asChild size="lg" className="h-auto rounded-xl px-6 py-3.5 text-[15px]">
            <Link to="/">{t('notFound.backHome', lang)}</Link>
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-auto rounded-xl px-6 py-3.5 text-[15px]"
            onClick={() => window.location.reload()}
          >
            {t('error.reload', lang)}
          </Button>
        )}
      </div>
    </div>
  )
}

export default QuizPage
