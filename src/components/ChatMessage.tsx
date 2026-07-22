import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
  onRetry?: () => void
}

function ChatMessage({ message, isStreaming = false, onRetry }: ChatMessageProps) {
  const { lang } = useLang()

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[18px_18px_5px_18px] bg-primary px-4 py-2.5 text-[15px] leading-[1.55] whitespace-pre-wrap break-words text-primary-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  const hasContent = message.content.length > 0
  const usage = message.usage
  // Both token counts are nullable - a provider that reports no usage still gets a stats line.
  const tokens =
    usage && (usage.inputTokens !== null || usage.outputTokens !== null)
      ? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
      : null

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-[5px_18px_18px_18px] border border-border bg-card px-[18px] pt-4 pb-1.5 text-card-foreground shadow-xs">
        {hasContent && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="mb-2.5 text-[15px] leading-[1.6] last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-2.5 flex flex-col gap-1.5 pl-5 last:mb-0">{children}</ul>
              ),
              li: ({ children }) => <li className="text-[15px] leading-[1.55]">{children}</li>,
              pre: ({ children }) => (
                <pre className="mt-1 mb-3 overflow-x-auto rounded-[10px] border border-border bg-muted px-4 py-3.5 last:mb-0 [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0">
                  {children}
                </pre>
              ),
              code: ({ children }) => (
                <code className="rounded-[6px] bg-muted px-1.5 py-px font-mono text-[13px] leading-[1.55]">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {isStreaming && (
          <div className={cn('flex items-center', hasContent ? 'mt-1' : 'h-6')}>
            <span aria-hidden="true" className="size-2 animate-blink rounded-full bg-primary" />
          </div>
        )}
        {message.failed && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-2 gap-y-1 pb-2 text-[13px] text-muted-foreground',
              hasContent ? 'mt-1' : '',
            )}
          >
            <span>{t('chat.streamFailed', lang)}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                {t('error.retry', lang)}
              </button>
            )}
          </div>
        )}
        {usage && !isStreaming && !message.failed && (
          <p className="mt-1 pb-2 text-[12px] text-muted-foreground">
            {[
              tokens === null ? null : t('chat.stats.tokens', lang, { count: String(tokens) }),
              `${(usage.latencyMs / 1000).toFixed(1)}s`,
              usage.model,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
