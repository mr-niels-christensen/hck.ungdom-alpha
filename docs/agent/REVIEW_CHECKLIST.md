# Agent Review Checklist

Brug ved afslutning af et deltrin og grundigere ved færdiggørelse. Gennemgå den faktiske diff og relevante krav. Rapporter konkrete fund med fil/linje og alvorlighed; skriv ikke 'bestået' uden evidens.

## Krav og scope
- Matcher ændringen de aftalte acceptkriterier?
- Er der utilsigtede ændringer eller scope creep?
- Er arbejdsnotat og beslutninger ajour, hvis de bruges?

## Korrekthed og robusthed
- Er happy path, tomme tilstande, fejltilstande og relevante randtilfælde håndteret?
- Kan ændringen bryde eksisterende flows eller API-kontrakter?
- Er der race conditions, uventede sideeffekter eller duplikeret state?

## Sikkerhed og data
- Er input valideret og adgangskontrol korrekt, hvor relevant?
- Kan persondata eller hemmeligheder eksponeres i logs, UI eller API?
- Er destruktive operationer og migrationer håndteret sikkert?

## Projektregler
- Engelsk i interne logs/fejl og dansk i brugerrettet UI (ADR-004)?
- Funktionskommentarer ved funktioner over seks linjer?
- Stabile `data-testid` ved aktiverede testelementer og semantiske tilstandstests?
- Genbrug af contexts/services og passende brug af `FormData`?
- Maks. 125 ændrede kodelinjer og kun ét godkendt deltrin?

## Verifikation og rapport
- Hvilke tests, lint- og typechecks blev faktisk kørt, og hvad var resultaterne?
- Hvilke dele er ikke verificeret?
- Er der fund, der skal rettes før godkendelse, eller kan de dokumenteres som udeståender?

## Kort rapportformat
- **Ændret:** ...
- **Kontrolleret:** kommandoer og resultater ...
- **Fund/risici:** ...
- **Afventer:** godkendelse til næste deltrin / afslutning ...
