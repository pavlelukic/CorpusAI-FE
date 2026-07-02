import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/LangContext'
import { t, type TranslationKey } from '@/lib/i18n'
import type { Difficulty, Flashcard } from '@/types'

interface FlashCardProps {
  card: Flashcard
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: '#3f8f5e',
  MEDIUM: '#b08a2e',
  HARD: '#b4503f',
}

const DIFFICULTY_KEYS: Record<Difficulty, TranslationKey> = {
  EASY: 'quiz.difficulty.EASY',
  MEDIUM: 'quiz.difficulty.MEDIUM',
  HARD: 'quiz.difficulty.HARD',
}

function FlashCard({ card }: FlashCardProps) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setIsFlipped(false)
  }, [card])

  const diffColor = DIFFICULTY_COLORS[card.difficulty]
  const badgeStyle = {
    backgroundColor: `color-mix(in oklab, ${diffColor}, transparent 86%)`,
    color: isDark ? `color-mix(in oklab, ${diffColor}, white 30%)` : diffColor,
  }

  return (
    <div style={{ perspective: '1600px', width: '100%' }}>
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="relative aspect-[3/2] w-full cursor-pointer [transform-style:preserve-3d]"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.15, 0.2, 1)',
        }}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center rounded-[20px] border border-border bg-card p-8 text-center shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] [backface-visibility:hidden] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <span className="self-start text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            {t('quiz.question', lang)}
          </span>
          <div className="flex flex-1 items-center justify-center py-3">
            <p className="font-heading text-[25px] leading-[1.35] font-medium text-foreground">
              {card.question}
            </p>
          </div>
          <span className="text-[13px] text-muted-foreground">{t('quiz.revealHint', lang)}</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-[20px] border border-border bg-muted p-8 shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] [backface-visibility:hidden] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="self-start text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            {t('quiz.answer', lang)}
          </span>
          <div className="flex-1 overflow-y-auto px-0.5 pt-3.5 pb-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 text-left text-[15.5px] leading-[1.6] text-foreground last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 flex flex-col gap-1.5 pl-5 text-left last:mb-0">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-[15.5px] leading-[1.5] text-foreground">{children}</li>
                ),
              }}
            >
              {card.answer}
            </ReactMarkdown>
          </div>
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-xs text-muted-foreground">
              {card.sourceHint && t('quiz.source', lang, { hint: card.sourceHint })}
            </span>
            <Badge
              variant="outline"
              style={badgeStyle}
              className="rounded-full border-transparent px-2.5 py-[5px] text-[11px] font-bold tracking-[0.08em] uppercase"
            >
              {t(DIFFICULTY_KEYS[card.difficulty], lang)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashCard
