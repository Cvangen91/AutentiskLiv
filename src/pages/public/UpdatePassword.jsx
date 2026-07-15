import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../features/auth/authService'

function UpdatePassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Passordene er ikke like')
      return
    }

    setMessage('Oppdaterer passord...')

    const { error } = await updatePassword(password)

    if (error) {
      setMessage(`Kunne ikke oppdatere passord: ${error.message}`)
      return
    }

    setMessage('Passordet er oppdatert. Du blir nå sendt til innlogging.')

    setTimeout(() => {
      navigate('/login')
    }, 1500)
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 py-14 pt-24 text-stone-900 sm:px-6 sm:py-16 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Sett nytt passord
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Skriv inn et nytt passord for kontoen din.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-stone-700">
                Nytt passord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-stone-700">
                Bekreft nytt passord
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
              />
            </div>

            <button
              type="submit"
              className="mt-1 rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
            >
              Oppdater passord
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
        </section>
      </div>
    </div>
  )
}

export default UpdatePassword
