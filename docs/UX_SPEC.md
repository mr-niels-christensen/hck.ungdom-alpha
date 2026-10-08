# HCK Ungdom – Brugeroplevelse & Fat-Marker Skitser (UX Spec)

Dette dokument fastlægger den samlede brugeroplevelse, skærmopbygning og interaktionsflow for den minimale app. Det fungerer som fælles reference for både mennesker og AI-kodning i den efterfølgende implementeringsfase.

---

## 🧭 Overordnede Principper & Shell

* **Mobil-først**: 90% af brugen sker på smartphones på farten eller på stævnepladser.
* **Nul login-friktion**: Ingen adgangskoder eller oprettelsesformularer. Fælles klub-PIN + selvangivet navn gemt i browseren (`localStorage`).
* **Fuld 'Tilbage'-knap understøttelse (Back-button)**: Systemets og browserens tilbage-funktion (hardware-tilbage på Android, browserhistorik på desktop og navigation/swipe på mobil) skal virke 100% konsistent. Hash-routing sikrer, at man altid kan trykke "tilbage" fra et specifikt løb (`/#/lob/:id`), et tip (`/#/tips/:id`) eller profil-modalen for at vende tilbage til oversigten.
* **Ingen kuratering eller unødig administration**: Ingen Sportstiming-links, rute-links, eksterne tilmeldingsfrister eller redaktionelle tags, som nogen skal vedligeholde.
* **To kernefunktioner**: Appen består af præcis to faner i en fast bundmenu: **Løbsplan** og **Tips&tricks**.

### Shell Layout

```text
┌──────────────────────────────────────────────┐
│ [HCK Ungdom]                    [👤 Mette ✏️] │  <- Topbar: Titel + Aktiv bruger (klik åbner profil)
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│               AKTIVT SKÆRMINDFOLD            │
│          (Løbsplan eller Tips&tricks)        │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│      [ 🏁 Løbsplan ]     [ 💡 Tips&tricks ]  │  <- Fast bundnavigation
└──────────────────────────────────────────────┘
```

* **Topbjælke**: Viser klubnavn og forælderens fornavn. Et klik på navnet/blyanten åbner profil-modalen/skærmen (Flow 1), hvor man kan tilføje børn eller ændre navn.
* **Bundbjælke**: Skifter mellem `/#/lob` og `/#/tips` (Hash-routing iht. ADR-008).

---

## 🚀 Flow 1: Første Besøg & Profil (Onboarding)

### Formål
Hurtig identifikation uden adgangskoder. Forælderen angiver fornavn og sine ryttere med aldersklasse.

### Visuel Skitse

```text
┌──────────────────────────────────────────────┐
│  Velkommen til HCK Ungdom                    │
│                                              │
│  Klub-pinkode:                               │
│  [ ****                                    ] │  <- Udfyldes automatisk hvis givet via URL
│                                              │
│  Dit navn (forælder):                        │
│  [ Mette                                   ] │  <- Placeholder lægger op til fornavn
│                                              │
│  Dine ryttere i klubben:                     │
│  1. Navn: [ Sofie        ]  Klasse: [ U15 v] │
│  2. Navn: [ Mads         ]  Klasse: [ U11 v] │
│                                              │
│  [ ➕ Tilføj rytter ]                         │
│                                              │
│  [ Gem og fortsæt -> ]                       │
└──────────────────────────────────────────────┘
```

### Elementer & Adfærd
1. **Klub-pinkode**: Valideres mod en fast kode. Kan forudfyldes via linkparameter (f.eks. `/#/?pin=xxxx`).
2. **Forældernavn**: Simpelt tekstfelt.
3. **Ryttere (dynamisk liste)**:
   * Tekstfelt til rytterens fornavn.
   * Dropdown til klasse (`U11`, `U13`, `U15`, `U17`, `U19` el.lign.).
   * Mulighed for at tilføje flere børn eller fjerne en række.
4. **Persistens**: Gemmes udelukkende i browserens `localStorage`. Kræver ingen backend-tabel for brugere.

---

## 🏁 Flow 2: Løbsplan (Løbsblokke & Overblik)

### Formål
At give et lynhurtigt overblik over, hvilke løb klubbens ryttere overvejer eller kører, grupperet i logiske stævneblokke (weekender, ferier, helligdage).

### Grupperingslogik (Løbsblokke)
Ungdoms-etapeløb og stævner køres altid på hinanden følgende dage uden hviledage. Vi opdeler derfor i en ny blok, så snart der er bare én løbsfri dag:
* **Sammenhængende løbsdage**: Løb på direkte på hinanden følgende dage (f.eks. lørdag+søndag, eller torsdag+fredag+lørdag+søndag+mandag i påsken) udgør én samlet blok.
* **Løbsfri dage opdeler**: Så snart der er mindst én løbsfri dag imellem (f.eks. løb Kristi Himmelfart torsdag, men intet løb fredag), opdeles det i to separate blokke (`Torsdag 29. maj` og `Weekend 31. maj – 1. juni`).
* **Eksempler**:
  * *Almindelig weekend (2 dage)*: `Weekend 26.–27. april`
  * *Påske (5 sammenhængende dage)*: `Påske 17.–21. april` (Skærtorsdag til 2. påskedag samlet)
  * *Pinse (3 sammenhængende dage)*: `Pinse 7.–9. juni` (Lørdag til 2. pinsedag samlet)
  * *Enkeltstående hverdagsløb*: `Onsdag 2. juli`

