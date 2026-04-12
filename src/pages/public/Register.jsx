import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 py-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <aside className="rounded-[2rem] border border-stone-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <span className="mb-4 inline-flex rounded-full border border-stone-200 bg-white/70 px-4 py-1 text-sm font-medium text-[#6f7c63] shadow-sm backdrop-blur">
            Bli medlem
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Opprett konto og få tilgang til innholdet
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Registrer deg for å få tilgang til kurs, medlemsområde og din egen profil.
          </p>
          <div className="mt-6 rounded-3xl bg-[#6f7c63]/10 p-5 text-sm leading-7 text-stone-700">
            Kontoen gir deg en mer personlig opplevelse og gjør det enklere å følge progresjonen din.
          </div>
        </aside>

        <section className="rounded-[2rem] border border-stone-200 bg-white/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <h2 className="text-2xl font-semibold text-stone-900">Registrer deg</h2>
          <p className="mt-2 text-sm text-stone-700">
            Fyll inn e-post og passord for å opprette brukeren din.
          </p>

          <form onSubmit={handleRegister} className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-700">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-700">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
            >
              Bli medlem
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}

          <p className="mt-6 text-sm text-stone-700">
            Har du allerede konto?{' '}
            <Link to="/login" className="font-semibold text-[#6f7c63] transition hover:opacity-80">
              Logg inn
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Register