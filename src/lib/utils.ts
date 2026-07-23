import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Lang } from '@/lib/i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Thousands separators in the active locale, e.g. "12,480" / "12.480". */
export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'sr' ? 'sr-Latn-RS' : 'en-GB').format(value)
}

const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

/** "2 hours ago" / "pre 2 sata" - Intl also gives us "yesterday"/"juče" for free. */
export function formatRelativeTime(iso: string, lang: Lang): string {
  const formatter = new Intl.RelativeTimeFormat(lang === 'sr' ? 'sr-Latn-RS' : 'en-GB', {
    numeric: 'auto',
  })
  let duration = (new Date(iso).getTime() - Date.now()) / 1000

  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return iso
}
