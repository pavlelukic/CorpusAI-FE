import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useChatSessions } from '@/hooks/useChatSessions'
import { LANG_LABEL, PROVIDER_LABEL } from '@/lib/chatMeta'
import { t, type Lang } from '@/lib/i18n'
import type { ModelProvider } from '@/types'
import AppHeader from '@/components/AppHeader'
import ChatSessionList from '@/components/ChatSessionList'
import SegmentedControl from '@/components/SegmentedControl'
import { Button } from '@/components/ui/button'

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

function ChatSessionsPage() {
  const { subjectId = '' } = useParams()
  const { lang } = useLang()
  const { subjects } = useSubjects()
  const subject = subjects?.find((s) => s.id === subjectId)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        backTo="/"
        compact
        title={
          <>
            <span className="max-w-full truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {subject?.displayName ?? subjectId}
            </span>
            <span className="max-w-full truncate text-xs text-muted-foreground">
              {subject?.displayNameSr}
            </span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-[760px] px-6 pt-8 pb-14">
        <NewChatCard subjectId={subjectId} />

        <h2 className="mt-10 mb-3.5 font-heading text-[19px] font-medium tracking-[-0.01em] text-foreground">
          {t('chat.sessions.history', lang)}
        </h2>
        <ChatSessionList subjectId={subjectId} />
      </main>
    </div>
  )
}

function NewChatCard({ subjectId }: { subjectId: string }) {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const { createSession, isCreating } = useChatSessions(subjectId)
  const [sessionLang, setSessionLang] = useState<Lang>(lang)
  const [provider, setProvider] = useState<ModelProvider>('OPENAI')

  function handleStart() {
    createSession(
      { lang: sessionLang, provider },
      {
        onSuccess: (session) => {
          // The session's language is fixed, so the interface adopts it rather than
          // leaving you reading Serbian chrome around an English conversation.
          setLang(session.lang)
          navigate(`/chat/${session.id}`)
        },
      },
    )
  }

  return (
    <section className={`rounded-2xl border border-border bg-card p-6 ${cardShadow}`}>
      <h1 className="font-heading text-[22px] font-medium tracking-[-0.01em] text-foreground">
        {t('chat.newChat', lang)}
      </h1>

      <div className="mt-5 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {t('common.language', lang)}
          </span>
          <SegmentedControl
            aria-label={t('common.language', lang)}
            value={sessionLang}
            onChange={setSessionLang}
            disabled={isCreating}
            options={[
              { value: 'en', label: LANG_LABEL.en },
              { value: 'sr', label: LANG_LABEL.sr },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {t('common.provider', lang)}
          </span>
          <SegmentedControl
            aria-label={t('common.provider', lang)}
            value={provider}
            onChange={setProvider}
            disabled={isCreating}
            options={[
              { value: 'OPENAI', label: PROVIDER_LABEL.OPENAI },
              { value: 'ANTHROPIC', label: PROVIDER_LABEL.ANTHROPIC },
            ]}
          />
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-[1.5] text-muted-foreground">
        {t('chat.sessions.lockNote', lang)}
      </p>

      <Button
        size="lg"
        className="mt-5 h-11 w-full rounded-xl text-[15px]"
        onClick={handleStart}
        disabled={isCreating}
      >
        {isCreating ? t('chat.sessions.starting', lang) : t('chat.sessions.start', lang)}
      </Button>
    </section>
  )
}

export default ChatSessionsPage
