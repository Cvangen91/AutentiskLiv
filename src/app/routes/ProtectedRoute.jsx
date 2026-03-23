import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Laster...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute