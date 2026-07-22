import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'

const STORAGE_KEY = 'corpusai_lang'

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
  /** Used when a language-locked surface (a chat session) dictates the interface language. */
  setLang: (next: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

function getInitialLang(): Lang {
  return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'sr'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'sr' : 'en'))

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang }}>{children}</LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const context = useContext(LangContext)
  if (!context) {
    throw new Error('useLang must be used within a LangProvider')
  }
  return context
}
