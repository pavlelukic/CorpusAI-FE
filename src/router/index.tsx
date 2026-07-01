import { createBrowserRouter } from 'react-router'
import HomePage from '@/pages/HomePage'
import ChatPage from '@/pages/ChatPage'
import QuizPage from '@/pages/QuizPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/chat/:subjectId', element: <ChatPage /> },
  { path: '/quiz/:subjectId', element: <QuizPage /> },
])
