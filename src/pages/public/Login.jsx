import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../features/auth/authService'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import './Login.css'

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
    return <p className="login-page__message">Laster...</p>
  }

  return (
    <div className="login-page">
      <h1 className="login-page__title">Logg inn</h1>

      <form onSubmit={handleLogin} className="login-form">
        <div className="login-form__field">
          <label className="login-form__label">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-form__input"
          />
        </div>

        <div className="login-form__field">
          <label className="login-form__label">Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form__input"
          />
        </div>

        <button type="submit" className="login-form__submit">
          Logg inn
        </button>
      </form>

      {message && <p className="login-page__message">{message}</p>}
    </div>
  )
}

export default Login