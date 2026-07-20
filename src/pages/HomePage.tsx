import { BookOpen } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import SubjectCard from '@/components/SubjectCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

function HomePage() {
  const { lang } = useLang()
  const { subjects, isLoading, error, refetch } = useSubjects()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <header className="mx-auto max-w-[1120px] px-7 pt-14 pb-12 text-center sm:pt-22">
        <h1 className="font-heading text-[32px] leading-[1.15] font-medium tracking-[-0.02em] text-foreground sm:text-[40px] sm:leading-[1.1] lg:text-[46px] lg:leading-[1.08]">
          {t('home.title', lang)}
        </h1>
        <p className="mx-auto mt-[18px] max-w-[760px] text-[17px] leading-normal text-muted-foreground">
          {t('home.subtitle', lang)}
        </p>
      </header>
      <main className="mx-auto max-w-[1120px] px-7 pb-26">
        {error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('error.generic', lang)}</p>
            <Button onClick={() => refetch()}>{t('error.retry', lang)}</Button>
          </div>
        ) : !isLoading && subjects?.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="size-7" />
            </div>
            <h2 className="font-heading text-[24px] font-medium tracking-[-0.01em] text-foreground">
              {t('home.empty.title', lang)}
            </h2>
            <p className="max-w-[420px] text-[15px] text-muted-foreground">
              {t('home.empty.subtitle', lang)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="min-h-[150px] rounded-2xl" />
                ))
              : subjects?.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
