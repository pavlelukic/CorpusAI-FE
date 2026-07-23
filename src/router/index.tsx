import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import HomePage from '@/pages/HomePage'
import ChatSessionsPage from '@/pages/ChatSessionsPage'
import ConversationPage from '@/pages/ConversationPage'
import FlashcardsPage from '@/pages/FlashcardsPage'
import FlashcardSetPage from '@/pages/FlashcardSetPage'
import QuizzesPage from '@/pages/QuizzesPage'
import QuizPage from '@/pages/QuizPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RequireAuth from '@/components/RequireAuth'
import RequireAdmin from '@/components/RequireAdmin'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminSubjectsPage from '@/pages/admin/AdminSubjectsPage'
import AdminDocumentsPage from '@/pages/admin/AdminDocumentsPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminMetricsPage from '@/pages/admin/AdminMetricsPage'
import RouteErrorFallback from '@/components/RouteErrorFallback'

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/subjects/:subjectId/chat', element: <ChatSessionsPage /> },
          { path: '/chat/:sessionId', element: <ConversationPage /> },
          { path: '/subjects/:subjectId/flashcards', element: <FlashcardsPage /> },
          { path: '/flashcards/:setId', element: <FlashcardSetPage /> },
          { path: '/subjects/:subjectId/quizzes', element: <QuizzesPage /> },
          { path: '/quizzes/:quizId', element: <QuizPage /> },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                  { index: true, element: <Navigate to="/admin/subjects" replace /> },
                  { path: 'subjects', element: <AdminSubjectsPage /> },
                  { path: 'subjects/:subjectId/documents', element: <AdminDocumentsPage /> },
                  { path: 'users', element: <AdminUsersPage /> },
                  { path: 'metrics', element: <AdminMetricsPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
