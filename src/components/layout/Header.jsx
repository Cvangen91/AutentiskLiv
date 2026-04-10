import { useEffect, useState } from 'react';
import logo from '../../assets/path41-4.png';

export default function Header() {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
  
      // eksisterende logikk
      const heroHeight = window.innerHeight * 0.85;
      setScrolledPastHero(scrollY > heroHeight - 120);
  
      // NY: hvilken seksjon er aktiv
      const courses = document.getElementById('courses');
      const about = document.getElementById('about');
  
      if (about && scrollY >= about.offsetTop - 200) {
        setActiveSection('about');
      } else if (courses && scrollY >= courses.offsetTop - 200) {
        setActiveSection('courses');
      } else {
        setActiveSection('top');
      }
    };
  
    handleScroll();
    window.addEventListener('scroll', handleScroll);
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolledPastHero
          ? 'border-b border-stone-200 bg-white/92 shadow-md backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-8 py-5">
        <div className="flex items-center">
          <a
            href="#top"
            className={`flex items-center transition-all duration-700 ${
              scrolledPastHero
                ? 'translate-y-0 opacity-100'
                : '-translate-y-4 opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={logo}
              alt="Autentisk Liv logo"
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>

        <nav
          className={`hidden md:flex items-center justify-center transition-all duration-500 ${
            scrolledPastHero
              ? 'gap-10 text-stone-700 text-xl font-medium'
              : 'gap-16 text-white text-[22px] font-light tracking-wide'
          }`}
        >
          {activeSection !== 'top' && (
  <a href="#top" className="transition hover:opacity-70">
    Forside
  </a>
)}
          <a href="#courses" className="transition hover:opacity-70">
            Kurs
          </a>
          <a href="#about" className="transition hover:opacity-70">
            Om Anne
          </a>
        </nav>

        <div className="flex justify-end">
          <a
            href="/login"
            className={`px-5 py-2.5 text-[15px] font-medium transition-all duration-500 ${
              scrolledPastHero
                ? 'rounded-xl bg-[#6f7c63] text-white shadow-sm hover:bg-[#617255]'
                : 'rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/18'
            }`}
          >
            Logg inn
          </a>
        </div>
      </div>
    </header>
  );
}