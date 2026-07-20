import { Link } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

function ForbiddenPage() {
  const { lang } = useLang()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex max-w-[440px] flex-col items-center px-6 pt-32 text-center">
        <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
          {t('forbidden.title', lang)}
        </h1>
        <p className="mt-3 mb-8 text-[15px] text-muted-foreground">
          {t('forbidden.subtitle', lang)}
        </p>
        <Button asChild size="lg" className="h-auto rounded-xl px-6 py-3.5 text-[15px]">
          <Link to="/">{t('notFound.backHome', lang)}</Link>
        </Button>
      </div>
    </div>
  )
}

export default ForbiddenPage
