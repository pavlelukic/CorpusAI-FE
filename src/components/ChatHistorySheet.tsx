import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, Plus } from 'lucide-react'
import ChatSessionList from '@/components/ChatSessionList'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface ChatHistorySheetProps {
  subjectId: string
  activeSessionId: string
  sessionsPath: string
  /** Called when the open conversation is deleted from inside the drawer. */
  onActiveDeleted: () => void
}

function ChatHistorySheet({
  subjectId,
  activeSessionId,
  sessionsPath,
  onActiveDeleted,
}: ChatHistorySheetProps) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t('chat.openHistory', lang)}
        className="flex size-[34px] items-center justify-center rounded-[9px] border border-border bg-card text-muted-foreground"
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] gap-0 sm:max-w-[320px]">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-[15px]">{t('chat.sessions.history', lang)}</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto p-4">
          <Link
            to={sessionsPath}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-card px-3 py-2.5 text-[14px] font-semibold text-foreground"
          >
            <Plus className="size-4" />
            {t('chat.newChat', lang)}
          </Link>

          <ChatSessionList
            subjectId={subjectId}
            activeSessionId={activeSessionId}
            onSelect={() => setOpen(false)}
            onDeleted={(sessionId) => {
              if (sessionId !== activeSessionId) return
              setOpen(false)
              onActiveDeleted()
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ChatHistorySheet
