import { useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useQuiz } from '@/hooks/useQuiz'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import QuizSetupForm from '@/components/QuizSetupForm'
import FlashCard from '@/components/FlashCard'
import { Button } from '@/components/ui/button'

function QuizPage() {
  const { subjectId = '' } = useParams()
  const { lang } = useLang()
  const { subjects } = useSubjects()
  const subject = subjects?.find((s) => s.id === subjectId)
  const {
    status,
    cards,
    currentIndex,
    goNext,
    goPrev,
    generate,
    reset,
    reviewAgain,
    error,
  } = useQuiz(subjectId)

  const isLast = currentIndex >= cards.length - 1
  const progressPct = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        backTo="/"
        compact
        title={
          <>
            <span className="max-w-full truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {subject?.displayName ?? subjectId}
            </span>
            <span className="max-w-full truncate text-xs text-muted-foreground">
              {subject?.displayNameSr}
            </span>
          </>
        }
        langLocked={status !== 'idle'}
        langLockedHint={t('quiz.langLocked', lang)}
      />

      {status === 'active' && (
        <div className="h-[3px] w-full shrink-0 bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-[350ms] ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        {status === 'idle' && <QuizSetupForm onGenerate={generate} error={error} />}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-[15px]">{t('quiz.generating', lang)}</p>
          </div>
        )}

        {status === 'active' && cards[currentIndex] && (
          <div className="flex w-full max-w-[600px] flex-col items-center">
            <FlashCard key={currentIndex} card={cards[currentIndex]} />
            <div className="mt-7 flex w-full items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="h-auto rounded-[11px] px-[18px] py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                {t('quiz.prev', lang)}
              </Button>
              <span className="text-sm font-semibold text-muted-foreground">
                {currentIndex + 1} / {cards.length}
              </span>
              <Button
                type="button"
                onClick={goNext}
                className="h-auto rounded-[11px] px-5 py-2.5 text-sm font-semibold"
              >
                {isLast ? t('quiz.finish', lang) : t('quiz.next', lang)}
              </Button>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex w-full max-w-[420px] flex-col items-center text-center">
            <div className="mb-[22px] flex size-13 items-center justify-center rounded-[14px] bg-primary/15 text-2xl text-primary">
              ✓
            </div>
            <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
              {t('quiz.doneTitle', lang)}
            </h1>
            <p className="mt-3 mb-[30px] text-[15px] text-muted-foreground">
              {t('quiz.doneSubtitle', lang)}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={reviewAgain}
                className="h-auto rounded-[11px] px-[18px] py-2.5 text-sm font-semibold"
              >
                {t('quiz.reviewAgain', lang)}
              </Button>
              <Button
                type="button"
                onClick={reset}
                className="h-auto rounded-xl px-6 py-3.5 text-[15px]"
              >
                {t('quiz.newQuiz', lang)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPage
