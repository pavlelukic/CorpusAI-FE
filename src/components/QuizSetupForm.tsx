import { useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/types'

interface QuizSetupFormProps {
  onGenerate: (topic: string | undefined, count: number) => void
  error?: ApiError | null
}

const COUNT_OPTIONS = [5, 10, 20]

function QuizSetupForm({ onGenerate, error }: QuizSetupFormProps) {
  const { lang } = useLang()
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)

  function handleSubmit() {
    onGenerate(topic.trim() || undefined, count)
  }

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center text-center">
      <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
        {t('quiz.setupTitle', lang)}
      </h1>
      <p className="mt-3 mb-8 text-[15px] text-muted-foreground">
        {t('quiz.setupSubtitle', lang)}
      </p>

      <div className="mb-[22px] w-full text-left">
        <label className="mb-2 block text-[13px] font-semibold text-foreground">
          {t('quiz.topic', lang)}
        </label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('quiz.topicPlaceholder', lang)}
          className="h-auto rounded-[11px] px-3.5 py-3 text-[15px]"
        />
      </div>

      <div className="mb-8 w-full text-left">
        <label className="mb-2 block text-[13px] font-semibold text-foreground">
          {t('quiz.count', lang)}
        </label>
        <div className="flex gap-2.5">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={cn(
                'h-11 flex-1 rounded-[11px] text-[15px] font-semibold',
                count === n
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        size="lg"
        className="h-auto rounded-xl px-6 py-3.5 text-[15px]"
      >
        {t('quiz.generate', lang)}
      </Button>

      {error && <p className="mt-4 text-sm text-destructive">{t('error.generic', lang)}</p>}
    </div>
  )
}

export default QuizSetupForm