Den første kommende blok er automatisk foldet ud; fremtidige blokke kan foldes ud med ét tryk.

### Visuel Skitse

```text
┌──────────────────────────────────────────────┐
│  🏁 LØBSPLAN                                 │
├──────────────────────────────────────────────┤
│  ▼ PÅSKE: 17.–21. APRIL (3 løb)              │
│  ┌────────────────────────────────────────┐  │
│  │ SKÆRTORSDAG 17. APR · Nakskov CC       │  │
│  │ 👥 4 ryttere: Sofie (U15), Mads (U11)..│  │
│  │ 🚗 1 søger lift · 1 har plads          │  │
│  │ Min status: Sofie: Kører · Mads: Nej   │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ LANGFREDAG 18. APR · Nysted            │  │
│  │ 👥 2 ryttere (Sofie, Lucas)            │  │
│  │ Min status: Overvejer                  │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ 2. PÅSKEDAG 21. APR · Rødby            │  │
│  │ 👥 1 rytter (Anton)                    │  │
│  │ Min status: Kører ikke                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ▶ WEEKEND 26.–27. APRIL (2 løb)             │
│                                              │
│  ▶ TORSDAG 29. MAJ (Kr. Himmelfart)          │
│                                              │
│  ▶ WEEKEND 31. MAJ – 1. JUNI (2 løb)         │
│                                              │
│  ▶ PINSE 7.–9. JUNI (3 løb)                  │
└──────────────────────────────────────────────┘
```

### Elementer & Adfærd
* **Ingen filtre**: Ungdomsløb har næsten altid samtlige ungdomsklasser samlet, så listen holdes ren og fri for filterknapper.
* **Løbskort**: Viser ugedag, dato, løbsnavn, opsummering af deltagere, samkørselssituation og familiens egen status.
* **Klik på kort**: Navigerer direkte til det specifikke løb i Flow 3 (`/#/lob/:id`). Browserhistorikken opdateres, så "Tilbage"-knappen (hardware/browser) altid fører tilbage til listen.

---

## 🚗 Flow 3: Løbsdetalje, Tilkendegivelse & Samkørsel

### Formål
At melde status for egne børn, se klubkammeraternes status opdelt på klasser, samt aftale samkørsel i en uformel kommentarstrøm.

### Visuel Skitse

```text
┌──────────────────────────────────────────────┐
│  < Tilbage til overblik                      │
│                                              │
│  Nakskov CC                                  │
│  Skærtorsdag 17. april                       │
├──────────────────────────────────────────────┤
│  VORES STATUS                                │
│                                              │
│  Sofie (U15):                                │
│  [ ( ) Overvejer  (•) Kører  ( ) Kører ikke] │
│                                              │
│  Mads (U11):                                 │
│  [ ( ) Overvejer  ( ) Kører  (•) Kører ikke] │
│                                              │
│  Samkørsel / bil:                            │
│  [ Har plads til 1 rytter + cykel fra Hvidovre]
│                                              │
│  [ Gem min status ]                          │
├──────────────────────────────────────────────┤
│  HVEM KØRER FRA KLUBBEN? (4 ryttere)         │
│                                              │
│  U11:                                        │
│  • Emil (Thomas) — ❓ Søger lift             │
│                                              │
│  U15:                                        │
│  • Sofie (Mette) — 🚗 Har 1 plads            │
│  • Lucas (Henrik) — 🚗 Kører selv            │
│                                              │
│  U17:                                        │
│  • Anton (Lars) — 🚗 Kører selv              │
├──────────────────────────────────────────────┤
│  AFTALER OM SAMKØRSEL                        │
│  💬 Thomas: "Kan Emil få den plads, Mette?"  │
│  💬 Mette: "Ja, vi samler ham op kl. 07.30!" │
│                                              │
│  [ Skriv en kommentar...             [Send] ]│
└──────────────────────────────────────────────┘
```

### Elementer & Adfærd
1. **Løbshoved**: Kun løbsnavn og dato. Ingen eksterne links eller frister.
2. **Vores status**:
   * En statusvælger (`Overvejer`, `Kører`, `Kører ikke`) for *hvert* af brugerens registrerede børn.
   * Valgfrit tekstfelt til transportnotat (f.eks. *"Har 1 ledig plads"*, *"Søger lift til cykel + rytter"*).
3. **Deltagerliste**:
   * Grupperet alfabetisk eller efter aldersklasse (`U11`, `U13`, `U15`, `U17`).
   * Viser rytterens navn, forælderens navn i parentes samt evt. samkørselsnote.
