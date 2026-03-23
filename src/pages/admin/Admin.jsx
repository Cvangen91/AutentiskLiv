import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'

function Admin() {
  const { user } = useAuth()
  const { role } = useRole()

  async function handleLogout() {
    await logout()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin</h1>
      <p>Innlogget som: {user?.email}</p>
      <p>Rolle: {role}</p>
      <button onClick={handleLogout}>Logg ut</button>
    </div>
  )
}

export default Admin