import { Link } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { LANG_LABEL } from '@/lib/chatMeta'
import { t } from '@/lib/i18n'
import type { QuizDetail } from '@/types'
import QuizQuestion from '@/components/QuizQuestion'
import { Button } from '@/components/ui/button'

interface QuizResultsProps {
  quiz: QuizDetail
}

function QuizResults({ quiz }: QuizResultsProps) {
  const { lang } = useLang()
  const backTo = `/subjects/${quiz.subjectId}/quizzes`
  const title = quiz.topic ?? t('quiz.wholeSubject', lang)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t('quiz.results', lang)}
        </span>
        <div className="mt-2 font-heading text-[52px] leading-none font-medium tracking-[-0.02em] tabular-nums">
          <span className="text-primary">{quiz.score}</span>
          <span className="text-muted-foreground"> / {quiz.questionCount}</span>
        </div>
        <p className="mt-3 text-[14px] text-muted-foreground">
          {title}
          <span aria-hidden="true"> · </span>
          {LANG_LABEL[quiz.lang]}
        </p>
      </div>

      {quiz.questions.map((question, i) => (
        <QuizQuestion
          key={question.id}
          index={i}
          total={quiz.questions.length}
          question={question}
          mode="results"
        />
      ))}

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-[11px] px-[18px] py-2.5 text-sm font-semibold"
        >
          <Link to={backTo}>{t('quiz.backToQuizzes', lang)}</Link>
        </Button>
        <Button asChild className="h-auto rounded-xl px-6 py-3.5 text-[15px]">
          <Link to={backTo}>{t('quiz.newQuiz', lang)}</Link>
        </Button>
      </div>
    </div>
  )
}

export default QuizResults
