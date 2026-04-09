import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import heroImage from '../../assets/images/478688360_122099991782769522_4273584315197037421_n.jpg';
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
    <div className="min-h-screen bg-[#f8f6f3]">
      <Header />

      <main>
      <section id="top" className="relative min-h-[78vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Autentisk Liv"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center px-6 text-center text-white">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-white/60 bg-white/10 backdrop-blur-sm">
              <Play className="ml-1 h-12 w-12" />
            </div>

            <h1 className="mb-4 text-5xl font-semibold md:text-7xl">Autentisk Liv</h1>
            <p className="max-w-3xl text-xl text-white/90 md:text-2xl">
              Din reise mot autentisitet, indre styrke og personlig vekst
            </p>
          </div>
        </section>

        <section id="courses" className="py-20 bg-[#f8f6f3]">
          <h2 className="mb-12 text-center text-4xl font-semibold">Våre Kurs</h2>

          <div className="relative mx-auto max-w-7xl px-4">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-md"
            >
              <ChevronLeft />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth px-10"
              style={{ scrollbarWidth: 'none' }}
            >
              {courses.map((_, index) => (
                <div
                  key={index}
                  className="w-[320px] flex-shrink-0 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-md md:w-[360px]"
                >
                  <div className="h-56 bg-stone-300" />

                  <div className="p-6">
                    <div className="mb-4 h-8 w-2/3 rounded bg-stone-300" />
                    <div className="mb-3 h-5 w-full rounded bg-stone-200" />
                    <div className="mb-6 h-5 w-5/6 rounded bg-stone-200" />

                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-stone-300 py-3 font-semibold text-stone-500"
                    >
                      Kurs kommer snart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-md"
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        <section id="about" className="bg-[#f8f6f3] px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-5xl font-semibold text-stone-900">Om Anne</h2>

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

            <div className="overflow-hidden rounded-[2rem] shadow-lg">
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