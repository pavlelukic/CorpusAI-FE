import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import AuthLayout from '@/components/AuthLayout'
import AuthField from '@/components/AuthField'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const { lang } = useLang()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ displayName?: string; email?: string; password?: string }>(
    {},
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: { displayName?: string; email?: string; password?: string } = {}
    if (!displayName.trim()) nextErrors.displayName = t('auth.validation.nameRequired', lang)
    if (!EMAIL_RE.test(email)) nextErrors.email = t('auth.validation.emailInvalid', lang)
    if (password.length < 8) nextErrors.password = t('auth.validation.passwordShort', lang)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setFormError(null)
    try {
      await register(email, password, displayName.trim())
      navigate('/', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      setFormError(
        apiErr?.error === 'CONFLICT'
          ? t('auth.error.emailTaken', lang)
          : apiErr?.message || t('error.generic', lang),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <h1 className="font-heading text-[26px] leading-tight font-medium tracking-[-0.02em] text-foreground">
          {t('auth.register.title', lang)}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          {t('auth.register.subtitle', lang)}
        </p>

        <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <AuthField
            id="displayName"
            label={t('auth.displayName', lang)}
            value={displayName}
            onChange={(v) => {
              setDisplayName(v)
              if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }))
            }}
            error={errors.displayName}
            autoComplete="name"
            disabled={submitting}
          />
          <AuthField
            id="email"
            label={t('auth.email', lang)}
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v)
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
            }}
            error={errors.email}
            autoComplete="email"
            disabled={submitting}
          />
          <AuthField
            id="password"
            label={t('auth.password', lang)}
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v)
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
            }}
            error={errors.password}
            hint={t('auth.passwordHint', lang)}
            autoComplete="new-password"
            disabled={submitting}
          />

          {formError && (
            <p className="rounded-[10px] bg-destructive/10 px-3.5 py-2.5 text-[13px] text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="h-11 w-full rounded-[11px]">
            {submitting ? t('auth.register.submitting', lang) : t('auth.register.submit', lang)}
          </Button>
        </form>

        <p className="mt-5 text-center text-[14px] text-muted-foreground">
          {t('auth.register.hasAccount', lang)}{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('auth.register.loginLink', lang)}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
