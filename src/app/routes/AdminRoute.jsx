import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'

function AdminRoute() {
  const { user, loading } = useAuth()
  const { role, loading: roleLoading } = useRole()

  if (loading || roleLoading) {
    return <p>Laster...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute