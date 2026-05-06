import { Link } from 'react-router-dom'
import anneImage from '../../assets/images/Anne1.jpg'


const sections = [
  {
    title: 'Min tilnærming',
    text:
      'Anne Myrvoll er opptatt av sammenhengen mellom kropp, sinn, energi og følelser. Hun arbeider med å støtte mennesker som ønsker mer balanse, klarhet og retning i livet sitt. Gjennom sitt arbeid legger hun vekt på autentisitet, tilstedeværelse og indre utvikling. Hennes tilnærming handler ikke om å “fikse” mennesker, men om å hjelpe dem tilbake til sin egen kraft, intuisjon og indre sannhet.',
  },
  {
    title: 'Coaching og healing',
    text:
      'Anne videreutdanner seg kontinuerlig innen coaching, energiarbeid og personlig utvikling. Hun er særlig opptatt av hvordan gamle mønstre, emosjonelle blokkeringer og begrensende overbevisninger påvirker menneskers liv – og hvordan man kan skape varig endring gjennom økt bevissthet og indre arbeid. Hun integrerer både intuitiv veiledning, energiarbeid og verktøy for personlig transformasjon i sitt arbeid.',
  },
  {
    title: 'Authentic Living GEO',
    text: `Anne tar utdanning gjennom Authentic Living GEO, en internasjonal healer- og coachutdanning utviklet for å støtte mennesker i dyp personlig transformasjon og energetisk healing.
GEO-programmet fokuserer blant annet på:
- energibevissthet og healing
- emosjonell frigjøring
- personlig vekst og selvutvikling
- autentisk livsutfoldelse
- intuitiv utvikling
- transformasjon av begrensende mønstre

Gjennom utdanningen utvikles evnen til å arbeide med energi, tilstedeværelse og bevissthet på en helhetlig måte, med mål om å hjelpe mennesker til å leve mer autentisk og i kontakt med seg selv.`,
  },
  {
    title: 'Filosofi',
    text:
      `Anne tror på at alle mennesker har en indre visdom og evne til selvhealing. Når vi lærer å lytte innover, skaper vi rom for transformasjon, vekst og et mer autentisk liv.
Arbeidet hennes bygger på:
- trygghet
- tilstedeværelse
- respekt
- intuisjon
- helhetlig forståelse av mennesket`,
  },
]

function About() {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 rounded-[2.5rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <img
              src={anneImage}
              alt="Portrett"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Litt om personen bak Autentisk Liv
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
             Anne Myrvoll brenner for personlig utvikling, autentisk livsutfoldelse og helhetlig healing. Gjennom coaching, energiarbeid og spirituell utvikling ønsker hun å hjelpe mennesker til å komme nærmere seg selv, finne indre ro og leve mer i tråd med sitt ekte jeg.
             Hun kombinerer livserfaring, intuitiv forståelse og faglig utvikling innen coaching og healing for å skape et trygt rom for transformasjon, vekst og bevisstgjøring.  </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[2rem] border border-stone-200 bg-white/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-md sm:p-8"
            >
              <h2 className="text-2xl font-semibold text-stone-900">
                {section.title}
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-stone-700">
                {section.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-[#6f7c63] px-6 py-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            Videre
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-2xl text-lg leading-8 text-white/90">
              Du kan fylle ut tekstene over med konkret innhold senere. Oppsettet er klart og følger samme visuelle stil som resten av siden.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3.5 font-semibold text-[#6f7c63] transition hover:bg-stone-100"
            >
              Se kurs
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About