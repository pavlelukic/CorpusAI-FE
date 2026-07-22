import { useState } from 'react'
import { Loader2, Minus, Plus } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { LANG_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ApiError, ModelProvider } from '@/types'
import type { GenerateFlashcardsRequest } from '@/api/flashcards'
import SegmentedControl from '@/components/SegmentedControl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COUNT_PRESETS = [5, 10, 20]
const MIN_COUNT = 1
const MAX_COUNT = 20

interface FlashcardSetupFormProps {
  onGenerate: (request: GenerateFlashcardsRequest) => void
  isGenerating: boolean
  error: ApiError | null
}

function FlashcardSetupForm({ onGenerate, isGenerating, error }: FlashcardSetupFormProps) {
  const { lang } = useLang()
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [setLang, setSetLang] = useState<Lang>(lang)
  const [provider, setProvider] = useState<ModelProvider>('OPENAI')

  function handleGenerate() {
    onGenerate({
      topic: topic.trim() || undefined,
      count,
      lang: setLang,
      provider,
    })
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center gap-3.5 px-6 py-14 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <h2 className="font-heading text-[22px] font-medium tracking-[-0.01em] text-foreground">
          {t('flashcards.generating', lang)}
        </h2>
        <p className="max-w-[380px] text-[13px] leading-[1.5] text-muted-foreground">
          {t('flashcards.generatingHint', lang)}
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
        {t('flashcards.title', lang)}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{t('flashcards.subtitle', lang)}</p>

      <div className="mt-6">
        <label
          htmlFor="flashcards-topic"
          className="mb-2 block text-[13px] font-semibold text-foreground"
        >
          {t('flashcards.topic', lang)}
        </label>
        <Input
          id="flashcards-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('flashcards.topicPlaceholder', lang)}
          className="h-auto rounded-[11px] px-3.5 py-3 text-[15px]"
        />
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-[13px] font-semibold text-foreground">
          {t('flashcards.count', lang)}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {COUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCount(preset)}
              className={cn(
                'h-10 w-14 rounded-[10px] text-[15px] font-semibold',
                count === preset
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground',
              )}
            >
              {preset}
            </button>
          ))}
          <div className="ml-auto flex h-10 items-center overflow-hidden rounded-[10px] border border-border">
            <button
              type="button"
              aria-label={t('flashcards.countDecrease', lang)}
              onClick={() => setCount((prev) => Math.max(MIN_COUNT, prev - 1))}
              disabled={count <= MIN_COUNT}
              className="flex h-full w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="flex h-full w-10 items-center justify-center bg-primary text-[15px] font-semibold text-primary-foreground tabular-nums">
              {count}
            </span>
            <button
              type="button"
              aria-label={t('flashcards.countIncrease', lang)}
              onClick={() => setCount((prev) => Math.min(MAX_COUNT, prev + 1))}
              disabled={count >= MAX_COUNT}
              className="flex h-full w-9 items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{t('common.language', lang)}</span>
          <SegmentedControl
            aria-label={t('common.language', lang)}
            value={setLang}
            onChange={setSetLang}
            options={[
              { value: 'en', label: LANG_LABEL.en },
              { value: 'sr', label: LANG_LABEL.sr },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{t('common.provider', lang)}</span>
          <SegmentedControl
            aria-label={t('common.provider', lang)}
            value={provider}
            onChange={setProvider}
            options={[
              { value: 'OPENAI', label: PROVIDER_LABEL.OPENAI },
              { value: 'ANTHROPIC', label: PROVIDER_LABEL.ANTHROPIC },
            ]}
          />
        </div>
      </div>

      <Button size="lg" className="mt-6 h-11 w-full rounded-xl text-[15px]" onClick={handleGenerate}>
        {t('flashcards.generate', lang)}
      </Button>

      {error &&
        (error.error === 'CONFLICT' ? (
          // A subject with nothing ingested yet is a state to explain, not a failure to report.
          <p className="mt-4 rounded-[11px] bg-muted px-3.5 py-3 text-[13px] leading-[1.5] text-muted-foreground">
            {t('flashcards.noMaterial', lang)}
          </p>
        ) : (
          <p className="mt-4 text-[13px] text-destructive">
            {error.message || t('error.generic', lang)}
          </p>
        ))}
    </div>
  )
}

export default FlashcardSetupForm
