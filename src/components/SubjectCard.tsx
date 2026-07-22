import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { Subject } from '@/types'

interface SubjectCardProps {
  subject: Subject
}

function SubjectCard({ subject }: SubjectCardProps) {
  const { lang } = useLang()

  return (
    <Card className="min-h-[150px] rounded-2xl">
      <CardContent className="flex h-full flex-1 flex-col justify-between gap-6">
        <div>
          <CardTitle className="font-sans text-lg font-semibold">
            {subject.displayName}
          </CardTitle>
          <CardDescription className="mt-1.5">{subject.displayNameSr}</CardDescription>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button asChild size="lg" className="h-11 w-full">
            <Link to={`/subjects/${subject.id}/chat`}>{t('nav.chat', lang)}</Link>
          </Button>
          <div className="flex gap-2.5">
            <Button asChild size="lg" variant="outline" className="h-11 flex-1">
              <Link to={`/subjects/${subject.id}/flashcards`}>{t('nav.flashcards', lang)}</Link>
            </Button>
            {/* Quizzes ships in the next section; shown in place so the card keeps its shape. */}
            <Button size="lg" variant="outline" disabled className="h-11 flex-1 gap-1.5">
              {t('nav.quizzes', lang)}
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase opacity-70">
                {t('nav.soon', lang)}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubjectCard
