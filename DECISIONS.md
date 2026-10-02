# Beslutningslog (Architecture Decision Records)

Dette dokument sporer centrale valg, fravalg og begrundelser for projektet for at sikre gennemskuelighed og undgå at genbesøge allerede afklarede dilemmaer.

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

## 📌 Beslutningskø Status

Alle indledende afklaringspunkter er nu behandlet og godkendt:

1. **[AFKLARET] Tråd 1: Holdsport & Snitflader** (ADR-001, ADR-005)
2. **[AFKLARET] Tråd 2: Autentificering, Identifikation og Nul-Admin** (ADR-002)
3. **[AFKLARET] Tråd 3: Løbskoordinering & Rytterklasser** (Fleksibel klasseangivelse)
4. **[AFKLARET] Tråd 4: Teknologistak & Cloud-valg** (ADR-003, ADR-006, ADR-007)
