import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { downloadMetricsCsv } from '@/api/admin'
import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { useLang } from '@/lib/LangContext'
import { t, type Lang, type TranslationKey } from '@/lib/i18n'
import { cn, formatNumber } from '@/lib/utils'
import { MODEL_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import type { MetricsGroupBy, MetricsParams, ModelProvider } from '@/types'
import SegmentedControl from '@/components/SegmentedControl'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

const headCell = 'text-[12px] font-semibold tracking-wide text-muted-foreground uppercase'

type RangePreset = '1d' | '7d' | '30d' | 'all'
type GroupSelection = 'none' | MetricsGroupBy

const PRESET_DAYS: Record<Exclude<RangePreset, 'all'>, number> = { '1d': 1, '7d': 7, '30d': 30 }

const FEATURE_LABEL_KEY: Record<string, TranslationKey> = {
  CHAT: 'metrics.feature.CHAT',
  FLASHCARDS: 'metrics.feature.FLASHCARDS',
  QUIZ: 'metrics.feature.QUIZ',
  QUERY_COMPRESSION: 'metrics.feature.QUERY_COMPRESSION',
}

/**
 * Presets set only `from` (a rolling window ending now); `to` is omitted so the server's
 * default upper bound (now) applies, which sidesteps the exclusive-`to` boundary entirely.
 */
function rangeToParams(preset: RangePreset): Pick<MetricsParams, 'from'> {
  if (preset === 'all') return {}
  const from = new Date(Date.now() - PRESET_DAYS[preset] * 24 * 60 * 60 * 1000)
  return { from: from.toISOString() }
}

/** Data-driven: an unknown model/feature key falls back to the raw string rather than crashing. */
function labelForKey(groupBy: MetricsGroupBy, key: string, lang: Lang): string {
  if (groupBy === 'provider') return PROVIDER_LABEL[key as ModelProvider] ?? key
  if (groupBy === 'model') return MODEL_LABEL[key] ?? key
  const featureKey = FEATURE_LABEL_KEY[key]
  return featureKey ? t(featureKey, lang) : key
}

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
  const [range, setRange] = useState<RangePreset>('all')
  const [groupBy, setGroupBy] = useState<GroupSelection>('none')
  const [exporting, setExporting] = useState(false)

  // Freeze the rolling window at the moment a filter changes, so the query key stays stable
  // across renders instead of drifting with every Date.now() call.
  const params = useMemo<MetricsParams>(
    () => ({ ...rangeToParams(range), ...(groupBy !== 'none' ? { groupBy } : {}) }),
    [range, groupBy],
  )

  const { data, isLoading, error, refetch } = useAdminMetrics(params)
  const overall = data?.overall
  const groups = data?.groups ?? []

  async function handleExport() {
    setExporting(true)
    try {
      await downloadMetricsCsv(params)
    } catch {
      toast.error(t('metrics.exportError', lang))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div>
        <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
          {t('metrics.title', lang)}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{t('metrics.subtitle', lang)}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{t('metrics.filters.period', lang)}</span>
            <SegmentedControl
              aria-label={t('metrics.filters.period', lang)}
              value={range}
              onChange={setRange}
              options={[
                { value: '1d', label: t('metrics.range.1d', lang) },
                { value: '7d', label: t('metrics.range.7d', lang) },
                { value: '30d', label: t('metrics.range.30d', lang) },
                { value: 'all', label: t('metrics.range.all', lang) },
              ]}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{t('metrics.group.label', lang)}</span>
            <SegmentedControl
              aria-label={t('metrics.group.label', lang)}
              value={groupBy}
              onChange={setGroupBy}
              className="w-full sm:w-[380px]"
              options={[
                { value: 'none', label: t('metrics.group.none', lang) },
                { value: 'provider', label: t('metrics.group.provider', lang) },
                { value: 'model', label: t('metrics.group.model', lang) },
                { value: 'feature', label: t('metrics.group.feature', lang) },
              ]}
            />
          </div>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          <Download className="size-4" />
          {exporting ? t('metrics.exporting', lang) : t('metrics.export', lang)}
        </Button>
      </div>

      <div className="mt-6">
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

      {!error && groupBy !== 'none' && (
        <div className="mt-6">
          {isLoading ? (
            <Skeleton className="h-[220px] rounded-2xl" />
          ) : groups.length === 0 ? (
            <p className="py-8 text-center text-[15px] text-muted-foreground">
              {t('metrics.noData', lang)}
            </p>
          ) : (
            <div className={cn('overflow-x-auto rounded-2xl border border-border bg-card', cardShadow)}>
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={cn('px-4', headCell)}>
                      {t(`metrics.group.${groupBy}`, lang)}
                    </TableHead>
                    <TableHead className={cn(headCell, 'text-right')}>
                      {t('metrics.tile.calls', lang)}
                    </TableHead>
                    <TableHead className={cn(headCell, 'text-right')}>
                      {t('metrics.tile.inputTokens', lang)}
                    </TableHead>
                    <TableHead className={cn(headCell, 'text-right')}>
                      {t('metrics.tile.outputTokens', lang)}
                    </TableHead>
                    <TableHead className={cn(headCell, 'text-right')}>
                      {t('metrics.tile.totalTokens', lang)}
                    </TableHead>
                    <TableHead className={cn(headCell, 'text-right')}>
                      {t('metrics.tile.avgLatency', lang)}
                    </TableHead>
                    <TableHead className={cn('px-4 text-right', headCell)}>
                      {t('metrics.tile.p95Latency', lang)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.key}>
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {labelForKey(groupBy, group.key, lang)}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {formatNumber(group.calls, lang)}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {formatNumber(group.totalInputTokens, lang)}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {formatNumber(group.totalOutputTokens, lang)}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {formatNumber(group.totalTokens, lang)}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {formatNumber(Math.round(group.avgLatencyMs), lang)} ms
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(Math.round(group.p95LatencyMs), lang)} ms
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminMetricsPage
