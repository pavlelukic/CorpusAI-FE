import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card px-5 py-4', cardShadow)}>
      <div className="font-heading text-[30px] leading-none font-medium tracking-[-0.01em] text-foreground tabular-nums">
        {value}
        {unit && <span className="ml-1 align-baseline text-[15px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  )
}

function AdminMetricsPage() {
  const { lang } = useLang()
  const { data, isLoading, error, refetch } = useAdminMetrics({})

  const overall = data?.overall

  return (
    <div>
      <div>
        <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
          {t('metrics.title', lang)}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{t('metrics.subtitle', lang)}</p>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('error.generic', lang)}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('error.retry', lang)}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatTile
              label={t('metrics.tile.calls', lang)}
              value={formatNumber(overall?.calls ?? 0, lang)}
            />
            <StatTile
              label={t('metrics.tile.inputTokens', lang)}
              value={formatNumber(overall?.totalInputTokens ?? 0, lang)}
            />
            <StatTile
              label={t('metrics.tile.outputTokens', lang)}
              value={formatNumber(overall?.totalOutputTokens ?? 0, lang)}
            />
            <StatTile
              label={t('metrics.tile.totalTokens', lang)}
              value={formatNumber(overall?.totalTokens ?? 0, lang)}
            />
            <StatTile
              label={t('metrics.tile.avgLatency', lang)}
              value={formatNumber(Math.round(overall?.avgLatencyMs ?? 0), lang)}
              unit="ms"
            />
            <StatTile
              label={t('metrics.tile.p95Latency', lang)}
              value={formatNumber(Math.round(overall?.p95LatencyMs ?? 0), lang)}
              unit="ms"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMetricsPage
