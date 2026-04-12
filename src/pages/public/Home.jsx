import logoMark from '../../assets/path41-6.png';
import logoText from '../../assets/text47-6.png';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import anneImage from '../../assets/images/Anne2.jpg';

export default function Home() {
  const scrollRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = 420;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      setCoursesError('');

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price_nok,
          cover_image_url,
          courses (
            id,
            intro_text,
            difficulty_level,
            is_self_paced
          )
        `)
        .eq('product_type', 'course')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        setCoursesError(error.message);
        setCourses([]);
      } else {
        setCourses(data || []);
      }

      setLoadingCourses(false);
    }

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#ece7dd] text-stone-900">
      <main>
      <section id="top" className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
          <div className="absolute inset-0">
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
              {loadingCourses ? (
                Array.from({ length: 3 }).map((_, index) => (
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
                        Laster kurs...
                      </button>
                    </div>
                  </div>
                ))
              ) : coursesError ? (
                <div className="w-full rounded-[2rem] border border-stone-200 bg-white/80 p-8 text-center text-stone-700 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  Feil ved lasting av kurs: {coursesError}
                </div>
              ) : courses.length === 0 ? (
                <div className="w-full rounded-[2rem] border border-stone-200 bg-white/80 p-8 text-center text-stone-700 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  Kurs kommer snart
                </div>
              ) : (
                courses.map((course) => {
                  const courseInfo = course.courses?.[0]

                  return (
                    <div
                      key={course.id}
                      className="w-[320px] flex-shrink-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:w-[360px]"
                    >
                      <div className="h-56 bg-[linear-gradient(180deg,rgba(111,124,99,0.12),rgba(236,231,221,0.84))]" />

                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-[#6f7c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7c63]">
                            Kurs
                          </span>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                            {courseInfo?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-semibold text-stone-900">
                          {course.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">
                          {course.description}
                        </p>

                        <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
                          <div className="rounded-2xl bg-stone-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Pris</p>
                            <p className="mt-1 text-base font-semibold text-stone-900">{course.price_nok} NOK</p>
                          </div>
                          <div className="rounded-2xl bg-stone-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Nivå</p>
                            <p className="mt-1 text-base font-semibold text-stone-900">
                              {courseInfo?.difficulty_level || 'Ikke satt'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-stone-200 pt-5">
                          <Link
                            to="/courses"
                            className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#617255]"
                          >
                            Mer info
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200/70 bg-white/80 p-3 shadow-md backdrop-blur"
            >
              <ChevronRight />
            </button>
          </div>
        </section>

        <section className="bg-[#ece7dd] px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.25rem] border border-stone-200 bg-white/55 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                Her kan du legge inn en kort introduksjon om Anne, hva hun jobber med og hvorfor Autentisk Liv finnes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
                >
                  Les mer om meg
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-5 py-3.5 font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Se kursene
                </Link>
              </div>
            </div>

            <div className="order-1 flex justify-center lg:order-2">
              <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <img
                  src={anneImage}
                  alt="Anne"
                  className="aspect-[4/5] h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}