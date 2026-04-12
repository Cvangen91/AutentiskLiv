import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    return <p className="min-h-screen bg-[#ece7dd] pt-32 text-center text-stone-700">Laster...</p>
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 py-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="max-w-xl">
          <span className="mb-4 inline-flex rounded-full border border-stone-200 bg-white/70 px-4 py-1 text-sm font-medium text-[#6f7c63] shadow-sm backdrop-blur">
            Velkommen tilbake
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Logg inn og fortsett reisen din
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-stone-700">
            Her får du tilgang til kursene dine, profilen din og innhold som er laget for medlemmer.
          </p>

          <div className="mt-8 rounded-[2rem] border border-stone-200 bg-white/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <form onSubmit={handleLogin} className="grid gap-5">
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
                className="mt-1 rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
              >
                Logg inn
              </button>
            </form>

            {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-stone-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-stone-900">Ny her?</h2>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Opprett en bruker for å få tilgang til kurs, profil og medlemsinnhold.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-[#6f7c63] px-5 py-3 font-semibold text-[#6f7c63] transition hover:bg-[#6f7c63] hover:text-white"
            >
              Bli medlem
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Til forsiden
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Login