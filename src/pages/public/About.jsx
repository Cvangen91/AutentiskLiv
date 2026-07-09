import { Link } from 'react-router-dom'
import anneImage from '../../assets/images/Anne1.jpg'
import eme1Badge from '../../assets/images/EME1-Practitioner-Badge.png'
import glh1Badge from '../../assets/images/GLH1-Practitioner-Badge.png'
import glh2Badge from '../../assets/images/GLH2-Practitioner-Badge.png'
import glh3Badge from '../../assets/images/GLH3-Practitioner-Badge.png'


const sections = [
  {
    title: 'Mitt hvorfor',
    text:
      `Kanskje du kjenner deg igjen i dette.
Jeg husker en kveld jeg satt alene på et hotellrom, helt tom etter enda en lang arbeidsuke. Jeg hadde gitt alt. Til jobben. Til kundene. Til alle rundt meg. Men til meg selv? Ingenting.
På utsiden fungerte alt. Jeg leverte. Jeg sto på. Jeg fikk ting til å gå rundt. Men inni meg var jeg utslitt på en måte jeg ikke klarte å sette ord på.
Jeg våknet med angst. Jeg satt i bilen og orket ikke gå inn.
Jeg hadde mistet kontakten med meg selv.
Det føltes som om jeg kjørte rundt og rundt i den samme rundkjøringen, år etter år, uten å finne avkjøringen.
Og under alt lå en frykt jeg nesten ikke turte å si høyt:
“Er dette alt livet skal være?”` },
  {
    title: 'Vendepunktet',
    text:
      `En kveld, mens jeg scrollet på telefonen bare for å koble ut litt, dukket det opp en annonse:
“Føler du deg utslitt? Utbrent? Trenger du en ny start?”
Det føltes som om universet snakket direkte til meg.
Jeg meldte meg på. Og det ble starten på alt.
Gjennom healing, energiarbeid og dypt indre arbeid begynte jeg sakte men sikkert å finne tilbake til meg selv.
Jeg begynte å forstå at kroppen min ikke jobbet mot meg — den prøvde å redde meg.
Jeg lærte å lytte til intuisjonen min igjen.
Til energien min.
Til den delen av meg som hadde vært stille altfor lenge.`  },
  {
    title: 'Hvor jeg er i dag',
    text: `Jeg gikk fra å telle ned til pensjonistlivet fordi jeg bare ville slippe å være så sliten…
…til å glede meg til å jobbe med dette resten av livet.
Det er ikke fordi livet plutselig ble perfekt.
Det er fordi jeg begynte å komme hjem til meg selv igjen.
Når vi finner tilbake til vårt autentiske selv, slutter vi å overleve livet — og begynner å leve det.`,
  },
  {
    title: 'Hvorfor jeg er her for deg',
    text:
      `Jeg vet hvordan det føles å være stuck.
Å gi alt og ikke ha noe igjen.
Å kjøre rundt i den samme rundkjøringen og ikke se avkjøringen.
Og jeg vet hvor mye som kan åpne seg når man begynner å finne veien hjem til seg selv.
Det er derfor jeg gjør det jeg gjør.
Ikke for å fortelle deg hvem du skal være. Men for å gå ved siden av deg mens du finner ut av det selv.
Ikke perfekt. Ikke ferdig. Men ekte.
Og det er der transformasjonen starter ❤️`,
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
            
            <div className="mt-8 grid grid-cols-4 gap-3">
              <img src={eme1Badge} alt="Utdanningsbadge 1" className="h-auto w-full rounded-lg shadow-md" />
              <img src={glh1Badge} alt="Utdanningsbadge 2" className="h-auto w-full rounded-lg shadow-md" />
              <img src={glh2Badge} alt="Utdanningsbadge 3" className="h-auto w-full rounded-lg shadow-md" />
              <img src={glh3Badge} alt="Utdanningsbadge 4" className="h-auto w-full rounded-lg shadow-md" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href="https://eme.autentiskliv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#6f7c63] px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#617255]"
              >
                Lær mer om EME
              </a>
              <a
                href="https://geo.autentiskliv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#6f7c63] px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#617255]"
              >
                Lær mer om GEO
              </a>
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
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-stone-700">
                {section.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-[#6f7c63] px-6 py-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            Hva vi jobber med sammen
          </p>

          <div className="mt-6 space-y-8 text-lg leading-8 text-white/90">
            <div>
              <h3 className="text-xl font-semibold text-white">Forstå kroppen din — ikke bekjempe den</h3>
              <p className="mt-3">
                Visste du at kroppen din husker alt du har opplevd? Stress, traumer og vanskelige livserfaringer setter seg ikke bare i tankene — de lever i kroppen, i nervesystemet, i musklene.
              </p>
              <p className="mt-3">Det kan vise seg som:</p>
              <ul className="mt-2 space-y-2 pl-6">
                <li>• En kronisk spenning du ikke klarer å slippe</li>
                <li>• Utmattelse som ikke går over med hvile</li>
                <li>• En følelse av å alltid være på vakt</li>
                <li>• Å reagere sterkt på ting som egentlig er små</li>
                <li>• En følelse av å være koblet fra deg selv</li>
              </ul>
              <p className="mt-3">
                Dette er ikke svakhet. Det er kroppen din som prøver å beskytte deg — på den eneste måten den vet hvordan.
              </p>
              <p className="mt-3">
                Når vi lærer å lytte til disse signalene i stedet for å kjempe mot dem, begynner noe å løsne.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">Nervesystemet — gass og bremse</h3>
              <p className="mt-3">
                Kroppen din har to moduser:
              </p>
              <ul className="mt-3 space-y-3 pl-6">
                <li>
                  <strong>Når du er i fare eller stress — sympatikus</strong>
                  <p className="mt-1">Øker pulsen, musklene spenner seg, kroppen gjør seg klar til å kjempe eller flykte. Dette er livsviktig i kortvarige situasjoner.</p>
                </li>
                <li>
                  <strong>Når du er trygg og rolig — parasympatikus</strong>
                  <p className="mt-1">Roer pulsen seg, fordøyelsen fungerer, immunforsvaret styrkes, kroppen reparerer seg selv. Dette er der healing skjer.</p>
                </li>
              </ul>
              <p className="mt-4">
                Problemet for mange er at de lever nesten permanent i den første modusen — alltid på, alltid klar, aldri helt av.
              </p>
              <p className="mt-3">
                Mye av det vi jobber med sammen handler om å hjelpe nervesystemet ditt tilbake til ro. Til trygghet. Til seg selv.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">Hormonene dine forteller en historie</h3>
              <p className="mt-3">
                Kroppen kommuniserer gjennom hormoner. Når vi er i kronisk stress skilles det ut mye kortisol og adrenalin — og over tid tapper det deg fullstendig.
              </p>
              <p className="mt-3">
                Men når du begynner å skape trygghet, tilhørighet og ro i livet ditt, begynner kroppen å produsere mer av det som faktisk gir deg energi og glede.
              </p>
              <p className="mt-3">
                Det er ikke magi. Det er biologi.
              </p>
              <p className="mt-3">
                Og det begynner med å tørre å senke skuldrene og ta imot støtte.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About