import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { LangProvider } from '@/lib/LangContext'
import { router } from '@/router'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <RouterProvider router={router} />
          <Toaster />
        </LangProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
