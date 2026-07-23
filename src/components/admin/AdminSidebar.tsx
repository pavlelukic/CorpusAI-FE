import { BarChart3, BookText, Users } from 'lucide-react'
import { NavLink } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { t, type TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  /** Called when a nav link is chosen — lets the mobile drawer close itself. */
  onNavigate?: () => void
}

const navItems: { to: string; icon: typeof Users; label: TranslationKey }[] = [
  { to: '/admin/users', icon: Users, label: 'admin.nav.users' },
  { to: '/admin/subjects', icon: BookText, label: 'admin.nav.subjects' },
  { to: '/admin/metrics', icon: BarChart3, label: 'admin.nav.metrics' },
]

function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { lang } = useLang()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="size-[18px] shrink-0" />
          {t(label, lang)}
        </NavLink>
      ))}
    </nav>
  )
}

export default AdminSidebar
