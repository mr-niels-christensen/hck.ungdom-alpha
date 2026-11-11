# Arbejdsnotat: Shell Layout & Navigation

> Kopiér til `docs/agent/work/<beskrivende-navn>.md` ved ikke-trivielle opgaver. Udfyld kun relevante felter; hold notatet kort og opdater det, når beslutninger ændres.

## Mål og kontekst
- Problem og ønsket effekt: Etablere appens faste grundskelet (Shell Layout) med topbar, fast bundnavigation og ruteskift mellem Løbsplan (`/#/lob`) og Tips&tricks (`/#/tips`) iht. `docs/UX_SPEC.md` og ADR-008. Give brugeren adgang til at åbne/redigere sin profil fra topbaren.
- Relevant eksisterende adfærd/kode:
  - `src/App.tsx`: Viser pt. `OnboardingForm` hvis `!isOnboarded`, ellers en midlertidig placeholder med "Hej {parentName}".
  - `src/context/ProfileContext.tsx`: Styrer `profile`, `isOnboarded`, `isPinVerified`.
  - `src/components/OnboardingForm.tsx`: Formular til Flow 1.
  - `react-router-dom` (v7) og `lucide-react` findes allerede i `package.json`.

## Aftalt adfærd og acceptkriterier
- [ ] Hvis brugeren ikke er onboardet (`!isOnboarded`), vises `OnboardingForm` i fuld fokus uden bundnavigation.
- [ ] Når brugeren er onboardet, vises Shell Layout:
  - Topbar med klubnavn "HCK Ungdom" og forældernavn + rediger-ikon (`👤 {parentName} ✏️`).
  - Hovedområde, der renderer den aktive rute via React Router `HashRouter`.
  - Fast bundnavigation med to knapper: "🏁 Løbsplan" (`/#/lob`) og "💡 Tips&tricks" (`/#/tips`) med aktiv tilstandsmarkering i klubfarven `#F3434D` og touch-flader >= 44px.
  - Ugyldige ruter eller root (`/#/`) viderestilles automatisk til `/#/lob`.
- [ ] Midlertidige placeholders for `/#/lob` og `/#/tips`, så navigation og layout kan verificeres isoleret før Flow 2–4.
- [ ] Klik på forældernavn/blyant i topbaren åbner en profilmodal, hvor brugeren kan justere navn/ryttere eller lukke uden ændringer via en "Luk ✕"-knap.
- [ ] Alle interne logs/fejl på engelsk; brugergrænseflade på dansk (ADR-004).
- [ ] Tests dækker shell-visning, fane-navigation og profilmodal-åbning med stabile `data-testid`.

## Uden for scope
- Flow 2 & 3: Løbsblokke, tilkendegivelse, samkørsel og Supabase backend-kald.
- Flow 4: Tips-liste, søgning og oprettelse/redigering af noter.
- Service worker / offline PWA-caching (tages i senere fase).
- Luk profilmodal med Escape og scroll-lås af baggrunden (fravalgt af bruger 2026-11-11).

