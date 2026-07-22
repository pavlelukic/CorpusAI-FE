import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Send } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useChatSession } from '@/hooks/useChatSessions'
import { useChat } from '@/hooks/useChat'
import { PROVIDER_COLOR, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t, chatChips } from '@/lib/i18n'
import type { ApiError, ChatSession, ModelProvider } from '@/types'
import AppHeader from '@/components/AppHeader'
import ChatHistorySheet from '@/components/ChatHistorySheet'
import ChatMessage from '@/components/ChatMessage'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

const MAX_TEXTAREA_HEIGHT = 116

function ConversationPage() {
  const { sessionId = '' } = useParams()
  // Remounting on a session switch resets the composer and any in-flight turn without effects.
  return <Conversation key={sessionId} sessionId={sessionId} />
}

function ProviderTag({ provider }: { provider: ModelProvider }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const color = PROVIDER_COLOR[provider]

  return (
    <span
      style={{
        backgroundColor: `color-mix(in oklab, ${color}, transparent 86%)`,
        color: isDark ? `color-mix(in oklab, ${color}, white 30%)` : color,
      }}
      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
    >
      {t('chat.via', lang, { provider: PROVIDER_LABEL[provider] })}
    </span>
  )
}

function Conversation({ sessionId }: { sessionId: string }) {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const session = useChatSession(sessionId)
  const { subjects } = useSubjects()
  const subject = subjects?.find((s) => s.id === session?.subjectId)
  const { messages, isStreaming, isLoading, error, send, retry } = useChat(sessionId)

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // A session's language is fixed, so opening one hands the whole interface that language -
  // including on a deep link, where nothing else has had the chance to set it.
  useEffect(() => {
    if (session && session.lang !== lang) setLang(session.lang)
  }, [session, lang, setLang])

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

  if (error) {
    return <ConversationError error={error} />
  }

  const sessionsPath = session ? `/subjects/${session.subjectId}/chat` : '/'
  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader
        backTo={sessionsPath}
        compact
        title={
          <ConversationTitle
            session={session}
            subjectName={subject?.displayName}
            subjectNameSr={subject?.displayNameSr}
            fallback={sessionId}
          />
        }
        leadingAction={
          session && (
            <ChatHistorySheet
              subjectId={session.subjectId}
              activeSessionId={sessionId}
              sessionsPath={sessionsPath}
              onActiveDeleted={() => navigate(sessionsPath)}
            />
          )
        }
        // Locked for the whole time a conversation is open, including while the session is still
        // resolving - the toggle must not be briefly usable on a surface that owns its language.
        langLocked
        langLockedHint={t('chat.langLocked', lang)}
        trailingAction={
          // Below sm the header has no room for it, and the drawer carries the same action.
          <Link
            to={sessionsPath}
            className="hidden h-[34px] shrink-0 items-center rounded-[9px] border border-border bg-card px-3.5 text-[13px] font-semibold whitespace-nowrap text-foreground sm:flex"
          >
            {t('chat.newChat', lang)}
          </Link>
        }
      />

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {isLoading ? (
          <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 pt-8">
            <Skeleton className="h-12 w-1/2 self-end rounded-[18px_18px_5px_18px]" />
            <Skeleton className="h-28 w-3/4 rounded-[5px_18px_18px_18px]" />
          </div>
        ) : hasMessages ? (
          <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 pt-8 pb-10">
            {messages.map((message, i) => (
              <ChatMessage
                key={message.id ?? `live-${i}`}
                message={message}
                isStreaming={isStreaming && i === messages.length - 1}
                onRetry={i === messages.length - 1 ? retry : undefined}
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
              {t('chat.emptyTitle', lang, {
                subject: subject?.displayName ?? session?.subjectId ?? '',
              })}
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

interface ConversationTitleProps {
  session: ChatSession | null
  subjectName?: string
  subjectNameSr?: string
  fallback: string
}

function ConversationTitle({ session, subjectName, subjectNameSr, fallback }: ConversationTitleProps) {
  return (
    <>
      <span className="max-w-full truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
        {subjectName ?? (session ? session.subjectId : fallback)}
      </span>
      <span className="flex max-w-full items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
        <span className="truncate">{subjectNameSr}</span>
        {session && <ProviderTag provider={session.provider} />}
      </span>
    </>
  )
}

/**
 * A session that isn't yours reads differently from one that never existed, and both read
 * differently from the server being unreachable - which arrives with no error code at all.
 */
function ConversationError({ error }: { error: ApiError }) {
  const { lang } = useLang()
  const known = error.error === 'FORBIDDEN' || error.error === 'NOT_FOUND'
  const forbidden = error.error === 'FORBIDDEN'

  const title = forbidden ? 'forbidden.title' : known ? 'chat.notFound.title' : 'error.boundaryTitle'
  const subtitle = forbidden
    ? 'chat.forbidden.subtitle'
    : known
      ? 'chat.notFound.subtitle'
      : 'error.generic'

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex max-w-[440px] flex-col items-center px-6 pt-32 text-center">
        <h1 className="font-heading text-[34px] font-medium tracking-[-0.01em] text-foreground">
          {t(title, lang)}
        </h1>
        <p className="mt-3 mb-8 text-[15px] text-muted-foreground">{t(subtitle, lang)}</p>
        {known ? (
          <Button asChild size="lg" className="h-auto rounded-xl px-6 py-3.5 text-[15px]">
            <Link to="/">{t('notFound.backHome', lang)}</Link>
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-auto rounded-xl px-6 py-3.5 text-[15px]"
            onClick={() => window.location.reload()}
          >
            {t('error.reload', lang)}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ConversationPage
