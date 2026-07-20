import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLang } from '@/lib/LangContext'
import { cn } from '@/lib/utils'

interface LangThemeToggleProps {
  /** Extra control rendered after the dark-mode toggle (e.g. "New chat", user menu). */
  trailingAction?: ReactNode
  langLocked?: boolean
  langLockedHint?: string
  /** Chat/Quiz use a slightly shorter control size than Home's. */
  compact?: boolean
}

function LangThemeToggle({
  trailingAction,
  langLocked = false,
  langLockedHint,
  compact = false,
}: LangThemeToggleProps) {
  const { lang, toggleLang } = useLang()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const controlHeight = compact ? 'h-[34px]' : 'h-9'
  const controlSize = compact ? 'size-[34px]' : 'size-9'
  const controlText = compact ? 'text-xs' : 'text-[13px]'
  const controlPadX = compact ? 'px-3' : 'px-[13px]'

  return (
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
}

export default LangThemeToggle
