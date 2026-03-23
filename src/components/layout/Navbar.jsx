import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'

function Navbar() {
  const { user } = useAuth()
  const { role } = useRole()

  async function handleLogout() {
    await logout()
  }

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>
        Home
      </Link>

      {!user && (
        <>
          <Link to="/login" style={{ marginRight: '1rem' }}>
            Login
          </Link>
          <Link to="/register">Register</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/profile" style={{ marginRight: '1rem' }}>
            Profile
          </Link>

          {role === 'admin' && (
            <Link to="/admin" style={{ marginRight: '1rem' }}>
              Admin
            </Link>
          )}

          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </>
      )}
    </nav>
  )
}

export default Navbar