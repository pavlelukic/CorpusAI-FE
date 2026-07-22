import { useNavigate, useParams } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { useFlashcards } from '@/hooks/useFlashcards'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import FlashcardSetList from '@/components/FlashcardSetList'
import FlashcardSetupForm from '@/components/FlashcardSetupForm'

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

function FlashcardsPage() {
  const { subjectId = '' } = useParams()
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const { subjects } = useSubjects()
  const subject = subjects?.find((s) => s.id === subjectId)
  const { generate, isGenerating, generateError } = useFlashcards(subjectId)

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

      <main className="mx-auto w-full max-w-[600px] px-6 pt-8 pb-14">
        <section className={`rounded-2xl border border-border bg-card ${cardShadow}`}>
          <FlashcardSetupForm
            isGenerating={isGenerating}
            error={generateError}
            onGenerate={(request) =>
              generate(request, {
                onSuccess: (set) => {
                  // The set owns its language for the life of the study view.
                  setLang(set.lang)
                  navigate(`/flashcards/${set.setId}`)
                },
              })
            }
          />
        </section>

        <h2 className="mt-10 mb-3.5 font-heading text-[19px] font-medium tracking-[-0.01em] text-foreground">
          {t('flashcards.history', lang)}
        </h2>
        <FlashcardSetList subjectId={subjectId} />
      </main>
    </div>
  )
}

export default FlashcardsPage
