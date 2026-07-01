import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { LangProvider } from '@/lib/LangContext'
import { router } from '@/router'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LangProvider>
    </QueryClientProvider>
  )
}

export default App
