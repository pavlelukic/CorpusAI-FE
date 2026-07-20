import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'

/** Calm full-screen spinner shown while auth is bootstrapping (the boot me() check). */
function FullPageLoader() {
  const { lang } = useLang()
  return (
    <div
      role="status"
      aria-label={t('common.loading', lang)}
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )
}

export default FullPageLoader
