# AutentiskLiv – Prosjektdokumentasjon

Nettside for AutentiskLiv, en norsk kurs- og workshopplattform. Brukere kan bla gjennom og kjøpe kurs, logge inn som member for å se sine bestillinger og kurshistorikk, og administratorer kan administrere kurs, betalingsforespørsler og tilgjengelige tider.

Prosjektet er utviklet som bacheloroppgave ved Universitetet i Sør-Øst Norge.

---

## Innholdsfortegnelse

- [Tech-stack](#tech-stack)
- [Forutsetninger](#forutsetninger)
- [Kom i gang](#kom-i-gang)
- [Miljøvariabler](#miljøvariabler)
- [Filstruktur](#filstruktur)
- [Routing og sider](#routing-og-sider)
- [Roller og tilgangskontroll](#roller-og-tilgangskontroll)
- [Backend – Supabase](#backend--supabase)
- [Must knows](#must-knows)

---

## Tech-stack

| Teknologi | Versjon | Bruksområde |
|---|---|---|
| [React](https://react.dev/) | v19 | UI-rammeverk |
| [Vite](https://vite.dev/) | v7 | Byggeverktøy og utviklingsserver |
| [React Router](https://reactrouter.com/) | v7 | Klient-side routing |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Styling via utility-klasser |
| [Supabase](https://supabase.com/) | v2 | Backend: database, autentisering og fillagring |
| [Lucide React](https://lucide.dev/) | – | Ikonbibliotek |

---

## Forutsetninger

- **Node.js** v18 eller nyere
- **npm** (følger med Node.js)
- Tilgang til prosjektets Supabase-prosjekt (se [Miljøvariabler](#miljøvariabler))

---

## Kom i gang

```bash
# 1. Pakk ut zip-filen og naviger til prosjektmappen
cd autentiskliv

# 2. Installer avhengigheter
npm install

# 3. Opprett miljøvariabelfil (se seksjonen under)
# Opprett en fil som heter .env i prosjektmappen med innholdet beskrevet nedenfor

# 4. Start utviklingsserveren
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173) i nettleseren.

### Tilgjengelige skript

| Kommando | Beskrivelse |
|---|---|
| `npm run dev` | Start lokal utviklingsserver med hot reload |
| `npm run build` | Bygg produksjonsklar versjon til `/dist` |
| `npm run preview` | Forhåndsvis produksjonsbygget lokalt |
| `npm run lint` | Kjør ESLint for å sjekke kodekvalitet |

---

## Miljøvariabler

Opprett en `.env`-fil i prosjektrotens mappe med følgende variabler:

```env
VITE_SUPABASE_URL=https://<ditt-prosjekt>.supabase.co
VITE_SUPABASE_ANON_KEY=<din-anon-nøkkel>
```
---

## Filstruktur

```
autentiskliv/
├── public/                  # Statiske filer som serveres direkte
├── src/
│   ├── app/                 # Appens kjerneoppsett
│   │   ├── guards/          # Tilgangskontroll (redirect-logikk)
│   │   ├── layouts/         # Layoutwrappere for ulike brukerroller
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── MemberLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── providers/
│   │   │   └── AuthProvider.jsx   # Gjør auth-tilstand tilgjengelig globalt
│   │   └── routes/
│   │       ├── AppRoutes.jsx      # Samlet rutekonfigurasjon
│   │       ├── AdminRoute.jsx     # Beskytter admin-sider
│   │       ├── MemberRoute.jsx    # Beskytter member-sider
│   │       └── ProtectedRoute.jsx # Generisk beskyttelseskomponent
│   ├── assets/              # Bilder, video og SVG-filer brukt i koden
│   ├── components/          # Gjenbrukbare UI-komponenter
│   │   ├── admin/           # Komponenter kun brukt i admin-panelet
│   │   ├── common/          # Delte komponenter (f.eks. LoginModal)
│   │   ├── layout/          # Navbar og Footer
│   │   ├── member/          # Komponenter for innloggede brukere
│   │   └── public/          # Komponenter for offentlige sider
│   ├── constants/           # Faste verdier
│   │   ├── roles.js         # Rollekonstanter: ADMIN, MEMBER, PUBLIC
│   │   └── defaultCourseImage.js
│   ├── context/
│   │   └── AuthContext.jsx  # React Context for auth-tilstand
│   ├── features/            # Forretningslogikk og API-kall
│   │   ├── auth/
│   │   │   ├── authService.js     # Innlogging, registrering, utlogging
│   │   │   └── useAuth.js         # Hook for å bruke auth-context
│   │   ├── orders/
│   │   │   └── orderService.js    # Opprette ordre og betalingsforespørsler
│   │   └── users/
│   │       └── userService.js     # Hente og oppdatere brukerprofil
│   ├── hooks/
│   │   └── useRole.js       # Hook for å sjekke brukerens rolle
│   ├── lib/
│   │   └── supabase/
│   │       └── client.js    # Initialisering av Supabase-klienten
│   ├── pages/               # En fil per side/rute
│   │   ├── admin/
│   │   │   └── Admin.jsx          # Admin-dashboardet
│   │   ├── member/
│   │   │   ├── Profile.jsx        # Brukerprofil
│   │   │   └── MyCourseDetails.jsx
│   │   └── public/
│   │       ├── Home.jsx
│   │       ├── About.jsx
│   │       ├── Contact.jsx
│   │       ├── Courses.jsx
│   │       ├── Checkout.jsx
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   ├── styles/
│   │   └── colors.css       # Globale CSS-variabler for farger
│   ├── App.jsx              # Rotkomponent
│   └── main.jsx             # Inngangspunkt – renderer App til DOM
├── .env                     # Miljøvariabler (ikke i git)
├── index.html               # HTML-mal som Vite bruker
├── vite.config.js           # Vite- og Tailwind-konfigurasjon
└── package.json
```

---

## Routing og sider

Rutingen er satt opp i [src/app/routes/AppRoutes.jsx](src/app/routes/AppRoutes.jsx) med tre layouts:

### Offentlige ruter (`/`)
Tilgjengelig for alle uten innlogging.

| Rute | Side | Beskrivelse |
|---|---|---|
| `/` | Home | Landingsside med hero, video og introduksjon |
| `/about` | About | Om AutentiskLiv og Anne |
| `/contact` | Contact | Kontaktskjema |
| `/courses` | Courses | Oversikt over alle kurs |
| `/checkout/:productId` | Checkout | Kjøp av kurs |
| `/login` | Login | Innloggingsside |
| `/register` | Register | Registreringsside |

### Member-ruter (krever innlogging)
Brukere uten innlogging redirectes til `/login`.

| Rute | Side | Beskrivelse |
|---|---|---|
| `/profile` | Profile | Brukerprofil, kontaktinfo og kurshistorikk |
| `/my-courses/:courseId` | MyCourseDetails | Detaljer for et enkelt kurs |

### Admin-ruter (krever admin-rolle)
Brukere uten admin-rolle redirectes til `/`.

| Rute | Side | Beskrivelse |
|---|---|---|
| `/admin` | Admin | Dashboard med kursadministrasjon, betalinger og tider |

---

## Roller og tilgangskontroll

Rollene er definert i [src/constants/roles.js](src/constants/roles.js):

- **PUBLIC** – ikke innlogget bruker
- **MEMBER** – innlogget bruker (standard etter registrering)
- **ADMIN** – administrator med tilgang til admin-panelet

Rollen lagres på brukerprofilen i Supabase-databasen (`users`-tabellen). `useRole`-hooken ([src/hooks/useRole.js](src/hooks/useRole.js)) brukes for å lese rollen i komponenter. Rutekomponentene `AdminRoute` og `MemberRoute` håndterer selve tilgangsbegrensningen.

---

## Backend – Supabase

Supabase brukes som fullstack backend og erstatter behovet for en egen server. Klienten initialiseres i [src/lib/supabase/client.js](src/lib/supabase/client.js).

### Databasetabeller

| Tabell | Beskrivelse |
|---|---|
| `users` | Brukerprofiler med rolle, navn og kontaktinfo |
| `courses` | Kurs med tittel, beskrivelse og bilde |
| `products` | Produkter knyttet til kurs (pris, type) |
| `time_slots` | Tilgjengelige tider for kurs/timer |
| `bookings` | Bestillinger av tider |
| `enrollments` | Kursregistreringer per bruker |
| `order_items` | Enkeltlinjer i en ordre |
| `payment_requests` | Betalingsforespørsler som venter på godkjenning |

Resterende tabeller og informasjon finnes i rapporten.

### Fillagring

Kursbilder lastes opp til Supabase Storage i bucketen **`course-images`** og lenkes til kursoppføringen i `courses`-tabellen.

### Autentisering

Supabase Auth brukes for innlogging og registrering (e-post/passord). Auth-tilstanden lyttes til globalt i `AuthProvider` og gjøres tilgjengelig via `AuthContext`. Se [src/features/auth/authService.js](src/features/auth/authService.js) for alle auth-operasjoner.

---

## Must knows

**Tailwind v4 brukes uten konfigurasjonsfil**
Tailwind er satt opp via Vite-pluginen (`@tailwindcss/vite`) og krever ingen `tailwind.config.js`. Globale fargevariabler defineres i [src/styles/colors.css](src/styles/colors.css).

**Alle API-kall går gjennom `features/`**
Komponenter skal ikke kalle Supabase direkte. All databaselogikk ligger i service-filer under `src/features/`. Dette gjør det enklere å endre backend uten å røre UI-komponentene.

**Nye brukere får rollen MEMBER automatisk**
Ved registrering opprettes det automatisk en rad i `users`-tabellen med rolle satt til `MEMBER`. For å gi noen admin-tilgang må rollen endres manuelt i Supabase-dashboardet.

**Miljøvariabler må starte med `VITE_`**
Vite eksponerer kun miljøvariabler som starter med `VITE_` til klientkoden. Variabler uten dette prefikset vil ikke være tilgjengelige i nettleseren.
