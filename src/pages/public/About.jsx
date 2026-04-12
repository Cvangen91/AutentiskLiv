import { Link } from 'react-router-dom'
import anneImage from '../../assets/images/Anne1.jpg'

const infoCards = [
  { label: 'Navn', value: 'Legg inn navn' },
  { label: 'Alder', value: 'Legg inn alder' },
  { label: 'Bosted', value: 'Legg inn bosted' },
  { label: 'Fagområde', value: 'Legg inn fagområde' },
]

const sections = [
  {
    title: 'Utdannelse',
    text:
      'Skriv inn en kort oppsummering av utdannelsen din, relevante kurs og hva som har gitt deg kompetansen du bruker i dag.',
  },
  {
    title: 'Historie',
    text:
      'Fortell kort hvordan reisen din startet, hva som motiverte deg og hvorfor dette prosjektet betyr noe for deg.',
  },
  {
    title: 'Arbeid og erfaring',
    text:
      'Her kan du beskrive erfaringen din, hva du har jobbet med tidligere og hvordan det har formet måten du jobber på.',
  },
  {
    title: 'Hva du ønsker å skape',
    text:
      'Legg inn en liten avslutning om hva du ønsker å bidra med, og hva folk kan forvente av deg og innholdet ditt.',
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
              Om meg
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Litt om personen bak Autentisk Liv
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              Her kan du introdusere deg selv kort og varmt, slik at besøkende forstår hvem du er og hva du står for med en gang.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {infoCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-stone-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
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
              <p className="mt-4 text-base leading-8 text-stone-700">
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