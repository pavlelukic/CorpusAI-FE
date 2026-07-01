import { useParams } from 'react-router'

function ChatPage() {
  const { subjectId } = useParams()
  return <div>Chat: {subjectId}</div>
}

export default ChatPage
