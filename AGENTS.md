# Agent Guidelines for HCK Ungdom

Dette dokument indeholder faste retningslinjer for AI-assistenter, der arbejder på dette repository.

---

## 1. Små inkrementer og hyppigt review (Maks. 125 linjer)
* **Maksimalt 125 linjers kodeændringer** ad gangen, før der stoppes og afventes brugerens review.
* **Undtagelse**: Ren testdata (f.eks. mock-brugere, personas og fixtures) tæller ikke med i denne grænse.
* Opdel altid implementeringer i logiske, overskuelige deltrin i stedet for at bygge for meget på én gang.

## 2. Logs og fejlbeskeder på engelsk
* Alle `console.log`, `console.warn`, `console.error`, fejlobjekter (`new Error(...)`) og interne logbeskeder skal skrives på **engelsk**.
* *Bemærk*: Brugergrænsefladen og tekster rettet mod cykelforældrene i appen forbliver på **dansk** i overensstemmelse med ADR-004.

## 3. Funktionskommentarer (> 6 linjer)
* Enhver funktion, der er **længere end 6 linjer**, skal have en forklarende kommentar på funktionsniveau (JSDoc eller standard blokkommentar).
* Kommentaren skal kort beskrive funktionens formål, input og output eller vigtig sideeffekt.
