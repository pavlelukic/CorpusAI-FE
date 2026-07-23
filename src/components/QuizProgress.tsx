interface QuizProgressProps {
  answered: number
  total: number
}

/** The slim bar under the header while taking - fills as questions get answered. */
function QuizProgress({ answered, total }: QuizProgressProps) {
  const pct = total > 0 ? (answered / total) * 100 : 0
  return (
    <div className="h-[3px] w-full shrink-0 bg-border">
      <div
        className="h-full bg-primary transition-[width] duration-[350ms] ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default QuizProgress
