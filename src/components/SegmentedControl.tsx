import { Fragment } from 'react'
import { cn } from '@/lib/utils'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  /** Override the default 224px width when more (or fewer) cells need the room. */
  className?: string
  'aria-label'?: string
}

/** The EN/SR header toggle generalized: a bordered pill of equal cells, active one filled. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      // Fixed width with equal cells so stacked controls line up whatever their labels say.
      className={cn(
        'flex h-10 w-[224px] items-center overflow-hidden rounded-[10px] border border-border',
        className,
      )}
    >
      {options.map((option, i) => (
        <Fragment key={option.value}>
          {i > 0 && <div className="h-full w-px shrink-0 bg-border" />}
          <button
            type="button"
            onClick={() => value !== option.value && onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
            className={cn(
              'h-full flex-1 truncate px-2 text-[13px] font-semibold tracking-[0.01em] disabled:pointer-events-none disabled:opacity-50',
              value === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  )
}

export default SegmentedControl
