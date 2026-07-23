import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountSelectorProps {
  /** Section label above the control (e.g. "Number of cards" / "Number of questions"). */
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  presets?: number[]
  decreaseLabel: string
  increaseLabel: string
}

/**
 * The count control shared by the flashcards and quiz setup panels: quick presets plus a stepper
 * for any value in range, its value cell filled terracotta. Clamps to [min, max].
 */
function CountSelector({
  label,
  value,
  onChange,
  min = 1,
  max = 20,
  presets = [5, 10, 20],
  decreaseLabel,
  increaseLabel,
}: CountSelectorProps) {
  return (
    <div>
      <span className="mb-2 block text-[13px] font-semibold text-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'h-10 w-14 rounded-[10px] text-[15px] font-semibold',
              value === preset
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground',
            )}
          >
            {preset}
          </button>
        ))}
        <div className="ml-auto flex h-10 items-center overflow-hidden rounded-[10px] border border-border">
          <button
            type="button"
            aria-label={decreaseLabel}
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex h-full w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="flex h-full w-10 items-center justify-center bg-primary text-[15px] font-semibold text-primary-foreground tabular-nums">
            {value}
          </span>
          <button
            type="button"
            aria-label={increaseLabel}
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="flex h-full w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CountSelector
