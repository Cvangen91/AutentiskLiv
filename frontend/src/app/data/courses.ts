export interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  modules: string[];
  whatYouLearn: string[];
  participants: number;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Finn din Indre Styrke',
    description: 'Et kurs for å oppdage og styrke din indre kraft gjennom meditasjon og refleksjon.',
    fullDescription: 'Dette kurset tar deg med på en reise innover for å finne og styrke din indre kraft. Gjennom guidede meditasjoner, refleksjonsøvelser og praktiske verktøy vil du lære å lytte til din indre stemme og finne balanse i hverdagen. Kurset er designet for deg som ønsker å bygge et sterkere fundament for personlig vekst og utvikling.',
    image: 'meditation woman peaceful',
    modules: [
      'Introduksjon til indre styrke',
      'Meditasjon og mindfulness',
      'Refleksjonsøvelser',
      'Å finne din indre stemme',
      'Praktisk implementering i hverdagen',
    ],
    whatYouLearn: [
      'Teknikker for daglig meditasjon',
      'Hvordan finne ro i hverdagen',
      'Verktøy for selvrefleksjon',
      'Bygge emosjonell styrke',
      'Skape varige vaner',
    ],
    participants: 42,
  },
  {
    id: '2',
    title: 'Autentisk Kommunikasjon',
    description: 'Lær å kommunisere ærlig og fra hjertet i alle relasjoner.',
    fullDescription: 'Opplev kraften i autentisk kommunikasjon. Dette kurset lærer deg å uttrykke deg ærlig og fra hjertet, samtidig som du skaper dypere forbindelser med andre. Du vil lære konkrete verktøy for å håndtere vanskelige samtaler, sette grenser og bygge tillit i alle dine relasjoner.',
    image: 'two women talking nature',
    modules: [
      'Grunnleggende prinsipper for autentisk kommunikasjon',
      'Aktiv lytting',
      'Å uttrykke følelser ærlig',
      'Sette grenser med kjærlighet',
      'Konflikthåndtering',
    ],
    whatYouLearn: [
      'Lytte dypere til andre',
      'Uttrykke dine sanne følelser',
      'Håndtere konflikter konstruktivt',
      'Bygge tillit i relasjoner',
      'Sette sunne grenser',
    ],
    participants: 38,
  },
  {
    id: '3',
    title: 'Naturens Kraft',
    description: 'Koble deg til naturen og finn healende kraft i det enkle.',
    fullDescription: 'Dette kurset inviterer deg til å gjenoppdage din forbindelse med naturen. Lær hvordan naturen kan være din største lærer og healer. Gjennom guidede øvelser utendørs og refleksjoner vil du finne ro, healing og perspektiv.',
    image: 'forest sunlight peaceful',
    modules: [
      'Naturens visdom',
      'Grounding-øvelser',
      'Sesongenes rytmer',
      'Naturmeditasjon',
      'Integrere naturen i hverdagen',
    ],
    whatYouLearn: [
      'Teknikker for grounding',
      'Meditasjon i naturen',
      'Leve i takt med årstidene',
      'Finne ro gjennom naturopplevelser',
      'Healing gjennom naturkontakt',
    ],
    participants: 29,
  },
  {
    id: '4',
    title: 'Selvomsorg og Balanse',
    description: 'Skape sunne rutiner og finne balanse mellom alle livets aspekter.',
    fullDescription: 'Dette kurset gir deg verktøy til å skape varige rutiner for selvomsorg og balanse i livet. Du vil lære å prioritere deg selv uten skyldfølelse, finne harmoni mellom jobb og fritid, og bygge et liv som er bærekraftig og meningsfylt.',
    image: 'yoga woman sunrise',
    modules: [
      'Hva er ekte selvomsorg?',
      'Skape sunne rutiner',
      'Balanse i hverdagen',
      'Håndtere stress',
      'Bygge et bærekraftig liv',
    ],
    whatYouLearn: [
      'Prioritere deg selv uten skyld',
      'Lage morgenen- og kveldrutiner',
      'Stresshåndteringsteknikker',
      'Finne balanse mellom arbeid og fritid',
      'Bygge langsiktige vaner',
    ],
    participants: 51,
  },
];
