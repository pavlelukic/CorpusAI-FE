import { Link, useParams } from 'react-router'
import { Loader2, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useQuiz } from '@/hooks/useQuiz'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import QuizSetupForm from '@/components/QuizSetupForm'
import FlashCard from '@/components/FlashCard'
import { Button } from '@/components/ui/button'

function QuizPage() {
  const { subjectId = '' } = useParams()
  const { lang, toggleLang } = useLang()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
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
      <header className="grid h-15 flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background/85 px-5 backdrop-blur-md backdrop-saturate-150">
        <Link
          to="/"
          aria-label="Back"
          className="flex size-9 items-center justify-center justify-self-start rounded-[9px] border border-border bg-card text-foreground"
        >
          ←
        </Link>
        <div className="flex flex-col items-center leading-[1.15]">
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            {subject?.displayName ?? subjectId}
          </span>
          <span className="text-xs text-muted-foreground">{subject?.displayNameSr}</span>
        </div>
        <div className="flex items-center justify-self-end gap-2">
          <div className="flex h-[34px] items-center overflow-hidden rounded-[9px] border border-border">
            <button
              type="button"
              onClick={() => lang !== 'en' && toggleLang()}
              className={cn(
                'h-[34px] px-3 text-xs font-semibold tracking-[0.02em]',
                lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              EN
            </button>
            <div className="h-[34px] w-px bg-border" />
            <button
              type="button"
              onClick={() => lang !== 'sr' && toggleLang()}
              className={cn(
                'h-[34px] px-3 text-xs font-semibold tracking-[0.02em]',
                lang === 'sr' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              SR
            </button>
          </div>
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex size-[34px] items-center justify-center rounded-[9px] border border-border bg-card text-muted-foreground"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

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
