import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../features/auth/authService'

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
    <div style={{ padding: '2rem' }}>
      <h1>Registrer deg</h1>

      <form onSubmit={handleRegister}>
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
          Registrer
        </button>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}

export default Register