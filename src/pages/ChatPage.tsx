import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Send } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useChat } from '@/hooks/useChat'
import { t, chatChips } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import ChatMessage from '@/components/ChatMessage'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const MAX_TEXTAREA_HEIGHT = 116

function ChatPage() {
  const { subjectId = '' } = useParams()
  const { lang } = useLang()
  const { subjects } = useSubjects()
  const subject = subjects?.find((s) => s.id === subjectId)
  const { messages, isStreaming, send, clearChat } = useChat(subjectId)

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isStreaming])

  function handleSend(text?: string) {
    const value = text ?? input
    if (!value.trim() || isStreaming) return
    send(value)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        backTo="/"
        compact
        title={
          <>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {subject?.displayName ?? subjectId}
            </span>
            <span className="text-xs text-muted-foreground">{subject?.displayNameSr}</span>
          </>
        }
        langLocked={hasMessages}
        langLockedHint={t('chat.langLocked', lang)}
        trailingAction={
          <button
            type="button"
            onClick={clearChat}
            disabled={!hasMessages}
            className="h-[34px] shrink-0 rounded-[9px] border border-border bg-card px-3.5 text-[13px] font-semibold whitespace-nowrap text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {t('chat.newChat', lang)}
          </button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {hasMessages ? (
          <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 pt-8 pb-10">
            {messages.map((message, i) => (
              <ChatMessage
                key={i}
                message={message}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[640px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-[22px] flex size-11 items-center justify-center rounded-xl bg-primary/15">
              <span className="size-3 rounded-full bg-primary" />
            </div>
            <h2 className="font-heading text-[30px] leading-[1.2] font-medium tracking-[-0.01em] text-foreground">
              {t('chat.emptyTitle', lang, { subject: subject?.displayName ?? '' })}
            </h2>
            <p className="mt-3.5 mb-7 text-[15px] text-muted-foreground">
              {t('chat.emptyHint', lang)}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {chatChips[lang].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-secondary">
        <div className="mx-auto flex max-w-[760px] items-end gap-2.5 px-6 pt-3.5 pb-[18px]">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={t('chat.placeholder', lang)}
            className="min-h-[44px] max-h-[116px] flex-1 resize-none rounded-[14px] px-3.5 py-[11px] text-[15px] leading-[22px]"
          />
          <Button
            type="button"
            size="icon"
            aria-label={t('chat.send', lang)}
            onClick={() => handleSend()}
            disabled={isStreaming || !input.trim()}
            className="size-[42px] shrink-0 rounded-xl"
          >
            <Send className="size-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
