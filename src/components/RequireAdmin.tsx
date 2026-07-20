import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/lib/AuthContext'
import FullPageLoader from '@/components/FullPageLoader'
import ForbiddenPage from '@/pages/ForbiddenPage'

/** Gate for the admin area. Nests inside RequireAuth in practice,
 *  but stays self-sufficient: a non-admin sees the 403 page, not a redirect, so the
 *  URL stays put and the denial is explicit. The backend enforces this regardless. */
function RequireAdmin() {
  const { user, isBootstrapping } = useAuth()

  if (isBootstrapping) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <ForbiddenPage />
  return <Outlet />
}

export default RequireAdmin