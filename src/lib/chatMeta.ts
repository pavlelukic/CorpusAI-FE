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

/** The chat tier the backend runs per provider; the done event doesn't carry the model. */
export const CHAT_MODEL: Record<ModelProvider, string> = {
  OPENAI: 'gpt-5.4-mini',
  ANTHROPIC: 'claude-haiku-4-5',
}
