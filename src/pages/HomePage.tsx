import { useLang } from '@/lib/LangContext'
import { useSubjects } from '@/hooks/useSubjects'
import { t } from '@/lib/i18n'
import Nav from '@/components/Nav'
import SubjectCard from '@/components/SubjectCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

function HomePage() {
  const { lang } = useLang()
  const { subjects, isLoading, error, refetch } = useSubjects()

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <header className="mx-auto max-w-[1120px] px-7 pt-22 pb-12 text-center">
        <h1 className="font-heading text-[46px] leading-[1.08] font-medium tracking-[-0.02em] text-foreground">
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
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
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
