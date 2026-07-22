import { useState } from 'react'
import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { useChatSessions } from '@/hooks/useChatSessions'
import { useLang } from '@/lib/LangContext'
import { LANG_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t } from '@/lib/i18n'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { ChatSession } from '@/types'
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

interface ChatSessionListProps {
  subjectId: string
  /** Highlights the open conversation when the list is shown next to one. */
  activeSessionId?: string
  /** Lets a container (the history drawer) close itself when a row is picked. */
  onSelect?: () => void
}

/**
 * Owns its own delete confirm so the whole list can be dropped into a drawer - a nested
 * AlertDialog has to live inside the parent overlay's tree to not dismiss it.
 */
function ChatSessionList({ subjectId, activeSessionId, onSelect }: ChatSessionListProps) {
  const { lang, setLang } = useLang()
  const { sessions, isLoading, error, refetch, deleteSession, deletingId } =
    useChatSessions(subjectId)
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null)

  const titleOf = (session: ChatSession) => session.title ?? t('chat.sessions.untitled', lang)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[62px] rounded-[14px]" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-border bg-card px-4 py-5 text-center">
        <p className="text-sm text-muted-foreground">{t('chat.sessions.error', lang)}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          {t('error.retry', lang)}
        </Button>
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {t('chat.sessions.empty', lang)}
      </p>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={cn(
              'flex items-center gap-2 rounded-[14px] border bg-card pr-2 transition-colors',
              session.id === activeSessionId
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary/40',
              deletingId === session.id && 'opacity-50',
            )}
          >
            <Link
              to={`/chat/${session.id}`}
              onClick={() => {
                // Adopt the session's language before the route changes, so the conversation
                // never paints a frame in the language you're leaving behind.
                setLang(session.lang)
                onSelect?.()
              }}
              className="min-w-0 flex-1 px-4 py-3.5"
            >
              <span
                className={cn(
                  'block truncate text-[15px] font-medium',
                  session.title ? 'text-foreground' : 'text-muted-foreground italic',
                )}
              >
                {titleOf(session)}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {formatRelativeTime(session.createdAt, lang)}
                <span aria-hidden="true"> · </span>
                {LANG_LABEL[session.lang]}
                <span aria-hidden="true"> · </span>
                {PROVIDER_LABEL[session.provider]}
              </span>
            </Link>
            <button
              type="button"
              aria-label={t('chat.sessions.delete', lang)}
              onClick={() => setDeleteTarget(session)}
              disabled={deletingId === session.id}
              className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.sessions.deleteConfirm.title', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('chat.sessions.deleteConfirm.body', lang, {
                title: deleteTarget ? titleOf(deleteTarget) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteSession(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {t('chat.sessions.deleteConfirm.confirm', lang)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ChatSessionList
