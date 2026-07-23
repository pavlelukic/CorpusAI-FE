import { useState } from 'react'
import { Link } from 'react-router'
import { useTheme } from 'next-themes'
import { Trash2 } from 'lucide-react'
import { useQuizzes } from '@/hooks/useQuizzes'
import { useLang } from '@/lib/LangContext'
import { LANG_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t } from '@/lib/i18n'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { QuizSummary } from '@/types'
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

const SCORE_COLOR = '#3f8f5e'

function QuizList({ subjectId }: { subjectId: string }) {
  const { lang, setLang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { quizzes, isLoading, error, refetch, deleteQuiz, deletingId } = useQuizzes(subjectId)
  const [deleteTarget, setDeleteTarget] = useState<QuizSummary | null>(null)

  const titleOf = (quiz: QuizSummary) => quiz.topic ?? t('quiz.wholeSubject', lang)

  const scoreChipStyle = {
    backgroundColor: `color-mix(in oklab, ${SCORE_COLOR}, transparent 86%)`,
    color: isDark ? `color-mix(in oklab, ${SCORE_COLOR}, white 30%)` : SCORE_COLOR,
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-[62px] rounded-[14px]" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-border bg-card px-4 py-5 text-center">
        <p className="text-sm text-muted-foreground">{t('quiz.error', lang)}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          {t('error.retry', lang)}
        </Button>
      </div>
    )
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {t('quiz.empty', lang)}
      </p>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {quizzes.map((quiz) => {
          const completed = quiz.completedAt !== null
          return (
            <li
              key={quiz.quizId}
              className={cn(
                'flex items-center gap-2 rounded-[14px] border border-border bg-card pr-2 transition-colors hover:border-primary/40',
                deletingId === quiz.quizId && 'opacity-50',
              )}
            >
              <Link
                to={`/quizzes/${quiz.quizId}`}
                // A quiz's language is fixed, so adopt it before the route changes.
                onClick={() => setLang(quiz.lang)}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[15px] font-medium',
                      quiz.topic ? 'text-foreground' : 'text-muted-foreground italic',
                    )}
                  >
                    {titleOf(quiz)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {formatRelativeTime(quiz.createdAt, lang)}
                    <span aria-hidden="true"> · </span>
                    {LANG_LABEL[quiz.lang]}
                    <span aria-hidden="true"> · </span>
                    {PROVIDER_LABEL[quiz.provider]}
                  </span>
                </div>
                {completed ? (
                  <span
                    style={scoreChipStyle}
                    className="flex h-7 shrink-0 items-center rounded-full px-2.5 text-[13px] font-semibold tabular-nums"
                  >
                    {quiz.score}/{quiz.questionCount}
                  </span>
                ) : (
                  <span className="flex h-7 shrink-0 items-center rounded-full border border-primary/40 px-2.5 text-[13px] font-semibold text-primary">
                    {t('quiz.resume', lang)}
                  </span>
                )}
              </Link>
              <button
                type="button"
                aria-label={t('quiz.delete', lang)}
                onClick={() => setDeleteTarget(quiz)}
                disabled={deletingId === quiz.quizId}
                className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          )
        })}
      </ul>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quiz.deleteConfirm.title', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('quiz.deleteConfirm.body', lang, {
                topic: deleteTarget ? titleOf(deleteTarget) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteQuiz(deleteTarget.quizId)
                setDeleteTarget(null)
              }}
            >
              {t('quiz.deleteConfirm.confirm', lang)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default QuizList
