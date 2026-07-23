import type { Lang } from '@/lib/i18n'
import type { ModelProvider } from '@/types'

/** Endonyms and brand names - identical in both interfaces, so not translation keys. */
export const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  sr: 'Srpski',
}

export const PROVIDER_LABEL: Record<ModelProvider, string> = {
  OPENAI: 'OpenAI',
  ANTHROPIC: 'Anthropic',
}

/** Tint for the provider tag, taken from the palette rather than either brand's own colors. */
export const PROVIDER_COLOR: Record<ModelProvider, string> = {
  OPENAI: '#3f8f5e',
  ANTHROPIC: '#b4653f',
}

/**
 * Pretty labels for the known model strings. The backend's model config can change, so an
 * unknown key falls back to the raw string rather than being hidden.
 */
export const MODEL_LABEL: Record<string, string> = {
  'gpt-5.4-mini': 'GPT-5.4 mini',
  'gpt-5.6-terra': 'GPT-5.6 Terra',
  'claude-haiku-4-5': 'Claude Haiku 4.5',
  'claude-sonnet-5': 'Claude Sonnet 5',
}
