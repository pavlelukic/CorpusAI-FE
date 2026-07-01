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
        <div className="flex gap-2.5">
          <Button asChild className="flex-1">
            <Link to={`/chat/${subject.id}`}>{t('nav.chat', lang)}</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/quiz/${subject.id}`}>{t('nav.quiz', lang)}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubjectCard
