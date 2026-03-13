import { useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { courses } from '../data/courses';

const courseImages = [
  'https://images.unsplash.com/photo-1758607234692-51ac051a2a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwd29tYW4lMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzI3MDcyMzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758274251489-bcf562ae7da7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0d28lMjB3b21lbiUyMHRhbGtpbmclMjBuYXR1cmV8ZW58MXx8fHwxNzcyODA4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1735753069477-39ee2788c9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBzdW5saWdodCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3MjgwODc5OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwd29tYW4lMjBzdW5yaXNlfGVufDF8fHx8MTc3MjgwODgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] bg-stone-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1757263153144-c94f3715871d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMHJldHJlYXQlMjBub3J3YXklMjBuYXR1cmV8ZW58MXx8fHwxNzcyODA4ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold text-white mb-4">
              Autentisk Liv
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto px-4">
              Din reise mot autentisitet, indre styrke og personlig vekst
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-stone-800 mb-12 text-center">
            Våre Kurs
          </h2>

          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-sage-800 hover:shadow-xl transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex-shrink-0 w-[350px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={courseImages[index]}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-stone-800 mb-3">
                      {course.title}
                    </h3>
                    <p className="text-stone-600 mb-6 line-clamp-3">
                      {course.description}
                    </p>
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="w-full py-3 bg-[#496649] text-white rounded-lg hover:bg-[#3c523c] transition-colors"
                    >
                      Bli med
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-sage-800 hover:shadow-xl transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-semibold text-stone-800 mb-6">
                Om Anne
              </h2>
              <p className="text-stone-600 mb-4">
                Anne er en erfaren coach og veileder innen personlig utvikling. Med over 15 års
                erfaring har hun hjulpet hundrevis av mennesker til å finne sin indre styrke og
                leve et mer autentisk liv.
              </p>
              <p className="text-stone-600 mb-4">
                Gjennom sine kurs og retreats deler Anne sine kunnskaper om meditasjon,
                mindfulness og autentisk kommunikasjon. Hun tror på at alle har en indre visdom
                som venter på å bli oppdaget.
              </p>
              <p className="text-stone-600">
                Autentisk Liv er ikke bare en plattform – det er en bevegelse mot mer
                tilstedeværelse, ekthet og indre ro i en travel hverdag.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1679043688331-a53a828c77b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwZmpvcmQlMjBub3J3YXklMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzcyODA4ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Anne"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-stone-800 mb-6">
            Spørsmål?
          </h2>
          <p className="text-stone-600 mb-8">
            Kontakt oss gjerne hvis du har spørsmål om kursene eller ønsker mer informasjon.
          </p>
          <a
            href="mailto:post@autentiskliv.no"
            className="inline-block px-8 py-3 bg-[#496649] text-white rounded-lg hover:bg-[#3c523c] transition-colors"
          >
            Send oss en e-post
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
