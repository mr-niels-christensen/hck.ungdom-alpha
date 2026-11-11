# Beslutningslog (Architecture Decision Records)

Dette dokument sporer centrale valg, fravalg og begrundelser for projektet for at sikre gennemskuelighed og undgå at genbesøge allerede afklarede dilemmaer.

---

## 📌 Beslutningskø Status

Tråde markeres `[ÅBEN]` eller `[AFKLARET]` (find åbne med `grep -n "^\*\*\[ÅBEN\]" DECISIONS.md`). Hver åben tråd angiver, hvilken opgave i README → *Status & Næste Skridt* der afgør den. Når en tråd afgøres, skrives beslutningen som ADR, tråden markeres `[AFKLARET]`, og den fjernes fra README's åbne beslutninger.

### Åbne tråde

### Tråd 7: Adgang & datamodel

**[ÅBEN]** · Afgøres i: opgave 3 (Adgang & datamodel). Opstået ved arkitekturreview 2026-11-11.

1. **Klub-PIN beskytter ikke data**: PIN'en (`VITE_CLUB_PIN`, fallback i `src/constants/config.ts`) bygges ind i det offentlige JS-bundle på GitHub Pages, og Supabase anon-nøglen vil også ligge der. Uden server-side tjek kan alle med nøglen læse og skrive tabellerne direkte, uanset PIN. Holder ADR-002's "holder uvedkommende ude" kun for UI'et? Mulig løsning: PIN tjekkes i Supabase via RLS-politik på en request-header eller via RPC-funktioner, der kræver PIN.
2. **Persondata om børn**: ADR-002 siger "ingen følsomme persondata" (korrekt i GDPR-forstand: ingen særlige kategorier), men `race_attendance` vil indeholde navne og aldersklasser på mindreårige samt forældrenavne. Uafklaret: opbevaringstid (fx sletning ved sæsonafslutning), hvem i klubben der er dataansvarlig, og hvordan en familie får slettet sine data.
3. **Identitet for tilkendegivelser**: rækker identificeres med fritekst `parent_name` + `rider_name`. Uden en regel opstår dubletter ("Mads"/"mads " fra to enheder), to forældre til samme barn opretter hver sin række, omdøbning efterlader gamle rækker, og to børn med samme navn i samme klasse kan kollidere. Muligheder:
   - **A. Én række pr. rytter pr. løb (anbefalet)**: unik nøgle `(race_id, normaliseret rider_name, rider_class)` (trim + små bogstaver). Begge forældre og alle enheder opdaterer samme række (sidst gemte vinder); `parent_name` gemmes som "senest opdateret af". Ingen ny tabel eller admin. Begrænsninger: børn med samme navn og klasse skelnes manuelt (fx "Emil H."); omdøbning efterlader gamle rækker.
   - **B. Én række pr. forælder + rytter**: som UX_SPEC antyder. Simpelst, men giver dubletter ved to forældre og stavevarianter.
   - **C. Fælles rytterregister i Supabase**: `riders`-tabel med stabile id'er, som profilen vælger fra eller opretter i. Løser alle tilfælde, men indfører en central liste over klubbens børn (i modstrid med ADR-002's "ingen central stamdatastyring"), mere persondata og mere UI/kode.
4. **Supabase-pause**: gratis projekter pauses efter ca. en uge uden trafik, hvilket strider mod "set-and-forget" i lavsæsonen. Valg: acceptér manuel genaktivering hvert forår, eller tilføj en planlagt GitHub Action, der holder projektet aktivt.
5. **Kilde til løbsdata**: README og ADR-002 nævner `races.json` i Git *eller* Supabase; ADR-007 nævner Supabase Table Editor. Vælg én.

### Afklarede tråde

- **[AFKLARET] Tråd 1: Holdsport & Snitflader** (ADR-001, ADR-005)
- **[AFKLARET] Tråd 2: Autentificering, Identifikation og Nul-Admin** (ADR-002)
- **[AFKLARET] Tråd 3: Løbskoordinering & Rytterklasser** (Fleksibel klasseangivelse)
- **[AFKLARET] Tråd 4: Teknologistak & Cloud-valg** (ADR-003, ADR-006, ADR-007)
- **[AFKLARET] Tråd 5: Frontend Routing & PWA** (ADR-008)
- **[AFKLARET] Tråd 6: Styling-strategi & Visuel Identitet** (ADR-009)
- **[AFKLARET] Tråd 8: Accepterede review-fund** (arkitekturreview 2026-11-11). Følgende ændres bevidst ikke:
   - *Service worker er allerede aktiv*, selvom shell-arbejdsnotatet kalder den "senere fase": ok, kun dokumentationen rettes (opgave 2).
   - *`?pin=` bliver stående i adresselinjen*: ok, linket med PIN deles bevidst i klubbens Messenger-gruppe.
   - *Lint-advarslen `only-export-components`* (hook og provider i samme fil, `ProfileContext.tsx`): ok, almindeligt mønster, der kun påvirker fast refresh under udvikling.

---

## ADR-001: Fokusér på to adskilte kernebehov (Løbsplan & Viden)

* **Status**: Godkendt
* **Kontekst**: Forældregruppen (~20 forældre/børn) har mange berøringsflader (betaling, medlemskab, træningstider, Facebook-opslag, Messenger). Der er en risiko for feature creep.
* **Beslutning**: Vi afgrænser projektet strengt til:
  1. *Løbsoverblik & tilkendegivelser* (hvem kører hvad i weekenden, samkørsel).
  2. *Forældrehåndbog / vidensdeling* (gearing, chip, pakkeliste, løbsdagsrutine).
* **Fravalg**: Betaling, officielle tilmeldinger, ad hoc chat og medlemsstyring overlades til eksisterende systemer (bank, Sportstiming, Messenger).
* **Konsekvens**: Ekstremt lille overflade at bygge og vedligeholde.

---

## ADR-002: Autentificering, Identifikation og Nul-Admin Model

* **Status**: Godkendt
* **Kontekst**: Vi ønsker minimal kompleksitet og nul vedligeholdelse af brugerlister eller adgangskoder. Der er ingen følsomme persondata.
* **Beslutning**:
  1. **Autentificering (Klubadgang)**: Én fælles klub-PIN / token (f.eks. i URL'en eller tastet én gang pr. browser). Holder uvedkommende og søgerobotter ude.
  2. **Identifikation (Selvangivelse)**: Ingen central stamdatastyring af ryttere/forældre. Brugeren indtaster selv sit navn og rytterens navn/klasse (f.eks. "Jens (far til Mads, U13)") ved første besøg. Gemmes lokalt i browseren (`localStorage`).
  3. **Ingen Admin-brugerflade**: Vi bygger ingen admin-login eller rettighedsstyring. Kalenderen vedligeholdes direkte "uden om web-grænsefladen" (f.eks. via en `races.json` / Markdown-fil i Git eller direkte i databasen).
  4. **Multi-device (Mobil + Laptop)**: Da der ikke er adgangskoder, kræver et skift til laptop blot, at brugeren klikker på linket (f.eks. fra Messenger) og taster sit navn én gang på laptoppen også.
* **Konsekvens**: Ekstrem forenkling. Nul kode til rettighedsstyring, brugerprofiler, password-reset eller admin-paneler.

---

## ADR-003: Driftsmodel & Økonomi (0 kr. i faste omkostninger)

* **Status**: Godkendt princip
* **Kontekst**: Der er intet budget eller foreningsmidler allokeret til softwarelicenser eller servere. Løsningen skal køre stabilt på gratis tiers og kræve 0 drift/sikkerhedsopdateringer af OS/containere.
* **Overvejede tekniske arkitekturer**:
  * **Mulighed A: Færdig SaaS (Notion / SportMember)**
    * *SportMember / Holdsport*: God til fremmøde til faste træninger, men elendig til at vælge mellem 3 parallelle weekendløb med samkørselsnoter og uformel vidensdeling. Meget reklamebaseret på gratis plan.
    * *Notion*: God vidensbase, men kræver Notion-konti til redigering, og databaser på mobil kan føles klodsede for uøvede forældre.
  * **Mulighed B: Statisk site til Viden (Astro/Starlight) + Mini Web-App til Løb**
    * Dokumentation hostes gratis på GitHub Pages / Cloudflare Pages (Markdown/MDX, lynhurtigt, mobiloptimeret).
    * Løbskalender koblet på en gratis serverless backend (f.eks. Supabase Free Tier, Cloudflare D1/Workers, eller et Google Sheet bag et API).
  * **Mulighed C: En samlet, mobilfokuseret Web App (PWA)**
    * Ét fælles site (f.eks. bygget i SvelteKit, Next.js eller Vite) med to faner: "Løb" og "Håndbog".
    * Hostet på Vercel eller Cloudflare Pages.
    * Data i Supabase (PostgreSQL med gratis tier) eller Cloudflare KV/D1.
* **Foreløbig anbefaling**: En samlet letvægts Web App (Mulighed C eller B samlet under ét domæne) med mobilfokus, da 90% af forældre vil tilgå dette fra telefonen i bilen eller på farten.

---

## ADR-004: Sprog og Brugervenlighed

* **Status**: Godkendt
* **Beslutning**: Alt indhold, navigation og terminologi skal være på **dansk** og anvende den velkendte cykeljargon (f.eks. "udrulning", "licensklasse", "transponder", "service-depot", "samkørsel").
* **Begrundelse**: Sænker barrieren for alle forældre.

---

## ADR-005: Evaluering af færdige Cloud-platforme (SaaS)

* **Status**: Evalueret / Se overvejelser nedenfor
* **Kandidater**: Spond, Notion, Google Workspace (Sites+Sheets), Holdsport/SportMember.
* **Vurdering**:
  * *Spond*: Stærk på aktivitet & indbygget kørsel/chat, men håndterer dårligt valget mellem parallelle weekendløb, og mangler en rigtig vidensbase/wiki.
  * *Notion*: Fremragende vidensbase, men dårlig mobiloplevelse på tabeller for ikke-tekniske forældre samt krav om individuelle Notion-konti til redigering på gratis plan.
  * *Google Workspace*: Gratis og velkendt, men Google Sheets på mobil er en dårlig oplevelse at udfylde for forældre.
* **Konklusion**: Ingen standardværktøjer løser begge behov elegant i én simpel, mobilgrænseflade uden login-bøvl.

---

## ADR-006: Data-persistens og hosting i EU

* **Status**: Besluttet princip
* **Beslutning**: Al databasepersistens og datalagring skal placeres inden for EU (f.eks. Frankfurt, Amsterdam eller Irland).
* **Begrundelse**: Overholde GDPR-principper og brugerens ønske om EU-baseret databehandling uden amerikansk cloud-lockin/jurisdiktion for persondata.

---

## ADR-007: Teknologistak (GitHub Pages + Supabase EU)

* **Status**: Godkendt
* **Kontekst**: Målet er færrest mulige eksterne leverandører, 0 kr. i drift, nul servervedligeholdelse og data i EU. Brugeren har allerede en GitHub-konto.
* **Beslutning**:
  1. **Frontend & Hosting**: **GitHub Pages** (Single Page App / PWA). Koden pushes til GitHub, og GitHub Actions bygger og deployer automatisk til Pages. 100% gratis, ingen nye hostingkonti.
  2. **Database & API**: **Supabase (Frankfurt)**. Gratis PostgreSQL med automatisk REST/Realtime API. Browseren taler direkte til Supabase uden behov for en custom backend-server. Tovholder kan redigere rå data direkte i Supabases Table Editor.
* **Fravalg**: 
  * Cloudflare/Vercel (fravalgt for at minimere antallet af leverandører/konti, når GitHub allerede er til stede).
  * MongoDB Atlas (fravalgt da det mangler direkte browser-API og ville kræve et serverless mellemlag).
* **Konsekvens**: Ekstremt slank arkitektur med kun 1 ny leverandør (Supabase) og 0 servere at patche.

---

## ADR-008: Frontend-arkitektur (React, Hash-routing & PWA)

* **Status**: Godkendt
* **Beslutning**:
  1. **Framework**: React + TypeScript bygget med Vite.
  2. **Routing**: Hash-routing (`/#/lob`, `/#/guide`). Giver deep-linking (f.eks. deling af direkte links til et løb i Messenger) og browser-navigation ("tilbage"-knap) uden at risikere 404-fejl på GitHub Pages' statiske hosting.
  3. **PWA (Progressive Web App)**: Udstyres med webmanifest og service worker. Giver forældrene mulighed for at installere appen på startskærmen på iPhone/Android uden om App Store, med "standalone" app-oplevelse og offline caching til stævnepladser med ringe mobildækning.

---

## ADR-009: Styling-strategi og visuel identitet

* **Status**: Godkendt
* **Kontekst**: Behov for en genkendelig, enkel og vedligeholdelsesvenlig brugerflade optimeret til forældre på mobilen.
* **Beslutning**:
  1. **Enkelthed frem for tooling**: Ren Vanilla CSS samlet centralt i `src/index.css`. Ingen CSS-in-JS, Tailwind eller separate CSS-moduler pr. komponent, så koden forbliver letlæselig og nem at vedligeholde.
  2. **Klubidentitet**: Hvidovre Cykle Klubs trøjefarve `#F3434D` (rød med hvid tekst) anvendes som primær accentfarve (fremhævede CTA'er, fokusmarkeringer og overskriftsmarkører) på en rolig, lys baggrund (`#ffffff` / `#f8fafc`).
  3. **Mobil-først & touch-venlighed**: Formularkomponenter og visninger dimensioneres primært til smartphones (`max-width: 460px`) med touch-targets på min. 44px i overensstemmelse med brug på stævnepladser.

