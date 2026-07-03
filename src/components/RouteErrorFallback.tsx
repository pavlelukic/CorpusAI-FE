import { useRouteError } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

function RouteErrorFallback() {
  const { lang } = useLang()
  const error = useRouteError()

  if (import.meta.env.DEV) {
    console.error('Route error:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex max-w-[440px] flex-col items-center px-6 pt-32 text-center">
        <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
          {t('error.boundaryTitle', lang)}
        </h1>
        <p className="mt-3 mb-8 text-[15px] text-muted-foreground">
          {t('error.boundarySubtitle', lang)}
        </p>
        <Button
          size="lg"
          className="h-auto rounded-xl px-6 py-3.5 text-[15px]"
          onClick={() => window.location.reload()}
        >
          {t('error.reload', lang)}
        </Button>
      </div>
    </div>
  )
}

export default RouteErrorFallback