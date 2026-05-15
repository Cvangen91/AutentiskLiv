import logoMark from '../../assets/path41-6.png';
import logoText from '../../assets/text47-6.png';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import anneImage from '../../assets/images/Anne2.jpg';
import video from '../../assets/videos/AutentiskLivLoop.mp4';

function formatCourseDate(value) {
  if (!value) return 'Fast/løpende kurs';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Ugyldig dato';

  return date.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatTimeSlotRange(startValue, endValue) {
  if (!startValue || !endValue) return 'Ukjent tid';

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Ugyldig tid';

  return `${start.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })} - ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
}

function hasValidCapacity(courseInfo) {
  if (!courseInfo?.has_capacity_limit) return false;

  const capacity = Number(courseInfo.capacity_limit);
  return Number.isFinite(capacity) && capacity > 0;
}

function hasValidStartAt(value) {
  if (!value) return false;

  return !Number.isNaN(new Date(value).getTime());
}

export default function Home() {
  const scrollRef = useRef(null);
  const logoImagesLoaded = useRef(0);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [nextAvailableTimeSlot, setNextAvailableTimeSlot] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  const visibleCourses = courses.length > 0 ? [...courses, ...courses] : [];

  function handleLogoLoaded() {
    logoImagesLoaded.current += 1;

    if (logoImagesLoaded.current === 2) {
      setLogoReady(true);
    }
  }

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
            has_capacity_limit,
            capacity_limit,
            delivery_mode,
            start_at,
            location_text
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

  useEffect(() => {
    if (!scrollRef.current || courses.length === 0) return;

    const id = setInterval(() => {
      if (isPaused || !scrollRef.current) return;

      const el = scrollRef.current;
      const halfwayPoint = el.scrollWidth / 2;

      if (el.scrollLeft >= halfwayPoint) {
        el.scrollLeft = 0;
      }

      el.scrollBy({
        left: 420,
        behavior: 'smooth',
      });
    }, 3500);

    return () => clearInterval(id);
  }, [isPaused, courses.length]);

  useEffect(() => {
    let isActive = true;

    async function fetchNextSlot() {
      const { data, error } = await supabase
        .from('time_slots')
        .select('id, start_time, end_time, notes')
        .eq('status', 'available')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        setNextAvailableTimeSlot(null);
        return;
      }

      setNextAvailableTimeSlot(data || null);
    }

    fetchNextSlot();

    return () => {
      isActive = false;
    };
  }, []);

  function getCourseInfo(course) {
    return Array.isArray(course?.courses) ? course.courses[0] : course?.courses;
  }

  return (
    <div className="min-h-screen bg-[#ece7dd] text-stone-900">
      <main>
        <section id="top" className="relative min-h-screen overflow-x-hidden overflow-y-hidden">
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={video} type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/15" />
          </div>

          <div className="relative z-30 min-h-screen">
            <div className="flex min-h-screen items-center justify-center px-6">
              <div className={`hero-logo-wrap ${logoReady ? 'hero-logo-ready' : ''}`}>
                <div className="hero-logo-inner">
                  <img
                    src={logoMark}
                    alt="Autentisk Liv symbol"
                    className="hero-logo-mark"
                    onLoad={handleLogoLoaded}
                  />
                  <img
                    src={logoText}
                    alt="Autentisk Liv"
                    className="hero-logo-text"
                    onLoad={handleLogoLoaded}
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center">
              <p className="hero-subtitle text-white/90 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                Autentisk betyr ekte. Et ekte liv, finne tilbake til hvem man egentlig er
              </p>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById('about-anne')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="scroll-indicator mt-3 cursor-pointer transition hover:translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label="Scroll ned til biografi"
              >
                <svg width="28" height="18" viewBox="0 0 28 18">
                  <path
                    d="M2 2 L14 16 L26 2"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-b from-transparent to-[#ece7dd]" />
        </section>

        <section id="about-anne" className="bg-[#ece7dd] px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.25rem] border border-stone-200 bg-white/55 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                Jeg tilbyr Authentic Livings GEO love sertifiserte fjernhealing. 1:1 healing og EME, gruppetimer og vil arrangere noen retreats i samarbeid med andre flinke aktører.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                Kjenner du på stress, utmattelse, søvnvansker, tiltaksløshet, nedstemthet, usikkerhet eller andre fysiske, psykiske og emosjonelle ting som plager deg? Da kan dette være noe for deg
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

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const section = document.getElementById('courses');

                if (section) {
                  const yOffset = -120;
                  const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

                  window.scrollTo({
                    top: y,
                    behavior: 'smooth',
                  });
                }
              }}
              className="rounded-full p-3 text-stone-600 transition hover:translate-y-1 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Scroll ned til kurs"
            >
              <svg width="28" height="18" viewBox="0 0 28 18">
                <path
                  d="M2 2 L14 16 L26 2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </section>

        <section id="courses" className="bg-[#ece7dd] py-24">
          <h2 className="mb-14 text-center text-4xl font-semibold md:text-5xl">
            Våre Kurs
          </h2>

          <div className="relative mx-auto max-w-7xl px-4">
            <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
              <button
                onClick={() => scroll('left')}
                className="rounded-full border border-stone-200/70 bg-white/80 p-3 shadow-md backdrop-blur"
              >
                <ChevronLeft />
              </button>
            </div>

            <div className="overflow-hidden">
              <div
                ref={scrollRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
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
                  visibleCourses.map((course, index) => {
                    const courseInfo = getCourseInfo(course);

                    return (
                      <div
                        key={`${course.id}-${index}`}
                        className="w-[320px] flex-shrink-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/90 text-left shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:w-[360px]"
                      >
                        <div className="p-6 text-left">
                          <h3 className="text-2xl font-semibold text-stone-900">
                            {course.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">
                            {course.description}
                          </p>

                          <div className="mt-6 text-sm text-stone-700">
                            <div className="w-full">
                              <div className="w-full rounded-2xl bg-stone-50 px-4 py-3 text-left">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Pris</p>
                                <p className="mt-1 text-base font-semibold text-stone-900">{course.price_nok} NOK</p>

                                {courseInfo?.delivery_mode === 'one_to_one' ? (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Neste ledige tid</p>
                                    <p className="mt-1 text-sm font-semibold text-stone-900">
                                      {nextAvailableTimeSlot ? formatTimeSlotRange(nextAvailableTimeSlot.start_time, nextAvailableTimeSlot.end_time) : 'Ingen ledige tider'}
                                    </p>
                                  </div>
                                ) : courseInfo?.delivery_mode === 'physical' ? (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Oppstart</p>
                                    <p className="mt-1 text-sm font-semibold text-stone-900">
                                      {hasValidStartAt(courseInfo?.start_at) ? formatCourseDate(courseInfo.start_at) : 'Ikke satt'}
                                    </p>
                                  </div>
                                ) : null}
                              </div>

                              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
                                {hasValidCapacity(courseInfo) ? (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                                    Ledig plass
                                  </span>
                                ) : (
                                  <div />
                                )}

                                <Link
                                  to="/courses"
                                  className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#617255]"
                                >
                                  Mer info
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
              <button
                onClick={() => scroll('right')}
                className="rounded-full border border-stone-200/70 bg-white/80 p-3 shadow-md backdrop-blur"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}