import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { register } from '../../features/auth/authService'

function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setMessage('Oppretter bruker...')

    const { error } = await register(email, password, {
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      zipcode,
      city,
    })

    if (error) {
      setMessage(`Registrering feilet: ${error.message}`)
      return
    }

    setMessage('Bruker opprettet. Du kan nå logge inn.')
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
    setAddress('')
    setZipcode('')
    setCity('')

    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 py-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-stone-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md">
          
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Opprett en personlig brukerkonto
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Registrer deg for å få tilgang til booking av 1:1 timer, kurs og eventer.
          </p>
         
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <h2 className="text-2xl font-semibold text-stone-900">Registrer deg</h2>
          <p className="mt-2 text-sm text-stone-700">
            Fyll inn kontakt- og fakturainformasjon for å opprette brukeren din.
          </p>

          <form onSubmit={handleRegister} className="mt-6 grid gap-5">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Fornavn</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Etternavn</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Adresse</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Postnummer</label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="postal-code"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700">Sted</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                  autoComplete="address-level2"
                  required
                />
              </div>
            </div>

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
                autoComplete="new-password"
                required
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