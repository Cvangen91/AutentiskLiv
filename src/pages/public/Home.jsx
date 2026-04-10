import logoMark from '../../assets/path41-6.png';
import logoText from '../../assets/text47-6.png';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import heroVideo from '../../assets/videos/My Movie.mp4';
import anneImage from '../../assets/images/Anne2.jpg';

const courses = [{}, {}, {}, {}, {}];

export default function Home() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = 420;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#ece7dd] text-stone-900">
      <Header />

      <main>
      <section id="top" className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideo} type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-[#ece7dd]/40 to-[#ece7dd]" />
          </div>

          <div className="relative z-10 min-h-screen">
            <div className="flex min-h-screen items-center justify-center px-6">
              <div className="hero-logo-wrap">
                <div className="hero-logo-inner">
                  <img
                    src={logoMark}
                    alt="Autentisk Liv symbol"
                    className="hero-logo-mark"
                  />
                  <img
                    src={logoText}
                    alt="Autentisk Liv"
                    className="hero-logo-text"
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-center">
              <p className="hero-subtitle">
                Din reise mot autentisitet, indre styrke og personlig vekst
              </p>
              <div className="scroll-indicator">
  <svg width="28" height="18" viewBox="0 0 28 18">
    <path
      d="M2 2 L14 16 L26 2"
      stroke="rgba(17, 24, 39, 0.85)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
  </div>
  </div>
          </div>
        </section>

        <section id="courses" className="bg-[#ece7dd] py-24">
          <h2 className="mb-14 text-center text-4xl font-semibold md:text-5xl">
            Våre Kurs
          </h2>

          <div className="relative mx-auto max-w-7xl px-4">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200/70 bg-white/80 p-3 shadow-md backdrop-blur"
            >
              <ChevronLeft />
            </button>

            <div
  ref={scrollRef}
  className="flex w-full gap-6 overflow-x-auto scroll-smooth px-10"
  style={{ scrollbarWidth: 'none' }}
>
              {courses.map((_, index) => (
                <div
                  key={index}
                  className="w-[320px] flex-shrink-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:w-[360px]"
                >
                  <div className="h-56 bg-stone-300/80" />

                  <div className="p-6">
                    <div className="mb-4 h-8 w-2/3 rounded-full bg-stone-300/80" />
                    <div className="mb-3 h-5 w-full rounded-full bg-stone-200" />
                    <div className="mb-3 h-5 w-5/6 rounded-full bg-stone-200" />
                    <div className="mb-6 h-5 w-4/6 rounded-full bg-stone-200" />

                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-stone-300 py-3 font-semibold text-stone-600"
                    >
                      Kurs kommer snart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200/70 bg-white/80 p-3 shadow-md backdrop-blur"
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        <section id="about" className="bg-[#ece7dd] px-6 py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-5xl font-semibold text-stone-900">
                Om Anne
              </h2>

              <p className="mb-8 text-2xl leading-relaxed text-stone-700">
                Biografi kommer snart. Her skal det stå litt om Anne, hennes bakgrunn,
                erfaring og hva Autentisk Liv handler om.
              </p>

              <p className="mb-8 text-2xl leading-relaxed text-stone-700">
                Denne delen kan dere fylle ut senere når teksten er klar.
              </p>

              <p className="text-2xl leading-relaxed text-stone-700">
                Målet nå er bare å ha layouten på plass.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <img
                src={anneImage}
                alt="Anne"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}