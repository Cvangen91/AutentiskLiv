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
        Forside
      </Link>

      <Link to="/courses" style={{ marginRight: '1rem' }}>
        Kurs
      </Link>

      {!user && (
        <>
          <Link to="/login" style={{ marginRight: '1rem' }}>
            Logg inn
          </Link>
          <Link to="/register">Registrer bruker</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/profile" style={{ marginRight: '1rem' }}>
            Din profil
          </Link>

          {role === 'admin' && (
            <Link to="/admin" style={{ marginRight: '1rem' }}>
              Adminside
            </Link>
          )}

          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logg ut
          </button>
        </>
      )}
    </nav>
  )
}

export default Navbar