## Uafklarede spørgsmål
- Ingen (alle 4 spørgsmål afklaret med brugeren: HashRouter med redirect til /#/lob, fuld skærm for første onboarding, modal med 'Luk ✕' for profil fra topbar, samt enkle placeholders for flow 2 og 4).

## Løsningsvalg
- Valgt tilgang og begrundelse:
  - `react-router-dom`s `HashRouter`, `Routes`, `Route`, `NavLink`, `Navigate` anvendes iht. ADR-008 for robust back-button og deep-linking på GitHub Pages uden 404.
  - Central styling i `src/index.css` iht. ADR-009 med CSS flexbox/grid, CSS-variabler og touch-target standarder (min 44px).
  - Profilmodal åbnes som overlay via en history-post: `navigate(location.pathname, { state: { profileOpen: true } })`. `AppShell` udleder åben/lukket af `location.state?.profileOpen` (ingen lokal state), og "Luk ✕" samt gem lukker med `navigate(-1)`. Dermed lukker systemets/browserens tilbage-knap modalen iht. `docs/UX_SPEC.md`.
- Genbrugte komponenter/mønstre:
  - `useProfile()` fra `ProfileContext`.
  - Genbrug af `OnboardingForm` inde i profilmodalen via `onSaved` og en ny valgfri `onCancel`-prop, som viser "Luk ✕" inde i formularens kort (vises ikke ved første onboarding).
- Væsentlige risici eller alternativer:
  - Mobil browser viewport og bottom navigation clash med Safari/Chrome UI: Løses med `env(safe-area-inset-bottom)` og fast bundplacering.

## Deltrin (kræver godkendelse ét ad gangen, maks. 125 linjer)
- [x] **Deltrin 1: Routing & Shell komponenter med placeholders**
  - Opret `src/components/layout/AppShell.tsx` (Topbar + Nav + Outlet/children).
  - Opret placeholder-komponenter for Løbsplan og Tips&tricks.
  - Forbind `HashRouter` i `src/App.tsx` med ruter for `/lob` og `/tips` og redirect fra `*`.
  - Opret test for shell rendering og rutenavigation.
- [x] **Deltrin 2: Shell styling og mobil responsivitet i `index.css`**
  - Tilføj CSS for topbar, main scroll-område, fast bundnavigation (`.shell-header`, `.shell-nav`, `.shell-content`).
  - Sikr min. 44px touch-flader, aktiv fane-indikator i `#F3434D` og mobil safe-area.
- [x] **Deltrin 3a: Profilmodal – åbn/luk og tilbage-knap**
  - Profilknappen i topbaren tilføjer en history-post (`state.profileOpen`); `AppShell` viser en modal-wrapper om `OnboardingForm`, hvis "Luk ✕"-knap (via `onCancel`) ligger inde i det hvide kort.
  - Gem lukker via eksisterende `onSaved` → `navigate(-1)`; `OnboardingForm` ændres ikke.
  - Overlay-styling i `index.css`.
  - Integrationstest: åbn, luk med ✕, luk med tilbage, gem opdaterer navnet i topbaren.
- [ ] **Deltrin 3b: Redigeringstilstand i `OnboardingForm`**
  - Anden overskrift og knaptekst ved redigering af eksisterende profil; test herfor.
  - Fokus flyttes ind i profilmodalen, når den åbnes; test herfor.
  - Lange forældrenavne i topbaren afkortes med "…", og klubnavnet holdes på én linje (fund fra arkitekturreview 2026-11-11).
- [ ] **Afslutning af shell-arbejdet**
  - Manuel kontrol af bundnavigation og safe-area (`env(safe-area-inset-bottom)`) på iPhone i standalone-tilstand; kan ikke verificeres i headless Chrome.

## Beslutningslog
| Dato | Beslutning | Begrundelse/konsekvens |
|---|---|---|
| 2026-10-26 | Godkendt: HashRouter fra react-router-dom | Understøtter back-button og deep-linking out-of-the-box uden nye dependencies |
| 2026-10-26 | Godkendt: Fuld skærm for onboarding | Undgår at brugeren forlader registrering før PIN/navn er sat |
| 2026-10-26 | Godkendt: Modal overlay for profilredigering | Bevarer brugerens kontekst i den aktive fane |
| 2026-10-26 | Godkendt: Placeholders for /#/lob og /#/tips | Muliggør isoleret verifikation af shell |
| 2026-11-11 | Godkendt: Profilmodal styres via history-state (`location.state.profileOpen`) i stedet for lokal React-state | Lokal state ville ikke lade tilbage-knappen lukke modalen (krav i UX_SPEC). Bevarer overlay over aktiv fane uden nye dependencies. Kendt konsekvens: modalen genåbner ved genindlæsning, mens den er åben, og kan ikke deep-linkes. Alternativ `/#/profil` som selvstændig side fravalgt, da den bryder overlay-beslutningen. |
| 2026-11-11 | Review af 3a: "Luk ✕" flyttes ind i det hvide kort via `onCancel`-prop på `OnboardingForm`; test skal vise, at Luk ikke gemmer; tests bruger `data-testid` | Erstatter tidligere notat om, at `onCancel` ikke var nødvendig. Undtagelse fra 125-linjersgrænsen godkendt, men ikke brugt (124 linjer). |
| 2026-11-11 | Fokusflytning ind i modalen tages i 3b; Escape-luk og scroll-lås fravalgt | Brugerens valg efter review af 3a. |

## Verifikation
| Krav/risiko | Test eller kontrol | Resultat |
|---|---|---|
| Routing & fane-skift | Automatiserede vitest tests | Bestået (src/test/AppShell.test.tsx) |
| Onboarding isoleret | Test for `!isOnboarded` | Bestået (src/test/OnboardingForm.test.tsx) |
| Profilmodal åbn/luk | Vitest (åbn, Luk ✕ uden at gemme, tilbage-knap, gem, ingen Luk ved første onboarding) + kørende app i Chrome (tilbage/frem, genindlæsning, tomt navn) | Bestået (Deltrin 3a) |
| Touch target >= 44px | CSS-kontrol og visuel inspektion | Bestået (min 44px på profil-knap, 52px på nav-links) |
| Lint & TypeScript | `npm run lint` & `npm run build` | Bestået (0 errors, build succes) |

## Status og overdragelse
- Senest godkendte deltrin: Deltrin 2 godkendt og committet (d62f777)
- Aktuelt trin / næste handling: Deltrin 3a godkendt og committet (f316bba); test-id'er i `OnboardingForm`-tests committet (a3b1d97). Næste: Deltrin 3b.
- Kendte problemer og udeståender: Ingen
