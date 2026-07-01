import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLang } from '@/lib/LangContext'
import { cn } from '@/lib/utils'

function Nav() {
  const { lang, toggleLang } = useLang()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-7">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-[9px] shrink-0 rounded-full bg-primary" />
          <span className="text-[17px] leading-none font-semibold tracking-[-0.03em]">
            Corpus<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center overflow-hidden rounded-[9px] border border-border">
            <button
              type="button"
              onClick={() => lang !== 'en' && toggleLang()}
              className={cn(
                'h-9 px-[13px] text-[13px] font-semibold tracking-[0.02em]',
                lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              EN
            </button>
            <div className="h-9 w-px bg-border" />
            <button
              type="button"
              onClick={() => lang !== 'sr' && toggleLang()}
              className={cn(
                'h-9 px-[13px] text-[13px] font-semibold tracking-[0.02em]',
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
            className="flex size-9 items-center justify-center rounded-[9px] border border-border bg-card text-muted-foreground"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Nav
