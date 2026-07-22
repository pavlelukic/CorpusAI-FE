import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useFlashcardSet } from '@/hooks/useFlashcards'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/types'
import AppHeader from '@/components/AppHeader'
import FlashCard from '@/components/FlashCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function FlashcardSetPage() {
  const { setId = '' } = useParams()
  // Remounting resets the card index when moving between sets, without an effect.
  return <FlashcardSetView key={setId} setId={setId} />
}

function FlashcardSetView({ setId }: { setId: string }) {
  const { lang, setLang } = useLang()
  const { subjects } = useSubjects()
  const { data: set, isLoading, error } = useFlashcardSet(setId)
  const subject = subjects?.find((s) => s.id === set?.subjectId)

  const [index, setIndex] = useState(0)
  const [isDone, setIsDone] = useState(false)

  // A set's language is fixed, so studying one hands the interface that language - including
  // on a direct visit, where nothing else has had the chance to set it.
  useEffect(() => {
    if (set && set.lang !== lang) setLang(set.lang)
  }, [set, lang, setLang])

  if (error) {
    return <FlashcardSetError error={error} />
  }

  const cards = set?.cards ?? []
  const isLast = index >= cards.length - 1
  const progressPct = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0
  const backTo = set ? `/subjects/${set.subjectId}/flashcards` : '/'

  function goNext() {
    if (isLast) {
      setIsDone(true)
      return
    }
    setIndex((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        backTo={backTo}
        compact
        title={
          <>
            <span className="max-w-full truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {subject?.displayName ?? set?.subjectId ?? ''}
            </span>
            <span className="flex max-w-full items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
              <span className="truncate">{subject?.displayNameSr}</span>
              {set && (
                <span className="max-w-[50%] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  {set.topic ?? t('flashcards.wholeSubject', lang)}
                </span>
              )}
            </span>
          </>
        }
        langLocked
        langLockedHint={t('flashcards.langLocked', lang)}
      />

      {!isDone && cards.length > 0 && (
        <div className="h-[3px] w-full shrink-0 bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-[350ms] ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto px-6 py-10">
        {isLoading && <Skeleton className="aspect-[4/5] w-full max-w-[600px] rounded-[20px] sm:aspect-[3/2]" />}

        {!isLoading && !isDone && cards[index] && (
          <div className="flex w-full max-w-[600px] flex-col items-center">
            <FlashCard key={index} card={cards[index]} />
            <div className="mt-7 flex w-full items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                disabled={index === 0}
                className="h-auto rounded-[11px] px-[18px] py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                {t('flashcards.prev', lang)}
              </Button>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                {index + 1} / {cards.length}
              </span>
              <Button
                type="button"
                onClick={goNext}
                className="h-auto rounded-[11px] px-5 py-2.5 text-sm font-semibold"
              >
                {isLast ? t('flashcards.finish', lang) : t('flashcards.next', lang)}
              </Button>
            </div>
          </div>
        )}

        {isDone && (
          <div className="flex w-full max-w-[420px] flex-col items-center text-center">
            <div className="mb-[22px] flex size-13 items-center justify-center rounded-[14px] bg-primary/15 text-2xl text-primary">
              ✓
            </div>
            <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
              {t('flashcards.doneTitle', lang)}
            </h1>
            <p className="mt-3 mb-[30px] text-[15px] text-muted-foreground">
              {t('flashcards.doneSubtitle', lang)}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIndex(0)
                  setIsDone(false)
                }}
                className="h-auto rounded-[11px] px-[18px] py-2.5 text-sm font-semibold"
              >
                {t('flashcards.reviewAgain', lang)}
              </Button>
              <Button asChild className="h-auto rounded-xl px-6 py-3.5 text-[15px]">
                <Link to={backTo}>{t('flashcards.backToFlashcards', lang)}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FlashcardSetError({ error }: { error: ApiError }) {
  const { lang } = useLang()
  const known = error.error === 'FORBIDDEN' || error.error === 'NOT_FOUND'
  const forbidden = error.error === 'FORBIDDEN'

  const title = forbidden
    ? 'forbidden.title'
    : known
      ? 'flashcards.notFound.title'
      : 'error.boundaryTitle'
  const subtitle = forbidden
    ? 'flashcards.forbidden.subtitle'
    : known
      ? 'flashcards.notFound.subtitle'
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

export default FlashcardSetPage
