import type { ReactNode } from 'react'
import LangThemeToggle from '@/components/LangThemeToggle'

/** Shell-less centered layout shared by Login and Register: warm background,
 *  floating EN/SR + dark toggles top-right, the wordmark above the page's card. */
function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16">
      <div className="absolute top-5 right-5">
        <LangThemeToggle />
      </div>
      <div className="flex w-full max-w-[420px] flex-col items-center">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="inline-block size-[9px] shrink-0 rounded-full bg-primary" />
          <span className="text-[22px] leading-none font-semibold tracking-[-0.03em]">
            Corpus<span className="text-primary">AI</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
