import { createBrowserRouter, Outlet } from 'react-router'
import HomePage from '@/pages/HomePage'
import ChatPage from '@/pages/ChatPage'
import QuizPage from '@/pages/QuizPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorFallback from '@/components/RouteErrorFallback'

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/chat/:subjectId', element: <ChatPage /> },
      { path: '/quiz/:subjectId', element: <QuizPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
