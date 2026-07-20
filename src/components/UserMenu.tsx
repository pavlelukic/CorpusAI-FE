import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserMenuProps {
  compact?: boolean
}

/** Initials avatar with a dropdown: name, email, role badge, and log out.
 *  Renders nothing when signed out (e.g. a public 404). */
function UserMenu({ compact = false }: UserMenuProps) {
  const { user, logout } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()

  if (!user) return null

  const size = compact ? 'size-[34px]' : 'size-9'
  const isAdmin = user.role === 'ADMIN'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user.displayName}
        className={cn(
          'flex items-center justify-center rounded-[9px] border border-border bg-card text-[13px] font-semibold text-foreground transition-colors hover:bg-muted',
          size,
        )}
      >
        {getInitials(user.displayName)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-1 py-2">
          <span className="text-[14px] font-semibold text-foreground">{user.displayName}</span>
          <span className="text-[12px] font-normal text-muted-foreground">{user.email}</span>
          <Badge variant={isAdmin ? 'default' : 'secondary'} className="mt-1">
            {t(isAdmin ? 'auth.role.ADMIN' : 'auth.role.USER', lang)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          {t('auth.logout', lang)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
