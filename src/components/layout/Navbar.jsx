import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import logo from '../../assets/path41-4.png'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const { user } = useAuth()
  const { role } = useRole()
  const { pathname } = useLocation()
  const [scrolledPastHero, setScrolledPastHero] = useState(pathname !== '/')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)

    if (pathname !== '/') {
      setScrolledPastHero(true)
      return undefined
    }

    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.55)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  async function handleLogout() {
    await logout()
  }

  const navLinkClass = 'transition hover:opacity-70'
  const headerClass = scrolledPastHero
    ? 'border-b border-stone-200 bg-white/92 shadow-md backdrop-blur-md'
    : 'bg-transparent'

  const authButtonClass = scrolledPastHero
    ? 'rounded-xl bg-[#6f7c63] px-5 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-500 hover:bg-[#617255]'
    : 'rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[15px] font-medium text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/18'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerClass}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center">
          <Link to="/" className="flex items-center transition hover:opacity-80">
            <img
              src={logo}
              alt="Autentisk Liv logo"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </Link>
        </div>

        <nav className={`hidden items-center justify-center transition-all duration-500 md:flex ${scrolledPastHero ? 'gap-10 text-xl font-medium text-stone-700' : 'gap-16 text-[22px] font-light tracking-wide text-white'}`}>
          <Link to="/courses" className={navLinkClass}>
            Kurs
          </Link>
          <Link to="/about" className={navLinkClass}>
            Om meg
          </Link>

          {user && (
            <Link to="/profile" className={navLinkClass}>
              Din profil
            </Link>
          )}

          {role === 'admin' && (
            <Link to="/admin" className={navLinkClass}>
              Adminside
            </Link>
          )}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {!user ? (
            <>
              <Link
                to="/register"
                className={`rounded-xl px-5 py-2.5 text-[15px] font-medium transition-all duration-500 ${scrolledPastHero ? 'border border-[#6f7c63] bg-transparent text-[#6f7c63] hover:bg-[#6f7c63] hover:text-white' : 'border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/18'}`}
              >
                Bli medlem
              </Link>
              <Link
                to="/login"
                className={authButtonClass}
              >
                Logg inn
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className={authButtonClass}
            >
              Logg ut
            </button>
          )}

          <button
            type="button"
            aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
            className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 transition md:hidden ${scrolledPastHero ? 'border-stone-200 bg-white text-stone-700 shadow-sm' : 'border-white/20 bg-white/10 text-white backdrop-blur-sm'}`}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`md:hidden ${menuOpen ? 'block' : 'hidden'} border-t ${scrolledPastHero ? 'border-stone-200 bg-white/96 text-stone-700 shadow-md backdrop-blur-md' : 'border-white/10 bg-black/20 text-white backdrop-blur-sm'}`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-8">
          <Link to="/courses" className="rounded-lg px-2 py-2 font-medium transition hover:bg-black/5 hover:opacity-80">
            Kurs
          </Link>
          <Link to="/about" className="rounded-lg px-2 py-2 font-medium transition hover:bg-black/5 hover:opacity-80">
            Om meg
          </Link>
          {user && (
            <Link to="/profile" className="rounded-lg px-2 py-2 font-medium transition hover:bg-black/5 hover:opacity-80">
              Din profil
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" className="rounded-lg px-2 py-2 font-medium transition hover:bg-black/5 hover:opacity-80">
              Adminside
            </Link>
          )}
          {!user && (
            <Link to="/register" className="rounded-lg px-2 py-2 font-medium transition hover:bg-black/5 hover:opacity-80">
              Bli medlem
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar