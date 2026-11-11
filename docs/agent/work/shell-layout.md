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

## Uafklarede spørgsmål
- Ingen (alle 4 spørgsmål afklaret med brugeren: HashRouter med redirect til /#/lob, fuld skærm for første onboarding, modal med 'Luk ✕' for profil fra topbar, samt enkle placeholders for flow 2 og 4).

## Løsningsvalg
- Valgt tilgang og begrundelse:
  - `react-router-dom`s `HashRouter`, `Routes`, `Route`, `NavLink`, `Navigate` anvendes iht. ADR-008 for robust back-button og deep-linking på GitHub Pages uden 404.
  - Central styling i `src/index.css` iht. ADR-009 med CSS flexbox/grid, CSS-variabler og touch-target standarder (min 44px).
  - Profilmodal styres lokalt i Shell med adgang til `ProfileContext`.
- Genbrugte komponenter/mønstre:
  - `useProfile()` fra `ProfileContext`.
  - Genbrug af `OnboardingForm` inde i profilmodalen (tilføjes `onCancel`/`onClose` prop).
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
- [ ] **Deltrin 3: Profil-modal fra Topbar**
  - Gør `OnboardingForm` i stand til at modtage en `onCancel`-callback til brug i modal.
  - Kobl klik på profil i topbaren til at åbne/lukke profilmodalen over aktiv side.
  - Tilføj integrationstest for åbning, redigering og lukning af profilmodalen.

## Beslutningslog
| Dato | Beslutning | Begrundelse/konsekvens |
|---|---|---|
| 2026-10-26 | Godkendt: HashRouter fra react-router-dom | Understøtter back-button og deep-linking out-of-the-box uden nye dependencies |
| 2026-10-26 | Godkendt: Fuld skærm for onboarding | Undgår at brugeren forlader registrering før PIN/navn er sat |
| 2026-10-26 | Godkendt: Modal overlay for profilredigering | Bevarer brugerens kontekst i den aktive fane |
| 2026-10-26 | Godkendt: Placeholders for /#/lob og /#/tips | Muliggør isoleret verifikation af shell |

## Verifikation
| Krav/risiko | Test eller kontrol | Resultat |
|---|---|---|
| Routing & fane-skift | Automatiserede vitest tests | Bestået (src/test/AppShell.test.tsx) |
| Onboarding isoleret | Test for `!isOnboarded` | Bestået (src/test/OnboardingForm.test.tsx) |
| Profilmodal åbn/luk | Test af klik på profil-knap | Afventer Deltrin 3 |
| Touch target >= 44px | CSS-kontrol og visuel inspektion | Bestået (min 44px på profil-knap, 52px på nav-links) |
| Lint & TypeScript | `npm run lint` & `npm run build` | Bestået (0 errors, build succes) |

## Status og overdragelse
- Senest godkendte deltrin: Deltrin 1 godkendt og committet af bruger
- Aktuelt trin / næste handling: Deltrin 2 gennemført og klar til review; afventer godkendelse før Deltrin 3
- Kendte problemer og udeståender: Ingen
