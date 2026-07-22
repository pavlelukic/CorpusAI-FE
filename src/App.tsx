import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { LangProvider } from '@/lib/LangContext'
import { AuthProvider } from '@/lib/AuthContext'
import { router } from '@/router'

const queryClient = new QueryClient()

// Per-message chat usage is written straight into the cache and never fetched, so it has no
// observer to keep it alive - without this it would be collected while you read another page.
queryClient.setQueryDefaults(['chatUsage'], { gcTime: Infinity })

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AuthProvider>
        </LangProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
