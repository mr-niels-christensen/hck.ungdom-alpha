# HCK Ungdom – Hjælp til løb & forældre

Et letvægts, uformelt støtteværktøj til forældre og unge licensryttere i cykelklubben (~20 ryttere, ~20 forældre). 

Formålet er at fjerne friktion i hverdagen omkring **løbsplanlægning** og **videndeling**, uden at introducere unødig administration, driftsomkostninger eller besværlige logins. Løsningen er tænkt som en pragmatisk løsning til de næste 1–2 sæsoner.

---

## 🎯 Formål og Problemstilling

Facebook og Messenger fungerer fint til hurtige beskeder og store fællesture med overnatning, men bryder sammen på to centrale områder:

1. **Weekend-løbskoordinering**:
   * I sæsonen er der typisk 2–4 løb hver weekend. Tovholder opretter og justerer løb løbende.
   * Ryttere vil gerne køre de løb, hvor deres klubkammerater også stiller op.
   * **Rytter vs. Forælder**: Forældre melder ind på vegne af rytteren (barnet), men skal også kunne angive forældredeltagelse.
   * **Samkørsel kræver dialog**: Det er sjældent bare "ja/nej" – pladser forhandles ("kan Erik få pladsen?", "har du plads til en voksen også?").
   * Officielle portaler (f.eks. Sportstiming / DCU) har ikke tidlige overblik eller sociale tilkendegivelser ("hvem overvejer hvad").
2. **Videndeling for nye forældre ("Cykel-forældrehåndbogen")**:
   * Stejl læringskurve for nye cykelforældre (gearing/udrulningskrav pr. aldersklasse som U11/U13/U15/U17, chip/transponder, licens, løbsdagsrutiner, tøj, dæktryk, opvarmning).
   * **Åben for alle**: Enhver forælder i gruppen skal have mulighed for at dele/redigere viden, da værdifulde guldkorn kommer fra mange forskellige forældre.
   * Værdifuld viden forsvinder i dag i 1-til-1 Messenger-tråde og skal gentages hver sæson.

---

## 🚫 Afgrænsning (Out of Scope)

For at holde løsningen helt simpel og vedligeholdelsesfri er følgende **ikke** en del af projektet:
* ❌ **Ingen betalinger eller kontingenter** (håndteres via klubbens eksisterende kanaler/bank).
* ❌ **Ingen officiel klubadministration eller medlemskartotek**.
* ❌ **Ingen intern chat/beskedtjeneste** (Messenger/Facebook fortsætter til fri snak).
* ❌ **Ingen officiel resultatregistrering** (Sportstiming dækker dette).

---

## 💡 Hovedkrav & Principper

| Princip | Beskrivelse |
| :--- | :--- |
| **0 kr. i drift** | Ingen faste månedlige server- eller licensomkostninger (udnyttelse af gratis tiers: GitHub Pages, Cloudflare, Vercel, Supabase el.lign.). |
| **Minimal vedligeholdelse** | Ingen servere der skal patches, ingen komplekse databaser, "set-and-forget". |
| **Lav brugerfriktion** | Dansk sprog, mobilvenligt design. Ingen krav om oprettelse af brugernavn/password for hver enkelt forælder. |
| **Passende privatliv** | Ikke åbent for hele internettet, men uden unødigt bureaukrati (ingen følsomme persondata). |

---

## 🛠️ Valgt Teknologistak

For at minimere antallet af leverandører og sikre 0 kr. i drift:

| Komponent | Teknologi | Formål / Beskrivelse |
| :--- | :--- | :--- |
| **Hosting & CI/CD** | **GitHub Pages** | Gratis statisk hosting af Single Page App / PWA direkte fra dit eksisterende GitHub-repo. Bygges og deployes automatisk via GitHub Actions ved `git push`. |
| **Database & API** | **Supabase (EU - Frankfurt)** | Gratis managed PostgreSQL. Klienten taler direkte med Supabase via HTTPS/WebSockets uden separat backend-server. Du kan rette løb og rå data direkte i Supabases web-tabel. |
| **Frontend Framework** | **Vite + React (TypeScript)** | Letvægts, lynhurtig mobilgrænseflade med **Hash-routing** (for deep-linking uden 404-fejl på GitHub Pages) og **PWA** (kan installeres på startskærm med offline caching). |

---

## 🔐 Adgang og Identitet (Nul-Admin)

* **Klubadgang**: Én fælles PIN/nøgle (f.eks. i linket delt på Messenger/Holdsport), gemmes i `localStorage`.
* **Identitet**: Forælderen taster selv sit navn og rytterens navn/klasse (f.eks. *"Jens (far til Mads, U13)"*) ved første besøg.
* **Nul admin-kode**: Kalenderen opdateres direkte af tovholder via GitHub (`races.json`) eller direkte i Supabases webinterface. Ingen brugerprofiler eller adgangskoder at administrere.

---

## 📋 Status & Næste Skridt

Se [DECISIONS.md](file:///Users/nhc/git/hck.ungdom-alpha/DECISIONS.md) for uddybende begrundelser for alle trufne valg (ADR-001 til ADR-008).

- [x] Oprettet indledende projektomfang og afgrænset mod Holdsport (ADR-001, ADR-005)
- [x] Besluttet adgangs- og identitetsmodel uden adgangskoder og uden admin-UI (ADR-002)
- [x] Afklaret rytterklasser og samkørselsbehov (ADR-004)
- [x] Valgt teknologistak: GitHub Pages + Supabase EU (ADR-003, ADR-006, ADR-007)
- [x] Fastlagt frontend-arkitektur: React + TS + Hash-routing + PWA (ADR-008)
- [x] Flyttet mappe til `~/git/hck.ungdom-alpha` og åbnet workspace
- [x] Scaffolde React + Vite projektet og GitHub Actions deploy workflow
- [ ] Definere datamodellen (Supabase skema for løb, tilkendegivelser/noter og vidensartikler - tages senere)
