import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../features/auth/authService'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setMessage('Oppretter bruker...')

    const { error } = await register(email, password)

    if (error) {
      setMessage(`Registrering feilet: ${error.message}`)
      return
    }

    setMessage('Bruker opprettet. Du kan nå logge inn.')
    setEmail('')
    setPassword('')

    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="register-page">
      <h1 className="register-page__title">Registrer deg</h1>

      <form onSubmit={handleRegister} className="register-form">
        <div className="register-form__field">
          <label className="register-form__label">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-form__input"
          />
        </div>

        <div className="register-form__field">
          <label className="register-form__label">Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-form__input"
          />
        </div>

        <button type="submit" className="register-form__submit">
          Registrer
        </button>
      </form>

      {message && <p className="register-page__message">{message}</p>}
    </div>
  )
}

export default Register