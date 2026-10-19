# Agent Guidelines for HCK Ungdom

Dette dokument indeholder faste retningslinjer for AI-assistenter, der arbejder på dette repository.

---

## 1. Små inkrementer og hyppigt review (Maks. 125 linjer)
* **Maksimalt 125 linjers kodeændringer** ad gangen, før der stoppes og afventes brugerens review.
* **Undtagelse**: Ren testdata (f.eks. mock-brugere, personas og fixtures) tæller ikke med i denne grænse.
* Opdel altid implementeringer i logiske, overskuelige deltrin i stedet for at bygge for meget på én gang.
* **Kør kun ét deltrin ad gangen**: Når en opgave er opdelt i navngivne deltrin (f.eks. A, B, C eller 1, 2, 3), skal assistenten stoppe efter hvert enkelt deltrin og afvente godkendelse, før næste trin påbegyndes.

## 2. Logs og fejlbeskeder på engelsk
* Alle `console.log`, `console.warn`, `console.error`, fejlobjekter (`new Error(...)`) og interne logbeskeder skal skrives på **engelsk**.
* *Bemærk*: Brugergrænsefladen og tekster rettet mod cykelforældrene i appen forbliver på **dansk** i overensstemmelse med ADR-004.

## 3. Funktionskommentarer (> 6 linjer)
* Enhver funktion, der er **længere end 6 linjer**, skal have en forklarende kommentar på funktionsniveau (JSDoc eller standard blokkommentar).
* Kommentaren skal kort beskrive funktionens formål, input og output eller vigtig sideeffekt.

## 4. Robuste automatiserede tests
* Interaktive knapper og elementer, der aktiveres i tests, skal identificeres via stabile identifikatorer (`data-testid`), så tests ikke er sårbare over for fremtidige sproglige UI-justeringer.
* Test tilstedeværelse af fejl og tilstande (f.eks. `findByRole('alert')`) frem for eksakt ordlyd i komponenttests.
* Undgå tautologiske tests, der blot tester konstanter eller config-filer mod sig selv.

## 5. Slanke komponenter og genbrug af tilstand
* Komponenter må ikke duplikere eller genopfinde tilstand, der allerede vedligeholdes i en context eller en service.
* Foretræk ukontrollerede formularfelter (`FormData`) frem for lokal React-state, medmindre feltet kræver dynamisk DOM-manipulation.

