import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/lib/AuthContext'
import FullPageLoader from '@/components/FullPageLoader'

/** Gate for the student area. Waits out the boot token check, then either renders
 *  the protected routes or bounces to /login while remembering where the user meant
 *  to go (LoginPage reads location.state.from to return them after signing in). */
function RequireAuth() {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) return <FullPageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

export default RequireAuth
