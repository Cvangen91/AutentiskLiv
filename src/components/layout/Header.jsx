import logo from '../../assets/path41-4.png';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-8 py-4">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Autentisk Liv logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        <nav className="flex justify-center gap-10 text-xl text-stone-700">
          <a href="#top" className="transition duration-200 hover:text-stone-900">
            Forside
          </a>
          <a href="#courses" className="transition duration-200 hover:text-stone-900">
            Kurs
          </a>
          <a href="#about" className="transition duration-200 hover:text-stone-900">
            Om Anne
          </a>
        </nav>

        <div className="flex justify-end">
          <a
            href="/login"
            className="rounded-xl bg-[#66745f] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:bg-[#55624f]"
          >
            Logg inn
          </a>
        </div>
      </div>
    </header>
  );
}