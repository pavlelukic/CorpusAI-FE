import { useParams } from 'react-router'

function QuizPage() {
  const { subjectId } = useParams()
  return <div>Quiz: {subjectId}</div>
}

export default QuizPage
