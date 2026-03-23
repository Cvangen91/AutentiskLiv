import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../features/auth/authService'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'

function Login() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { role, loading: roleLoading } = useRole()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setMessage('Logger inn...')

    const { error } = await login(email, password)

    if (error) {
      setMessage(`Innlogging feilet: ${error.message}`)
      return
    }

    setMessage('Innlogging vellykket')
  }

  useEffect(() => {
    if (loading || roleLoading) return
    if (!user) return

    if (role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    if (role === 'member') {
      navigate('/profile', { replace: true })
    }
  }, [user, role, loading, roleLoading, navigate])

  if (loading || roleLoading) {
    return <p>Laster...</p>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Logg inn</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>E-post</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Passord</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Logg inn
        </button>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}

export default Login