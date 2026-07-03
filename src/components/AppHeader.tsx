import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLang } from '@/lib/LangContext'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  /** Renders a back-arrow link instead of the CorpusAI logo when set. */
  backTo?: string
  /** Centered content (e.g. subject name). Home has none. */
  title?: ReactNode
  /** Extra control rendered after the dark-mode toggle (e.g. "New Chat"). */
  trailingAction?: ReactNode
  langLocked?: boolean
  langLockedHint?: string
  /** Chat/Quiz use a shorter, full-width, non-sticky header than Home's. */
  compact?: boolean
}

function AppHeader({
  backTo,
  title,
  trailingAction,
  langLocked = false,
  langLockedHint,
  compact = false,
}: AppHeaderProps) {
  const { lang, toggleLang } = useLang()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const controlHeight = compact ? 'h-[34px]' : 'h-9'
  const controlSize = compact ? 'size-[34px]' : 'size-9'
  const controlText = compact ? 'text-xs' : 'text-[13px]'
  const controlPadX = compact ? 'px-3' : 'px-[13px]'

  const start = backTo ? (
    <Link
      to={backTo}
      aria-label="Back"
      className={cn(
        'flex items-center justify-center rounded-[9px] border border-border bg-card text-foreground',
        controlSize,
      )}
    >
      ←
    </Link>
  ) : (
    <div className="flex items-center gap-2.5">
      <span className="inline-block size-[9px] shrink-0 rounded-full bg-primary" />
      <span className="text-[17px] leading-none font-semibold tracking-[-0.03em]">
        Corpus<span className="text-primary">AI</span>
      </span>
    </div>
  )

  const controls = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-[9px] border border-border',
          controlHeight,
        )}
        title={langLocked ? langLockedHint : undefined}
      >
        <button
          type="button"
          onClick={() => lang !== 'en' && toggleLang()}
          disabled={langLocked}
          className={cn(
            controlHeight,
            controlPadX,
            controlText,
            'font-semibold tracking-[0.02em] disabled:pointer-events-none disabled:opacity-50',
            lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          EN
        </button>
        <div className={cn('w-px bg-border', controlHeight)} />
        <button
          type="button"
          onClick={() => lang !== 'sr' && toggleLang()}
          disabled={langLocked}
          className={cn(
            controlHeight,
            controlPadX,
            controlText,
            'font-semibold tracking-[0.02em] disabled:pointer-events-none disabled:opacity-50',
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
        className={cn(
          'flex items-center justify-center rounded-[9px] border border-border bg-card text-muted-foreground',
          controlSize,
        )}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      {trailingAction}
    </div>
  )

  if (!title) {
    return (
      <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-7">
          {start}
          {controls}
        </div>
      </nav>
    )
  }

  const titleBlock = (
    <div className="flex min-w-0 flex-col items-center overflow-hidden text-center leading-[1.15]">
      {title}
    </div>
  )

  return (
    <header className="shrink-0 border-b border-border bg-background/85 px-5 backdrop-blur-md backdrop-saturate-150">
      {/* Below sm: back/controls on one row, subject name on its own row underneath —
          cramming all three into one row left no room for the subject name on phones. */}
      <div className="flex flex-col sm:hidden">
        <div className="flex items-center justify-between py-2.5">
          {start}
          {controls}
        </div>
        <div className="border-t border-border py-2">{titleBlock}</div>
      </div>

      {/* sm and up: back/controls columns are equal width so the title is truly
          centered in the viewport, not just centered within an off-center cell.
          Safe here since mobile's overflow risk is handled by the stacked layout above. */}
      <div className="hidden h-15 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:grid">
        <div className="justify-self-start">{start}</div>
        {titleBlock}
        <div className="justify-self-end">{controls}</div>
      </div>
    </header>
  )
}

export default AppHeader
