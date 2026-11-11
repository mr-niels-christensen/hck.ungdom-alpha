# Agent Guidelines for HCK Ungdom

Disse regler gælder for AI-agenter, der arbejder i dette repository, uanset model. Målet er den mindste korrekte, vedligeholdbare løsning med tydelige afklaringer og dokumenteret verifikation. Følg eksisterende arkitektur, ADR'er og projektkonventioner. Hvis instruktioner er modstridende, så gør konflikten synlig og spørg frem for at gætte.

## Supporting instructions

Ved ny session: start i `README.md` → *Status & Næste Skridt* (åbne beslutninger og næste opgaver i rækkefølge); læs åbne tråde i `DECISIONS.md` og den aktive arbejdsfil under `docs/agent/work/`. Hold disse tre steder ajour, når opgaver afsluttes eller beslutninger træffes.

For non-trivial tasks, use:
@docs/agent/WORK_TEMPLATE.md

Before declaring a task complete, consult:
@docs/agent/REVIEW_CHECKLIST.md

## 1. Vælg proces efter opgavens risiko

- **Lille, entydig ændring:** Undersøg relevant kode, implementér, verificér og opsummér. Ingen obligatorisk planfil.
- **Feature eller ændring med flere deltrin:** Afklar krav, skriv en kort arbejdsplan med `docs/agent/WORK_TEMPLATE.md` som skabelon, og få brugerens godkendelse før implementering.
- **Høj risiko** (fx autorisation, persondata, migration, destruktive ændringer eller bred arkitekturpåvirkning): Beskriv risici, alternativer, acceptkriterier og rollback/migrationshensyn eksplicit, og få godkendelse.
- Spørg kun om uklarheder, der kan ændre adfærd, scope, sikkerhed eller teknisk valg. Saml beslægtede spørgsmål; opfind ikke produktkrav.
- For større opgaver: opret en opgavespecifik fil under `docs/agent/work/` fra skabelonen. Brug ikke én fælles `current.md`, der kan overskrive tidligere arbejde.

## 2. Scope og beslutninger

- Implementér kun aftalt scope. Notér sidefund separat; ret dem ikke uden aftale.
- Genbrug eksisterende kode, services, contexts og mønstre. Undgå nye dependencies og abstraktioner uden begrundelse.
- Dokumentér væsentlige afklaringer og beslutninger løbende i arbejdsfilen, så en ny chatsession kan fortsætte.
- Ved væsentlig afvigelse fra godkendt plan: stop, forklar konsekvens og indhent godkendelse. Opdatér arbejdsfilen, når ændringen er godkendt.
- Ændr ikke eksisterende ADR'er uden eksplicit aftale.

## 3. Små inkrementer og hyppigt review (maks. 125 linjer)

- **Maksimalt 125 linjers kodeændringer** ad gangen før stop og brugerreview. Tæl tilføjede og slettede linjer i kodefiler samlet siden seneste godkendelse; ren testdata (fx mock-brugere, personas og fixtures) er undtaget. Tests, konfiguration og øvrig kode tæller med.
- Opdel arbejdet i logiske, overskuelige deltrin. Hvis et deltrin forventes at overskride grænsen, så del det yderligere op eller bed om en eksplicit undtagelse *før* ændringen.
- **Udfør kun ét navngivet deltrin ad gangen.** Efter hvert deltrin: opsummér diff, verifikation og næste deltrin, og afvent udtrykkelig godkendelse. Stilhed er ikke godkendelse.
- Kør relevante tests for det gennemførte deltrin før review, hvor det er praktisk muligt. Stop også ved uventede problemer eller betydelige nye risici.

## 4. Logs, fejlbeskeder og UI-sprog

- Alle `console.log`, `console.warn`, `console.error`, fejlobjekter (`new Error(...)`) og interne logbeskeder skal være på **engelsk**.
- UI og tekster rettet mod cykelforældrene forbliver på **dansk**, jf. ADR-004.

## 5. Funktionskommentarer (> 6 linjer)

- Enhver funktion længere end **6 linjer** skal have en forklarende kommentar på funktionsniveau (JSDoc eller blokkommentar).
- Beskriv kort formål, input og output eller væsentlige sideeffekter. Undgå kommentarer, der blot gentager koden.

## 6. Robuste automatiserede tests

- Interaktive elementer, der aktiveres i tests, identificeres via stabile `data-testid`, så tests ikke afhænger af oversatte UI-tekster. Brug semantiske roller til at teste tilstande og tilgængelighed, hvor det er relevant.
- Test tilstedeværelse af fejl og tilstande (fx `findByRole('alert')`) frem for eksakt ordlyd i komponenttests.
- Undgå tautologiske tests, der tester konstanter eller konfigurationsfiler mod sig selv.
- Test adfærd, randtilfælde og regressioner proportionalt med risiko. Ændr ikke tests alene for at få en fejlende implementering til at se korrekt ud.
- Påstå aldrig, at tests eller checks er bestået, medmindre de faktisk er kørt. Angiv hvad der ikke kunne verificeres.

## 7. Slanke komponenter og genbrug af tilstand

- Komponenter må ikke duplikere eller genopfinde tilstand, der allerede vedligeholdes i en context eller service.
- Foretræk ukontrollerede formularfelter (`FormData`) frem for lokal React-state, medmindre feltet kræver dynamisk DOM-manipulation.

## 8. Afsluttende kvalitetskontrol

- Før en opgave erklæres færdig: gennemgå den faktiske diff mod aftalte krav, scope, eksisterende arkitektur og relevante ADR'er.
- Brug `docs/agent/REVIEW_CHECKLIST.md` som review-guide; fokuser på konkrete fund frem for mekanisk afkrydsning.
- Kør relevante tests, lint og typecheck, når tilgængeligt og passende. Undersøg fejl frem for at ignorere dem.
- Rapportér kort: hvad der ændrede sig, hvilke kontroller der blev kørt og deres resultat, kendte begrænsninger og eventuelle udeståender.
- En implementering er ikke automatisk færdig, fordi alle planlagte kodeændringer er skrevet.