4. **Samkørselsdialog**:
   * Letvægts kommentarstrøm knyttet til det konkrete løb.
   * Forældrenavnet fra Flow 1 indsættes automatisk som forfatter.
   * Giver mulighed for hurtigt at afklare *"Kan Emil køre med?"* uden at fylde Messenger-fællestråden.

---

## 💡 Flow 4: Tips&tricks (Notes-modellen)

### Formål
Et uformelt opslagsværk for nye cykelforældre (gearing, udrulning, chip, rutiner). Skal fungere uden redaktionel styring, uden kategoripleje og uden manuelle resumé-tekster.

### 4A: Oversigtsliste (Notes-listen)

```text
┌──────────────────────────────────────────────┐
│  💡 TIPS & TRICKS             [ ➕ Nyt tip ] │
│  [ 🔍 Søg i alle tips...                  ] │
├──────────────────────────────────────────────┤
│  Udrulning & gearing                         │
│  DCU stiller krav om gearing for at skåne... │ <- Auto-uddrag (første 80 tegn af teksten)
│  🕒 Opdateret 4. apr af Morten               │
│  ──────────────────────────────────────────  │
│  Løbsdagsrutine fra A-Z                      │
│  Hvornår ankommer man til stævnepladsen? ... │
│  🕒 Opdateret 28. mar af Jens                │
│  ──────────────────────────────────────────  │
│  Chip & transponder-montering                │
│  Chippen monteres på forgaflen med strips... │
│  🕒 Opdateret 12. mar af Henrik              │
│  ──────────────────────────────────────────  │
│  Dæktryk i regnvejr                          │
│  Når asfalten er våd, er det en god idé a... │
│  🕒 Opdateret 1. feb af Mette                │
└──────────────────────────────────────────────┘
```

### 4B: Detaljevisning af et Tip

```text
┌──────────────────────────────────────────────┐
│  < Tilbage til Tips              [✏️ Rediger]│
│                                              │
│  Udrulning & gearing                         │
│                                              │
│  DCU stiller krav om gearing for at skåne    │
│  knæ og sikre lige vilkår.                   │
│                                              │
│  Klasse   Max udrulning   Typisk gearing     │
│  ──────   ─────────────   ──────────────     │
│  U11      5,66 meter      46 x 17 el. 39x14  │
│  U13      6,10 meter      46 x 16            │
│  U15      6,70 meter      46 x 14 el. 52x16  │
│  U17      7,43 meter      46 x 13 el. 50x14  │
│                                              │
│  💡 Tip: Tjek udrulningen ved at rulle       │
│  cyklen 1 hel pedalomdrejning langs et       │
│  målebånd med dækket pumpet op.              │
│                                              │
│  ──────────────────────────────────────────  │
│  Sidst rettet af: Morten · 4. apr            │
└──────────────────────────────────────────────┘
```

### Elementer & Adfærd
1. **Sortering**: Kronologisk efter senest opdateret (seneste rettelser/tips øverst).
2. **Realtidssøgning**: Søgefeltet i toppen matcher både i tippets overskrift og brødtekst on-the-fly.
3. **Auto-uddrag**: Listen danner automatisk et kort preview ud fra de første linjer af teksten (ingen særskilte metadatafelter at udfylde).
4. **Opret / Rediger**:
   * Enhver forælder kan trykke på `[➕ Nyt tip]` eller `[✏️ Rediger]`.
   * Simpel formular med to felter: **Titel** og **Tekst** (understøtter simpel formatering/Markdown).
   * Forældernavnet fra `localStorage` stemples automatisk som forfatter og "sidst rettet af".
5. **Navigation & Back-button**:
   * Åbning af et tip skifter rute til `/#/tips/:id`.
   * Både `[< Tilbage til Tips]`-linket og systemets "Tilbage"-knap (Android-hardware/browserhistorik) fører tilbage til listen uden at miste eventuel søgetekst.

---

## 🗄️ Datamodel (Supabase & LocalStorage Opsummering)

Til brug for den senere databaseopsætning udleder skitserne følgende minimale databehov:

| Lager | Entitet | Nøglefelter | Bemærkning |
| :--- | :--- | :--- | :--- |
| **`localStorage`** | Brugerprofil | `pinVerified`, `parentName`, `children: [{ name, class }]` | Nul serverlagring af brugere. |
| **Supabase** | `races` | `id`, `name`, `date` | Oprettes/justeres af tovholder (evt. direkte i Supabase table view). |
| **Supabase** | `race_attendance` | `id`, `race_id`, `parent_name`, `rider_name`, `rider_class`, `status`, `carpool_note`, `updated_at` | Ryttertilkendegivelser og kørsel. |
| **Supabase** | `race_comments` | `id`, `race_id`, `author_name`, `comment`, `created_at` | Kort dialog om samkørsel pr. løb. |
| **Supabase** | `tips` | `id`, `title`, `body`, `last_edited_by`, `updated_at` | Fælles vidensdeling. |
