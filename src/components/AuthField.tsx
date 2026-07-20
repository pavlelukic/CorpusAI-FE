import { Input } from '@/components/ui/input'

interface AuthFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
}

/** Labeled input for the auth forms. Shows an inline error when present,
 *  otherwise a muted hint (used for the password length rule on register). */
function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  disabled,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className="h-11 rounded-[11px] bg-muted/40 px-3.5"
      />
      {error ? (
        <p className="text-[13px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export default AuthField
