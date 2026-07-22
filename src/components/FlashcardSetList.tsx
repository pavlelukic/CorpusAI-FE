import { useState } from 'react'
import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useLang } from '@/lib/LangContext'
import { LANG_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t } from '@/lib/i18n'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { FlashcardSetSummary } from '@/types'
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

function FlashcardSetList({ subjectId }: { subjectId: string }) {
  const { lang, setLang } = useLang()
  const { sets, isLoading, error, refetch, deleteSet, deletingId } = useFlashcards(subjectId)
  const [deleteTarget, setDeleteTarget] = useState<FlashcardSetSummary | null>(null)

  const titleOf = (set: FlashcardSetSummary) => set.topic ?? t('flashcards.wholeSubject', lang)

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
        <p className="text-sm text-muted-foreground">{t('flashcards.error', lang)}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          {t('error.retry', lang)}
        </Button>
      </div>
    )
  }

  if (!sets || sets.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {t('flashcards.empty', lang)}
      </p>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {sets.map((set) => (
          <li
            key={set.setId}
            className={cn(
              'flex items-center gap-2 rounded-[14px] border border-border bg-card pr-2 transition-colors hover:border-primary/40',
              deletingId === set.setId && 'opacity-50',
            )}
          >
            <Link
              to={`/flashcards/${set.setId}`}
              // A set's language is fixed, so adopt it before the route changes.
              onClick={() => setLang(set.lang)}
              className="min-w-0 flex-1 px-4 py-3.5"
            >
              <span
                className={cn(
                  'block truncate text-[15px] font-medium',
                  set.topic ? 'text-foreground' : 'text-muted-foreground italic',
                )}
              >
                {titleOf(set)}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {formatRelativeTime(set.createdAt, lang)}
                <span aria-hidden="true"> · </span>
                {LANG_LABEL[set.lang]}
                <span aria-hidden="true"> · </span>
                {PROVIDER_LABEL[set.provider]}
              </span>
            </Link>
            <button
              type="button"
              aria-label={t('flashcards.delete', lang)}
              onClick={() => setDeleteTarget(set)}
              disabled={deletingId === set.setId}
              className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flashcards.deleteConfirm.title', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('flashcards.deleteConfirm.body', lang, {
                topic: deleteTarget ? titleOf(deleteTarget) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteSet(deleteTarget.setId)
                setDeleteTarget(null)
              }}
            >
              {t('flashcards.deleteConfirm.confirm', lang)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default FlashcardSetList
