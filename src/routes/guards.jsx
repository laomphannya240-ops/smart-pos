import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ROLE_ACCESS, homePathForRole } from '../utils/permissions'

export function ProtectedRoute() {
  const session = useAppStore((state) => state.session)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RoleRoute({ module, allow, children }) {
  const session = useAppStore((state) => state.session)
  const allowedRoles = allow || ROLE_ACCESS[module] || []

  if (!session) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(session.role)) return <Navigate to="/403" replace />

  return children
}

export function GuestRoute({ children }) {
  const session = useAppStore((state) => state.session)
  if (session) return <Navigate to={homePathForRole(session.role)} replace />
  return children
}

export function HomeRedirect() {
  const session = useAppStore((state) => state.session)
  return <Navigate to={homePathForRole(session?.role)} replace />
}
