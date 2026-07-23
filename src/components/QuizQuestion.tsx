import { useRef } from 'react'
import { useTheme } from 'next-themes'
import { Check, X } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { QuizQuestionDetail } from '@/types'

const CORRECT_COLOR = '#3f8f5e'
const WRONG_COLOR = '#b4503f'
const LETTERS = ['A', 'B', 'C', 'D']

interface QuizQuestionProps {
  index: number
  total: number
  question: QuizQuestionDetail
  mode: 'taking' | 'results'
  /** Taking mode only: the current pick and the setter. */
  selectedIndex?: number
  onSelect?: (optionIndex: number) => void
}

function QuizQuestion({ index, total, question, mode, selectedIndex, onSelect }: QuizQuestionProps) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const options = question.options

  // Radio-group arrow-key movement: stepping also selects, as native radios do.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (mode !== 'taking' || !onSelect) return
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
    if (!forward && !back) return
    e.preventDefault()
    const current = selectedIndex ?? 0
    const next = forward
      ? (current + 1) % options.length
      : (current - 1 + options.length) % options.length
    onSelect(next)
    optionRefs.current[next]?.focus()
  }

  function tint(color: string) {
    return {
      backgroundColor: `color-mix(in oklab, ${color}, transparent 88%)`,
      borderColor: `color-mix(in oklab, ${color}, transparent 55%)`,
    }
  }
  const accent = (color: string) => (isDark ? `color-mix(in oklab, ${color}, white 30%)` : color)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {t('quiz.questionLabel', lang, { n: String(index + 1), total: String(total) })}
      </span>
      <h2 className="mt-2 font-heading text-[20px] leading-[1.35] font-medium tracking-[-0.01em] text-foreground sm:text-[22px]">
        {question.question}
      </h2>

      <div
        role={mode === 'taking' ? 'radiogroup' : undefined}
        aria-label={mode === 'taking' ? question.question : undefined}
        onKeyDown={handleKeyDown}
        className="mt-4 flex flex-col gap-2.5"
      >
        {options.map((option, i) => {
          const letter = LETTERS[i]

          if (mode === 'taking') {
            const isSelected = selectedIndex === i
            const rovingTab = (selectedIndex == null ? i === 0 : isSelected) ? 0 : -1
            return (
              <button
                key={i}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={rovingTab}
                onClick={() => onSelect?.(i)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[14px] border px-4 py-3.5 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {letter}
                </span>
                <span className="text-[15px] text-foreground">{option}</span>
              </button>
            )
          }

          // Results mode: reveal the correct option and mark the taker's pick.
          const isCorrect = i === question.correctIndex
          const isPick = i === question.selectedIndex
          const isWrongPick = isPick && !isCorrect
          const washColor = isCorrect ? CORRECT_COLOR : isWrongPick ? WRONG_COLOR : null

          return (
            <div
              key={i}
              style={washColor ? tint(washColor) : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-[14px] border px-4 py-3.5',
                !washColor && 'border-border bg-card',
              )}
            >
              <span
                style={washColor ? { color: accent(washColor) } : undefined}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                  washColor ? 'bg-background/60' : 'bg-muted text-muted-foreground',
                )}
              >
                {letter}
              </span>
              <span className="flex-1 text-[15px] text-foreground">{option}</span>
              {isPick && (
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                  {t('quiz.yourAnswer', lang)}
                </span>
              )}
              {isCorrect && (
                <Check className="size-[18px] shrink-0" style={{ color: accent(CORRECT_COLOR) }} />
              )}
              {isWrongPick && (
                <X className="size-[18px] shrink-0" style={{ color: accent(WRONG_COLOR) }} />
              )}
            </div>
          )
        })}
      </div>

      {mode === 'results' && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={tint(question.correct ? CORRECT_COLOR : WRONG_COLOR)}
              className="flex h-6 items-center rounded-full border px-2.5 text-[12px] font-semibold"
            >
              <span style={{ color: accent(question.correct ? CORRECT_COLOR : WRONG_COLOR) }}>
                {question.correct ? t('quiz.correct', lang) : t('quiz.incorrect', lang)}
              </span>
            </span>
            {question.selectedIndex == null && (
              <span className="text-[12px] text-muted-foreground">{t('quiz.unanswered', lang)}</span>
            )}
          </div>
          {question.explanation && (
            <div className="mt-3 rounded-[12px] bg-muted px-4 py-3">
              <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t('quiz.explanation', lang)}
              </span>
              <p className="mt-1 text-[14px] leading-[1.55] text-foreground">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizQuestion
