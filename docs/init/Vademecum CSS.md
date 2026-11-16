# Vademecum CSS e UI per progetti React + Vite sviluppati con agenti AI

> Documento operativo complementare al **Vademecum TypeScript per progetti sviluppati con agenti AI**.
>
> **MUST** = requisito standard e non derogabile senza una decisione esplicita.  
> **SHOULD** = scelta predefinita; può essere derogata tramite ADR.  
> **MAY** = facoltativo, da adottare quando esiste un'esigenza concreta.
>
> **Baseline di riferimento: 16 novembre 2026.** Le versioni dei pacchetti e lo stato delle API sono point-in-time: verificare le versioni stabili al bootstrap, fissarle nel lockfile e non copiare alla cieca snippet di documentazione relativi a versioni differenti.

---

## 0. Scopo e principio guida

Questo documento definisce come progettare, generare, verificare e mantenere CSS e UI in un progetto sviluppato prevalentemente da agenti AI, senza sacrificare la leggibilità e la possibilità di intervento diretto da parte di un programmatore umano.

Il problema da risolvere non è semplicemente «scrivere CSS corretto». È evitare che ogni agente inventi un proprio linguaggio visivo, una propria convenzione di markup o una nuova astrazione. Il risultato deve essere:

- coerente fra schermate e funzionalità;
- accessibile e utilizzabile da tastiera;
- efficiente nella quantità di CSS distribuita e nel lavoro di rendering;
- basato su tecnologie comuni, documentate e facilmente reperibili;
- facile da modificare manualmente, soprattutto per colori, tipografia, spaziature, densità, radius e dettagli visivi;
- prevedibile per gli agenti: le stesse esigenze devono produrre strutture simili;
- verificato da gate automatici, non soltanto da istruzioni in linguaggio naturale.

### 0.1 Principio architetturale

**Le feature compongono il design system; non reinventano il design system.**

Un agente dovrebbe preferire:

```tsx
<Button variant="default" size="sm">
  Salva
</Button>
```

anziché riprodurre in ogni feature markup, stati, classi, focus, icone e comportamento di un pulsante.

La riduzione del codice AI da generare e mantenere si ottiene principalmente tramite:

1. componenti riutilizzabili con API piccole e tipizzate;
2. primitive interattive accessibili già implementate;
3. token semantici condivisi;
4. varianti dichiarative anziché classi composte liberamente;
5. convenzioni di repository stabili e gate deterministici.

Una libreria di classi CSS può abbreviare gli attributi `className`, ma non sostituisce un componente React e non elimina da sola la complessità del DOM.

### 0.2 Relazione con il Vademecum TypeScript

Questo documento ne eredita le scelte e i vincoli:

- React + Vite è lo stack frontend predefinito;
- la UI vive in `apps/web`;
- il design system vive in `apps/web/src/design-system/`, oppure in `packages/ui` quando è realmente condiviso fra più frontend;
- le feature sono organizzate per responsabilità e mantengono componenti, hook, client e test colocati;
- le superfici UI chiamano i casi d'uso tramite contratti e client tipizzati, senza duplicare logica di dominio;
- gli elementi interattivi devono passare attraverso il design system;
- il prodotto deve essere keyboard-first;
- Vitest copre i comportamenti componentistici e Playwright i flussi E2E;
- Biome è il formatter autorevole, Oxlint il linter TS/JS autorevole;
- ogni dipendenza significativa o deroga a uno SHOULD richiede un'ADR;
- le decisioni visibili all'utente appartengono alle PDR.

Non creare `apps/web` o pacchetti UI se il progetto non ha una UI reale.

Questo vademecum definisce lo stack predefinito per un frontend nuovo o per un progetto che ha già una UI reale e ha deciso di adottare uno stack documentato. In un progetto esistente con un design system già funzionante — come la UI minima di questo boilerplate, che usa CSS nativo e primitive artigianali — l'adozione di Tailwind, shadcn e Base UI è una migrazione architetturale: richiede un ADR e un piano di migrazione, non l'esecuzione cieca del CLI sopra il design system corrente.

Per una UI molto piccola e stabile, CSS nativo con token semantici e pochi componenti può essere la soluzione più leggera. Tailwind e shadcn diventano convenienti quando crescono stati, overlay, form complessi, tabelle e componenti riusabili: non adottare l'intero stack solo per un pulsante e un input.

---

## 1. Stack raccomandato

### 1.1 Scelte standard

| Area | Scelta predefinita | Policy |
|---|---|---|
| Framework UI | React + TypeScript | MUST, quando esiste una UI web |
| Dev server / bundler | Vite | MUST, coerente con il vademecum TypeScript |
| CSS utility framework | Tailwind CSS v4 | SHOULD forte |
| Componenti UI | shadcn/ui, codice mantenuto nel repository | SHOULD forte |
| Primitive interattive | Base UI, tramite shadcn/ui | SHOULD forte |
| Icone | Lucide React | SHOULD forte; set unico |
| Varianti di componenti | `class-variance-authority` (CVA) | SHOULD per componenti con varianti reali |
| Composizione classi | `cn` | SHOULD; usare la versione corrente indicata da shadcn |
| CSS custom | CSS standard e CSS Modules selettivi | SHOULD |
| Preprocessore | Nessuno di default | MUST salvo ADR |
| Theme / token | CSS custom properties + `@theme` Tailwind | MUST |
| Formatter e lint CSS | Biome | MUST, coerente con lo stack TypeScript |
| Build CSS | Vite + Tailwind Vite plugin; minificazione Vite/Lightning CSS | MUST |
| Test UI | Vitest + Playwright | MUST quando applicabili |
| Audit accessibilità automatico | axe-core tramite Playwright | SHOULD sui flussi importanti |

### 1.2 Stack e responsabilità dei livelli

La separazione concettuale è:

```text
React
  └── struttura, composizione, stato e comportamento di prodotto
       └── design system (shadcn/ui + componenti del progetto)
            └── Base UI per primitive interattive accessibili
                 └── Tailwind CSS per utility e sistema visivo
                      └── CSS nativo / CSS Modules per i casi speciali
                           └── Vite + Lightning CSS per build e ottimizzazione
```

- **React** governa la composizione dell'interfaccia e il comportamento specifico della feature.
- **shadcn/ui** fornisce componenti sorgente personalizzabili, non una scatola nera installata come dipendenza runtime.
- **Base UI** fornisce primitive headless per controlli interattivi, gestione del focus, tastiera e semantica accessibile.
- **Tailwind** fornisce un vocabolario comune di utility, responsive variants e design token.
- **CSS nativo** resta il linguaggio per gli stili che non sono espressi in modo leggibile con utility class.
- **Vite** produce gli asset; il browser riceve CSS statico, non un motore CSS-in-JS runtime.

### 1.3 Dipendenze principali

Il bootstrap del frontend deve usare il CLI ufficiale shadcn, scegliendo esplicitamente Base UI per un progetto nuovo. In CI o in un bootstrap non interattivo il flag è `-b base` (`-b` accetta `base`, `radix` e `aria`; verificare l'help della versione installata). Le dipendenze effettive vanno installate dal CLI o verificate nella documentazione della versione selezionata; non mantenere una lista manuale divergente dal risultato del CLI.

Pacchetti normalmente presenti nello stack:

| Pacchetto | Categoria | Motivo |
|---|---|---|
| `tailwindcss` | build / styling | Generazione delle utility usate |
| `@tailwindcss/vite` | build | Integrazione nativa con Vite |
| `@base-ui/react` | runtime | Primitive interattive headless |
| `lucide-react` | runtime | Icone SVG tipizzate e tree-shakable |
| `class-variance-authority` | runtime | Varianti dichiarative dei componenti |
| `cn` | runtime | Composizione e merge delle classi Tailwind |
| `tw-animate-css` | CSS/build | Utility animate usate dai componenti shadcn che ne hanno bisogno |
| `shadcn` | CLI + CSS/build | Comandi `init`/`add`/`eject`; esporta anche `shadcn/tailwind.css`, importato dal CSS globale |

Le dipendenze di build vanno collocate in `devDependencies`, quelle importate dal codice applicativo in `dependencies`, secondo il comportamento effettivo del package manager e del deploy.

**Aggiornamento importante (2026):** la documentazione shadcn ha reso Base UI la scelta predefinita per i nuovi progetti nel luglio 2026. Da settembre 2026 i componenti shadcn usano il pacchetto `cn`, che sostituisce la precedente combinazione `clsx` + `tailwind-merge`. Non aggiungere quindi automaticamente entrambe le vecchie dipendenze: seguire il CLI e la documentazione shadcn correnti.

`shadcn` non è soltanto un comando usa-e-getta: il pacchetto esporta `shadcn/tailwind.css`, che il CSS globale importa. Se lo si esegue solo con `pnpm dlx`, quell'import non è risolvibile; seguire il `package.json` generato dal CLI. L'alternativa è `pnpm dlx shadcn@latest eject`, che inlinea quel CSS nel foglio globale e rimuove la dipendenza `shadcn`: è irreversibile e rinuncia agli aggiornamenti automatici di quel file, quindi va scelta consapevolmente.

### 1.4 Politica sulle versioni

- Usare le versioni stabili più recenti compatibili al bootstrap.
- Fissare le versioni tramite `pnpm-lock.yaml` e `packageManager`.
- Evitare tag `latest` nei manifest applicativi.
- Non aggiornare Tailwind, shadcn, Base UI, Biome o Vite incidentalmente durante una feature.
- Gli upgrade significativi avvengono in PR/commit dedicati e rieseguono build, test, accessibilità e controlli visuali.
- Prima di usare un'API, leggere la documentazione e i tipi della versione effettivamente installata.

---

## 2. DaisyUI: valutazione e policy

### 2.1 Che cosa fornisce

DaisyUI è un plugin Tailwind che aggiunge classi semantiche come `btn`, `card`, `badge`, `alert` e `input`, oltre a un sistema di temi e varianti. DaisyUI 5 è compatibile con Tailwind CSS 4 e si integra tramite `@plugin "daisyui"`.

DaisyUI **non fornisce componenti React** e non implementa il comportamento dei controlli: la gestione dello stato, gli eventi, la tastiera e le primitive accessibili restano responsabilità dell'applicazione o di un'altra libreria.

### 2.2 Pro e contro nel nostro stack

| Aspetto | Vantaggio | Limite |
|---|---|---|
| Classi semantiche | JSX più breve rispetto a molte utility concatenate | Il DOM e il comportamento React restano da costruire |
| Temi pronti | Prototipazione rapida e palette immediatamente disponibili | Può imporre un linguaggio visivo che il prodotto non ha ancora deciso |
| Componenti CSS | Convenzioni visive coerenti per elementi comuni | Non sostituisce dialog, menu, combobox e altri comportamenti accessibili |
| Tailwind | Riutilizza il suo ecosistema | Aggiunge un secondo vocabolario di classi e temi |

### 2.3 Decisione standard

**MUST NOT: non aggiungere DaisyUI al progetto standard basato su shadcn/ui + Base UI.**

Motivazioni:

1. shadcn/ui centralizza già struttura JSX, varianti e stile dei componenti riutilizzabili;
2. Base UI copre gli aspetti interattivi che DaisyUI non fornisce;
3. DaisyUI aggiungerebbe una seconda API visiva e un secondo insieme di convenzioni;
4. il beneficio di ridurre le classi non compensa la duplicazione del sistema di componenti;
5. la quantità di JSX ripetuta si riduce meglio componendo `<Button>`, `<Dialog>`, `<Select>` e componenti di progetto che usando classi su elementi HTML ripetuti.

### 2.4 Quando DaisyUI può essere una scelta valida

DaisyUI MAY essere scelto in un progetto diverso quando:

- il progetto privilegia markup HTML con classi semantiche rispetto a componenti React sorgente;
- serve un prototipo o un pannello CRUD molto semplice;
- il team decide che il vocabolario visivo DaisyUI è il design system del prodotto;
- non è già stato adottato shadcn/ui come design system centrale.

In quel caso DaisyUI deve essere **l'unico sistema di component classes**, non un'aggiunta casuale a un design system shadcn esistente. La scelta va registrata in ADR e la guida va adattata.

---

## 3. Modello di styling: Tailwind-first, CSS-native

### 3.1 Regola generale

**SHOULD: usare Tailwind per il normale styling dei componenti e CSS Modules/CSS standard quando producono una soluzione più leggibile.**

Tailwind è adatto a:

- layout Flexbox e Grid;
- spacing, sizing e allineamento;
- tipografia;
- colori semantici;
- bordi, radius, ombre;
- responsive design;
- stati hover, focus, active, disabled e data attributes;
- piccole transizioni e animazioni standard.

CSS Modules o CSS globale ben delimitato sono più adatti a:

- animazioni articolate e keyframes;
- layout con selettori strutturali complessi;
- pseudo-elementi complessi;
- grafici, visualizzazioni e diagrammi;
- styling di markup generato da terze parti o contenuto Markdown;
- regole che diventerebbero una lunga sequenza di classi difficile da leggere;
- componenti che richiedono una quantità sostanziale di CSS specifico.

Non trasformare questa divisione in una religione: il criterio è la chiarezza del risultato, non il numero di classi Tailwind.

### 3.2 CSS nativo invece di SCSS

**MUST: non introdurre SCSS/Sass come preprocessore predefinito.**

CSS moderno offre già:

| Esigenza storicamente coperta da Sass | Soluzione CSS moderna |
|---|---|
| Variabili | Custom properties (`--token`) |
| Nesting | CSS nesting nativo |
| Separazione della cascata | `@layer` |
| Varianti e temi | Custom properties + selettori di tema |
| Component styles isolati | CSS Modules |
| Responsive dei componenti | Container queries |
| Riutilizzo di valori | `var()`, `calc()`, `clamp()`, `min()` e `max()` |

Il supporto browser delle funzionalità usate è definito dal browser target del progetto. Vite propone come target predefinito Baseline Widely Available; per progetti React/Vite moderni è un buon punto di partenza, salvo requisiti espliciti per browser legacy.

Sass MAY essere introdotto soltanto quando un caso concreto richiede funzioni, mixin o generazione programmatica non ragionevolmente esprimibile con CSS nativo. L'ADR deve spiegare il beneficio e il costo di aggiungere un secondo linguaggio.

### 3.3 CSS-in-JS runtime

**MUST NOT: non introdurre automaticamente styled-components, Emotion, JSS o altre soluzioni che generano/gestiscono gli stili a runtime.**

Motivi:

- un ulteriore sistema di styling da apprendere e mantenere;
- possibili costi runtime e di rendering;
- più difficile distinguere CSS statico e dinamico;
- minore coerenza con Tailwind, CSS Modules e build Vite.

Una soluzione CSS-in-JS può essere valutata con ADR se una necessità reale del prodotto lo giustifica. Non va scelta per comodità dell'agente.

### 3.4 CSS Modules

CSS Modules sono il meccanismo standard per isolare localmente le classi CSS quando Tailwind non è sufficiente o diventerebbe illeggibile.

Convenzioni:

- nome file `nome-componente.module.css`;
- colocare il file accanto al componente che lo usa;
- selettori semplici e classi con nomi descrittivi (`root`, `header`, `content`, `isActive`);
- evitare selettori globali e `:global` salvo integrazioni motivate;
- non usare CSS Modules per duplicare utility Tailwind banali;
- non creare un file CSS globale per ogni feature;
- importare il modulo direttamente nel componente proprietario.

Vite supporta CSS Modules nativamente con suffisso `.module.css`.

---

## 4. Design system: shadcn/ui + Base UI

### 4.1 Modello di adozione

shadcn/ui non va trattato come una libreria di componenti chiusa. Il CLI aggiunge i file sorgente nel repository: il codice diventa proprietà del progetto e può essere adattato, revisionato e testato come il resto dell'applicazione.

Questa caratteristica è particolarmente utile con agenti AI: l'agente può leggere il componente effettivo, modificarlo con una PR e non deve indovinare comportamenti nascosti in un'API esterna.

**MUST:** i componenti shadcn aggiunti diventano parte del design system; non devono essere modificati in copie indipendenti dentro le feature.

### 4.2 Base UI come primitive standard

Per i nuovi progetti scegliere Base UI tramite il CLI shadcn.

Base UI è headless: non impone CSS né un sistema visuale; si integra con Tailwind, CSS Modules e CSS standard. Gestisce aspetti complessi dell'interazione come ruoli, attributi ARIA, focus, tastiera e pointer interaction.

Regole:

- scegliere Base UI come unica base primaria delle primitive;
- non mescolare Base UI, Radix e React Aria per comodità del singolo agente;
- non importare direttamente primitive Base UI dalle feature: esporre componenti del design system;
- seguire le API della versione installata;
- non trasportare alla cieca esempi Radix nel codice Base UI: in particolare, non presumere che `asChild` sia l'API corretta; seguire la composizione `render` e gli esempi della versione Base UI/shadcn installata;
- non migrare un progetto Radix funzionante solo perché Base UI è il default per i progetti nuovi: le migrazioni sono decisioni separate.

React Aria e Radix restano alternative valide. Sono ammessi in un nuovo progetto soltanto con ADR e motivazione concreta, oppure per una capacità non disponibile nella base scelta.

### 4.3 Bootstrap e configurazione shadcn

Eseguire il CLI ufficiale dal package frontend e scegliere Base UI per un progetto nuovo. Il CLI deve generare `components.json`, le dipendenze, gli alias e il foglio globale coerenti con la versione corrente. Aggiungere soltanto i componenti necessari tramite il comando `add` del CLI; non generare l'intero catalogo.

La configurazione deve dichiarare almeno:

- `rsc: false` per il frontend Vite/React non-Next;
- `tsx: true`;
- `tailwind.cssVariables: true`;
- `iconLibrary: "lucide"`;
- alias `ui` verso `design-system/primitives`;
- alias `utils` verso il modulo centrale `design-system/lib/utils`;
- un solo stile di base selezionato all'inizio e mantenuto coerente.

Esempio schematico di alias (adattare il resto al JSON generato dal CLI corrente):

```json
{
  "aliases": {
    "components": "@/design-system",
    "ui": "@/design-system/primitives",
    "utils": "@/design-system/lib/utils",
    "lib": "@/design-system/lib",
    "hooks": "@/design-system/hooks"
  }
}
```

La scelta `style` e `baseColor` è una decisione visiva del progetto. In assenza di una brand direction già definita, si può partire dal preset neutro predefinito della versione corrente di shadcn (la documentazione verificata usa `base-nova` e `neutral`) e personalizzarlo attraverso i token, senza cambiare preset da una feature all'altra.

Non modificare manualmente `components.json` per farlo divergere dal layout effettivo del repository. Dopo ogni modifica degli alias, verificare con il CLI l'aggiunta di un componente di prova e controllare i path generati.

### 4.4 Quali componenti aggiungere

Non generare l'intero catalogo all'inizio. Aggiungere soltanto componenti necessari, uno o pochi alla volta.

Componenti comunemente utili:

- Button, Button Group;
- Input, Textarea, Checkbox, Radio Group, Switch;
- Label e Field;
- Select, Combobox;
- Dialog, Alert Dialog, Popover, Tooltip;
- Dropdown Menu, Context Menu;
- Tabs, Accordion, Collapsible;
- Card, Badge, Alert, Separator;
- Skeleton, Spinner, Empty State;
- Table e Pagination quando servono.

Il CLI ufficiale deve essere il metodo preferito per aggiungere componenti. Dopo l'aggiunta:

1. controllare i file generati e le nuove dipendenze;
2. verificare che usino Base UI;
3. confrontare token e stili con il design system esistente;
4. eseguire format, lint, typecheck, build e test;
5. annotare eventuali modifiche strutturali al design system.

Non copiare manualmente snippet incompleti da siti terzi quando il CLI ufficiale può generare il componente compatibile.

### 4.5 Convenzione per i componenti

Un componente del design system deve avere:

- nome e responsabilità chiari;
- API piccola e tipizzata;
- varianti esplicite (`variant`, `size`, `tone`, quando necessarie);
- stati disabled, loading, invalid e focus gestiti coerentemente;
- semantica HTML corretta;
- accessibilità e tastiera verificate;
- nessuna conoscenza di una feature di dominio;
- esempi o test che documentino il comportamento significativo.

Non creare un componente generico quando esiste già un componente equivalente. Non creare wrapper che aggiungono un livello senza fissare una convenzione o nascondere complessità reale.

### 4.6 Varianti: CVA

Usare `class-variance-authority` (CVA) quando un componente ha varianti reali e ripetute.

Esempio concettuale:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
```

L'esempio mostra il modello, non sostituisce i componenti già generati da shadcn. Le varianti usano token semantici (`*-foreground`), non `text-white` o `text-black`: così dark mode, contrasto e theming restano governati dal tema.

Regole:

- classi delle varianti statiche e complete;
- evitare di derivare frammenti di classi (`bg-${color}-500`);
- non usare CVA per un componente con una sola variante fissa;
- non moltiplicare le varianti per ogni dettaglio visivo occasionale;
- una nuova variante deve esprimere una scelta di design riutilizzabile, non un workaround locale.

---

## 5. Composizione delle classi Tailwind

### 5.1 `cn`

Usare il pacchetto `cn` previsto dalla versione corrente di shadcn per comporre e risolvere conflitti fra classi.

Centralizzare l'entry point del progetto, ad esempio:

```ts
// src/design-system/lib/utils.ts
export { cn } from "cn";
```

Tutti i componenti importano `cn` da questo punto centrale, anche se l'implementazione sottostante è una dipendenza esterna.

Non aggiungere automaticamente `clsx` e `tailwind-merge`: il pacchetto `cn` corrente di shadcn è il sostituto ufficiale della vecchia combinazione `twMerge(clsx(...))`. Progetti preesistenti possono mantenere la vecchia combinazione finché non scelgono consapevolmente di migrare.

### 5.2 Classi statiche: regola fondamentale

Tailwind scansiona i file come testo e genera CSS per le classi che riesce a riconoscere. Non esegue il codice TypeScript per capire il risultato di una concatenazione.

**MUST:** ogni classe Tailwind deve esistere come stringa completa e statica nel sorgente.

Vietato:

```tsx
<div className={`bg-${color}-500`} />
```

Corretto:

```tsx
const toneClasses = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
} as const;

<div className={toneClasses[tone]} />
```

Per classi necessarie ma non individuabili nel normale sorgente usare `@source inline()` soltanto con un insieme limitato, esplicito e documentato. Non creare safelist indiscriminate.

Se il monorepo contiene package UI condivisi, registrare con `@source` i percorsi dei sorgenti che Tailwind non rileva automaticamente. Le cartelle `node_modules` e i file ignorati non vengono scansionati normalmente.

### 5.3 Leggibilità delle classi

Le classi devono restare scansionabili dall'occhio umano.

Convenzione d'ordine consigliata:

1. display e layout;
2. dimensioni e positioning;
3. spacing e allineamento;
4. tipografia;
5. colori e bordi;
6. effetti;
7. stati (`hover:`, `focus-visible:`, `disabled:`, `data-*:`);
8. breakpoint responsive.

Non è necessario applicare a mano un ordine cosmetico diverso in ogni feature. Il formatter resta Biome. Non aggiungere Prettier soltanto per ottenere il plugin di ordinamento Tailwind: nel repository il formatter autorevole deve restare uno.

Se si abilita `useTailwindSortedClasses` di Biome (regola `nursery`, fix unsafe), l'ordine autorevole diventa quello della regola — lo stesso del plugin Prettier ufficiale — e questa lista manuale non va mantenuta in parallelo. La regola accetta `tailwind.stylesheet` per conoscere token, utility e varianti del progetto. Scegliere una sola fonte di verità: o la regola automatica o la convenzione manuale.

### 5.4 Regole di buon uso

- Preferire token e utility del tema alle arbitrary values.
- Arbitrary values (`w-[...]`, colori custom, ecc.) sono consentiti quando il valore è davvero specifico e non rappresenta un token riutilizzabile.
- Se un valore compare in più componenti, promuoverlo a token o variante.
- Evitare attributi `className` lunghi che descrivono un intero componente ripetuto: estrarre il componente o definire una variante.
- Non usare `@apply` come meccanismo generale per ricreare un framework di classi dentro il CSS.
- `@apply` MAY essere usato in integrazioni circoscritte con CSS legacy o markup di terze parti, con motivazione.
- Per utility personalizzate riutilizzabili preferire `@utility` di Tailwind v4 a `@layer utilities` o a catene di `@apply`.
- Per valori realmente dinamici usare CSS custom properties inline solo se la CSP lo consente: gli attributi `style` sono governati da `style-src-attr` e un nonce non li autorizza. In caso di CSP restrittiva preferire classi statiche o un blocco `<style>` con nonce/hash, oppure valutare `style-src-attr`/`unsafe-hashes` in modo circoscritto. Applicare un cast locale motivato o un helper tipizzato, validare i valori e non passare input non fidato in `style`.
- Evitare `!important`; ogni eccezione deve risolvere un conflitto esterno documentato.
- Non costruire classi CSS a partire da dati API, input utente o output LLM.

---

## 6. Design token e theming

### 6.1 Un'unica fonte di verità

**MUST:** i valori globali dell'identità visiva devono vivere in token semantici centralizzati, non essere replicati nelle classi delle feature.

Il programmatore umano deve poter modificare in un punto solo:

- palette;
- colori di testo e superficie;
- colori di stato;
- font e scala tipografica;
- radius;
- ombre;
- spaziature speciali di prodotto;
- densità dei controlli, quando prevista;
- durata e curva delle animazioni comuni.

I token sono CSS custom properties. `@theme` di Tailwind mappa i token alle utility class disponibili.

### 6.2 Token semantici, non nomi visivi

Preferire:

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--success
--success-foreground
--warning
--warning-foreground
--info
--info-foreground
```

Evitare che i componenti dipendano da nomi come `blue-600`, `gray-100` o `purple-500` per esprimere il significato di un'azione. Le palette primitive possono esistere internamente, ma i componenti usano token semantici.

### 6.3 Light e dark theme

Predisporre il sistema per light e dark theme, anche quando il prodotto viene inizialmente rilasciato con un solo tema.

- `:root` dichiara i token del tema chiaro;
- una classe o un attributo stabile sul root (es. `.dark` o `data-theme`) attiva i token scuri; scegliere un solo meccanismo. La configurazione shadcn corrente usa `.dark` e `@custom-variant dark (&:is(.dark *))`; se si usa `data-theme`, la custom variant va riscritta coerentemente (es. `@custom-variant dark (&:is([data-theme="dark"] *))`);
- `color-scheme` va impostato coerentemente per controlli nativi e scrollbar;
- le componenti non duplicano i propri CSS per tema: cambiano i token;
- la modalità scelta dall'utente va gestita a livello applicativo, non con hack nei singoli componenti;
- la persistenza della preferenza è responsabilità di un unico ThemeProvider o equivalente;
- il tema iniziale va applicato prima del primo paint, con uno script bloccante minimo o un attributo impostato lato server, per evitare il flash; rispettare `prefers-color-scheme` come default e aggiornare `color-scheme` e `theme-color`. In presenza di CSP, lo script inline richiede nonce o hash: non introdurre `unsafe-inline` solo per il theme bootstrap.

Usare la configurazione `cssVariables: true` di shadcn e le custom properties semantiche. Il CSS deve rimanere la fonte autorevole per i valori del tema; non duplicare la palette in un oggetto TypeScript parallelo salvo una necessità concreta di generare dati per un'altra piattaforma.

### 6.4 Esempio di struttura dei token

Esempio schematico: i valori effettivi vanno scelti in una PDR/decisione di visual language e verificati per contrasto.

```css
/* design-system/theme/tokens.css */
:root {
  color-scheme: light;

  --background: oklch(99% 0.003 250);
  --foreground: oklch(22% 0.015 250);
  --card: oklch(100% 0 0);
  --card-foreground: var(--foreground);

  --popover: oklch(100% 0 0);
  --popover-foreground: var(--foreground);

  --primary: oklch(48% 0.16 255);
  --primary-foreground: oklch(99% 0.003 250);

  --secondary: oklch(95% 0.01 250);
  --secondary-foreground: var(--foreground);

  --muted: oklch(96% 0.008 250);
  --muted-foreground: oklch(48% 0.02 250);

  --accent: oklch(92% 0.03 255);
  --accent-foreground: oklch(24% 0.05 255);

  --destructive: oklch(55% 0.2 25);
  --destructive-foreground: oklch(99% 0.003 25);

  --success: oklch(52% 0.14 150);
  --success-foreground: oklch(99% 0.003 150);

  --warning: oklch(80% 0.14 85);
  --warning-foreground: oklch(20% 0.03 85);

  --info: oklch(55% 0.12 240);
  --info-foreground: oklch(99% 0.003 240);

  --border: oklch(90% 0.01 250);
  --input: var(--border);
  --ring: var(--primary);

  --radius: 0.625rem;
}

.dark {
  color-scheme: dark;

  --background: oklch(17% 0.015 255);
  --foreground: oklch(96% 0.006 255);
  --card: oklch(20% 0.016 255);
  --card-foreground: var(--foreground);

  --popover: oklch(20% 0.016 255);
  --popover-foreground: var(--foreground);

  --primary: oklch(72% 0.13 255);
  --primary-foreground: oklch(18% 0.02 255);

  --secondary: oklch(27% 0.015 255);
  --secondary-foreground: var(--foreground);

  --muted: oklch(25% 0.012 255);
  --muted-foreground: oklch(72% 0.012 255);

  --accent: oklch(31% 0.04 255);
  --accent-foreground: oklch(96% 0.01 255);

  --destructive: oklch(62% 0.18 25);
  --destructive-foreground: oklch(18% 0.02 25);

  --success: oklch(70% 0.13 150);
  --success-foreground: oklch(18% 0.02 150);

  --warning: oklch(82% 0.13 85);
  --warning-foreground: oklch(20% 0.03 85);

  --info: oklch(72% 0.11 240);
  --info-foreground: oklch(18% 0.02 240);

  --border: oklch(32% 0.012 255);
  --input: var(--border);
  --ring: var(--primary);
}
```

I numeri sono illustrativi: non costituiscono una palette prescritta. Gli abbinamenti foreground/background dell'esempio sono scelti per superare 4.5:1, ma vanno riverificati con uno strumento di contrasto quando si cambiano i valori, soprattutto per success, warning, info e destructive.

### 6.5 Mappatura Tailwind

Usare la direttiva `@theme inline` per mappare i token CSS semantici alle utility Tailwind, secondo la struttura generata dalla versione corrente di shadcn:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}
```

L'esempio è una base: ogni token aggiunto al tema (stati, sidebar, chart, ecc.) va mappato allo stesso modo, altrimenti l'utility Tailwind non esiste.

`inline` fa sì che l'utility usi direttamente il riferimento `var(--token)` invece del valore risolto: è necessario quando un tema ridefinisce i token (`.dark`) e quando un theme variable referenzia un'altra custom property (es. `--color-background: var(--background)`). Senza `inline`, il valore può essere risolto nello scope sbagliato e gli override di tema non raggiungono l'utility.

Non ridefinire manualmente le utility già fornite da Tailwind. Non usare `@theme static` senza motivo: per impostazione predefinita Tailwind genera le theme variable necessarie alle classi usate; `static` è adatto solo quando si desidera esportare sempre l'intero set di variabili.

### 6.6 Colori e OKLCH

**SHOULD:** usare `oklch()` come formato di authoring per le palette nuove.

Vantaggi:

- separazione intuitiva fra luminosità, chroma e tinta;
- regolazioni della luminosità più coerenti;
- costruzione di scale e temi più prevedibile;
- buona integrazione con Tailwind CSS 4 e CSS moderno.

Non assumere però che colori con la stessa luminosità percepita garantiscano contrasto sufficiente. Il contrasto deve essere misurato sui colori effettivi, anche nelle combinazioni di stato e nei temi scuri.

### 6.7 Tipografia e font

- Definire una famiglia sans primaria e, se serve, famiglie separate per codice o contenuti editoriali.
- Preferire un numero ridotto di font e pesi.
- MAY usare font variable per ridurre richieste e semplificare i pesi.
- Se si usa un font web, preferire self-hosting o un pacchetto locale controllato; evitare dipendenze involontarie da CDN terze.
- Caricare i font con `font-display` adeguato, subset e preload misurati; non precaricare pesi inutilizzati e contenere il CLS.
- Definire scala tipografica e line-height coerenti tramite token/utility.
- Non impostare font-size puntuali in ogni feature.
- Il testo del prodotto non deve essere trasformato in immagine per ottenere un effetto visivo.

---

## 7. Organizzazione di directory e file

### 7.1 Struttura suggerita

```text
apps/web/src/
├── app/
│   ├── app.tsx
│   ├── router.tsx
│   └── providers/
│       └── theme-provider.tsx
│
├── design-system/
│   ├── README.md
│   ├── theme/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── motion.css              # solo se esiste un set di animazioni globali
│   │
│   ├── primitives/                # shadcn + Base UI adattati al progetto
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── patterns/                  # composizioni riutilizzabili fra feature
│   │   ├── form-field.tsx
│   │   ├── page-header.tsx
│   │   ├── empty-state.tsx
│   │   └── ...
│   │
│   ├── icons/
│   │   ├── index.ts               # solo alias condivisi davvero utili
│   │   └── ...
│   │
│   └── lib/
│       └── utils.ts               # re-export di cn e helper UI minimi
│
├── features/
│   └── <feature>/
│       ├── components/
│       │   ├── feature-panel.tsx
│       │   └── feature-panel.module.css  # solo quando necessario
│       ├── hooks/
│       ├── api/
│       ├── tests/
│       └── ...
│
├── assets/
└── main.tsx
```

La struttura è indicativa. Non creare cartelle vuote e non introdurre `patterns`, `icons` o `motion.css` finché non contengono responsabilità reali.

Per i nuovi progetti basati su shadcn, usare file kebab-case (`button.tsx`, `dropdown-menu.tsx`) e simboli React PascalCase (`Button`, `DropdownMenu`). Nel boilerplate attuale non effettuare una migrazione indiscriminata: mantenere la convenzione PascalCase e il design system piatto fino a una migrazione esplicita e coerente, con `git mv` in un commit dedicato. Evitare in ogni caso file duplicati che differiscono solo per maiuscole/minuscole.

### 7.2 Regole sui confini

- `design-system/primitives` contiene componenti generici, senza logica di dominio.
- `design-system/patterns` contiene composizioni riutilizzabili fra più feature.
- `features/<feature>` contiene composizioni e componenti specifici della feature.
- un componente specifico di una sola feature non va promosso prematuramente a design system;
- un componente diventa pattern condiviso quando esiste un secondo caso d'uso reale o quando una PDR ne richiede deliberatamente il riuso;
- evitare cartelle globali `components/`, `hooks/` e `styles/` che raccolgono componenti non correlati;
- evitare grandi barrel file: gli entry point pubblici devono essere piccoli e deliberati.

### 7.3 Elementi HTML nativi e design system

La prescrizione «non usare elementi HTML grezzi fuori dal design system» va intesa come divieto di ricostruire **controlli interattivi e primitive che hanno comportamento e stile condivisi**, non come divieto di usare HTML semantico per la struttura del documento.

Fuori dal design system è corretto e spesso preferibile usare HTML semantico nativo per la struttura del documento: `main`, `section`, `header`, `nav`, `h1`–`h6`, `p`, `ul`, `ol`, `li`, `article`, `label` e simili.

Per pulsanti, link d'azione, input, checkbox, switch, select, combobox, menu, dialog, tooltip e componenti interattivi equivalenti:

- usare il componente del design system;
- non ricostruire la gestione di focus, tastiera o ARIA in una feature;
- non usare `div` o `span` cliccabili come sostituti di `button` o `a`;
- se manca il componente necessario, aggiungerlo al design system prima di usarlo in più schermate.

Non creare un wrapper design system per ogni tag HTML (`Text`, `Paragraph`, `Section` ecc.) se non aggiunge valore reale.

Questa è una precisazione della formulazione del Vademecum TypeScript (§ UI web) e di `AGENTS.md`: se il progetto adotta questa lettura, allineare anche quei documenti — o registrarla in ADR — per evitare che un agente riceva due regole apparentemente in conflitto.

### 7.4 Colocazione dei CSS

- CSS globale: soltanto in `design-system/theme/`.
- CSS di primitive/pattern: dentro la relativa directory, se non espresso con Tailwind.
- CSS di feature: accanto al componente che lo possiede.
- un file CSS non deve contenere regole per componenti di feature differenti;
- i token non vanno duplicati nei CSS Modules;
- non creare un foglio globale con classi specifiche di una sola schermata.

---

## 8. Struttura e ordine dei fogli CSS

### 8.1 Un unico punto d'ingresso globale

La UI deve importare il CSS globale una sola volta, nell'entry point dell'applicazione o nel file globale di stile importato da esso.

La configurazione effettiva di shadcn generata dal CLI è la fonte di verità. Un esempio schematico della famiglia di import usata dalla documentazione corrente è:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./tokens.css";

@custom-variant dark (&:is(.dark *));
```

L'ordine preciso e il contenuto di `@theme inline` devono seguire il template della versione shadcn installata. Non riscrivere manualmente il bootstrap generato senza capire cosa il CLI si aspetta.

`shadcn/tailwind.css` è esportato dal pacchetto `shadcn`: se il progetto non lo tiene installato, l'import non si risolve. `pnpm dlx shadcn@latest eject` inlinea quel CSS e rimuove la dipendenza, ma è irreversibile e rinuncia agli aggiornamenti automatici del file. Scegliere consapevolmente una delle due strade.

### 8.2 Reset e Preflight

Tailwind include Preflight nel layer `base`. **Non aggiungere un secondo reset CSS** e non importare normalize.css o reset di altri design system senza un problema concreto e un'ADR. Le correzioni globali necessarie vanno aggiunte con parsimonia nel layer `base`.

### 8.3 Cascade layers

Tailwind CSS v4 usa i cascade layers `theme`, `base`, `components`, `utilities`.

Regole:

- usare i layer per dichiarare consapevolmente il livello delle regole globali;
- non aggiungere CSS globale unlayered per «battere» Tailwind: le regole non-layered possono avere precedenza sulle regole normali nei layer e rendono la cascata meno prevedibile;
- non combattere la specificità con catene di selettori sempre più lunghe;
- non aggiungere `!important` come scorciatoia;
- usare `@layer base` per le poche regole globali di base;
- usare `@layer components` per classi component-level realmente globali;
- lasciar gestire a Tailwind il layer utilities.

### 8.4 CSS nesting

Il nesting nativo è ammesso e utile per raggruppare stati e selettori di un componente. Non annidare selettori profondamente: il nesting deve rendere il file più leggibile, non ricreare la struttura DOM come una matrioska.

Regola pratica: preferire due livelli; superare tre livelli solo quando il markup e il comportamento lo giustificano chiaramente.

### 8.5 Naming

Per classi CSS Modules usare nomi descrittivi legati alla responsabilità locale:

```css
.root {}
.header {}
.title {}
.content {}
.footer {}
.isExpanded {}
```

Non usare prefissi generici ripetuti come `.blue`, `.big`, `.left` per componenti diversi. Evitare BEM completo quando CSS Modules fornisce già isolamento; non introdurre convenzioni concorrenti senza bisogno.

---

## 9. Layout e responsive design

### 9.1 Approccio mobile-first

**MUST:** il layout deve funzionare a partire da viewport stretti, ampliandosi progressivamente.

- breakpoint solo quando il layout necessita di cambiare;
- non progettare soltanto su desktop e comprimere la UI successivamente;
- evitare larghezze e altezze rigide senza ragione;
- usare `min-width: 0` e `minmax(0, 1fr)` quando necessario per evitare overflow dei contenuti;
- gestire esplicitamente overflow, wrapping e contenuti lunghi;
- testare almeno un viewport mobile, uno intermedio e uno desktop per le pagine rilevanti.

### 9.2 Media query e container query

Usare:

- **media query** per il layout della pagina e le preferenze del dispositivo/utente;
- **container query** per componenti riutilizzabili che devono adattarsi allo spazio effettivamente disponibile nel loro contenitore.

Una card riutilizzabile non dovrebbe dipendere soltanto dalla larghezza del viewport: la stessa card può vivere in una sidebar, in una griglia o in una pagina a tutta larghezza.

Le container query sono Baseline Widely Available. Usarle quando semplificano davvero il componente; non aggiungere un container a ogni nodo.

### 9.3 Layout

Preferire:

- CSS Grid per strutture bidimensionali;
- Flexbox per allineamento e flussi monodimensionali;
- `gap` invece di margini ripetuti fra figli;
- `min()`, `max()` e `clamp()` per dimensioni fluide;
- proprietà logiche (`margin-inline`, `padding-block`, `inset-inline-start`) quando appropriate;
- unità relative e token per dimensioni comuni.

Evitare:

- posizionamento assoluto per impaginare intere schermate;
- percentuali e `vh` senza considerare viewport mobile e tastiera virtuale;
- layout basati su `float`;
- breakpoint arbitrari replicati in molti file;
- `z-index` casuali: definire pochi livelli semantici per overlay, menu, sticky header e modal.

### 9.4 Stati e selettori

Preferire stati semantici espressi da proprietà/attributi (`disabled`, `aria-invalid`, `data-state`, `data-open`) e utility variant coerenti. Non derivare lo stato visuale esclusivamente da una classe opaca impostata manualmente dall'agente.

### 9.5 Internazionalizzazione, testo lungo e RTL

- Impostare `lang` e, quando supportato, `dir` sul documento; non affidarsi al solo layout visivo.
- Usare `Intl` per date, numeri, valute e plurali invece di formattazioni hardcoded.
- Testare testi lunghi e traduzioni: evitare larghezze fisse, usare wrapping, `overflow-wrap` e `min-width: 0` dove serve.
- Usare proprietà logiche (`margin-inline`, `padding-block`, `inset-inline-start`) per essere pronti a RTL.
- Non inserire testo in immagini; il testo deve restare selezionabile, traducibile e leggibile dagli screen reader.

---

## 10. Accessibilità e semantica UI

L'accessibilità non è una rifinitura successiva: fa parte del comportamento richiesto dal componente.

### 10.1 Standard minimo

**MUST:** progettare per WCAG 2.2 livello AA, salvo requisiti più stringenti.

Requisiti operativi:

- contrasto testo normale almeno 4.5:1;
- contrasto testo grande almeno 3:1;
- gli stati e le informazioni non devono essere comunicati soltanto dal colore;
- focus visibile e non nascosto;
- controlli operabili da tastiera;
- focus gestito correttamente in dialog, menu, popover e controlli compositi;
- label programmatiche associate ai campi;
- errori collegati ai campi e comprensibili;
- nomi accessibili per controlli icon-only;
- ordine di lettura e ordine di focus coerenti;
- heading gerarchici e landmark semantici;
- layout leggibile con zoom e font ingranditi;
- supporto a `prefers-reduced-motion`.

Requisiti WCAG 2.2 AA spesso dimenticati, da verificare esplicitamente:

- **1.4.11 Contrasto non testuale:** almeno 3:1 per le informazioni visive necessarie a identificare controlli, stati e elementi grafici significativi (bordi di controlli, indicatori di focus, icone portatrici di informazione). Non riguarda indistintamente ogni bordo decorativo.
- **2.5.8 Target size:** target di puntamento almeno 24×24 CSS px, o spazio equivalente, salvo le eccezioni previste.
- **1.4.4 e 1.4.10:** testo ridimensionabile al 200% e reflow a 320 CSS px senza perdita di contenuto.
- **2.4.11 Focus non occultato:** il componente con focus non deve essere interamente nascosto da sticky header, banner o overlay. La visibilità completa del focus resta la buona pratica raccomandata, ma il minimo AA richiede solo che non sia completamente coperto.
- **2.5.7 Dragging movements:** se un'operazione richiede un gesto di trascinamento (slider, riordino, disegno), offrire un'alternativa a puntamento singolo, salvo quando il trascinamento è essenziale.
- **3.2.6 Consistent help:** se il prodotto offre un meccanismo di aiuto (contatto, chat, FAQ), deve comparire nello stesso ordine e nella stessa posizione relativa nelle pagine in cui è presente.
- **3.3.7 Redundant entry:** se il flusso chiede di reinserire informazioni già fornite nella stessa sessione, precompilare o offrire una selezione, salvo le eccezioni previste (sicurezza, dati non più validi).
- **3.3.8 Accessible authentication:** se l'autenticazione richiede un test cognitivo (memoria, puzzle, trascrizione), offrire un'alternativa o un supporto compatibile (password manager, incolla, passkey, OTP), salvo le eccezioni previste.
- **MAY:** supporto a `prefers-contrast` e `forced-colors` quando il prodotto lo richiede.

Il contrasto deve essere verificato per ogni combinazione effettiva, compresi hover, disabled, focus, dark mode e stati di errore.

### 10.2 Focus

- usare `:focus-visible` per un indicatore chiaro;
- non rimuovere outline senza sostituirlo con un indicatore equivalente o migliore;
- non affidarsi al solo cambio di colore;
- evitare che sticky header, dialog o contenitori scrollabili nascondano l'elemento focalizzato;
- per anchor e focus programmatico usare `scroll-margin-top`/`scroll-padding-top` commisurati allo header sticky, invece di compensazioni JS fragili;
- il criterio 2.4.11 richiede che il componente con focus non sia interamente occultato; puntare comunque alla visibilità completa dell'indicatore e dell'elemento;
- dopo la chiusura di un overlay, restituire il focus al trigger corretto.

### 10.3 Icone e controlli

Un'icona decorativa deve essere nascosta agli screen reader (`aria-hidden="true"` se necessario). Un pulsante che contiene soltanto un'icona deve avere un nome accessibile esplicito tramite `aria-label` o testo visivamente nascosto.

Un tooltip non sostituisce un nome accessibile. Un'icona non deve essere l'unico modo per distinguere due azioni ambigue.

### 10.4 Tastiera

Il prodotto SHOULD essere completamente fruibile senza mouse. I test Playwright SHOULD usare interazioni da tastiera quando equivalenti:

- Tab e Shift+Tab;
- Enter e Space;
- Escape;
- frecce nei controlli compositi;
- Home/End quando previsto dalla convenzione del componente.

Usare Base UI per non reinventare queste interazioni, ma non presumere che l'uso di una libreria garantisca automaticamente l'accessibilità dell'intera pagina.

### 10.5 Sicurezza del rendering e del CSS

- Non usare `dangerouslySetInnerHTML` con contenuto non fidato: sanitizzare con una libreria dedicata e una policy esplicita.
- Non passare input utente, output LLM o dati API in `style`, custom properties o nomi di classe senza validazione e allow-list. Gli attributi `style` inline possono essere bloccati da una CSP restrittiva (`style-src-attr`); i nonce non li sbloccano. Se servono valori dinamici, usare classi statiche, custom properties impostate da un blocco `<style>` con nonce/hash o, in modo circoscritto, `unsafe-hashes`.
- Validare URL e attributi `href`/`src` con allow-list specifiche per contesto (link, immagini, media, form): consentire solo schemi e origini necessari (es. `https:`, path relativi, `mailto:`/`tel:` se previsti). `data:` non è vietato in assoluto: può essere legittimo per immagini o font, ma va limitato con `img-src`/`font-src` e controlli di tipo e dimensione.
- Preferire CSS statico generato dalla build: è compatibile con una CSP senza `unsafe-inline` per gli stili. Gli script inline necessari (es. theme bootstrap) richiedono nonce o hash; per gli attributi `style` serve una policy `style-src-attr` esplicita o un'alternativa.
- Se si rende Markdown o HTML di terze parti, usare una pipeline di sanitizzazione e testare i casi malevoli.
- Trattare le dipendenze UI come supply chain: versioni fissate, lockfile, revisione degli aggiornamenti.

---

## 11. Icone: Lucide React

### 11.1 Scelta standard

**SHOULD forte: usare `lucide-react` come unica libreria di icone dell'applicazione.**

Lucide fornisce componenti React che rendono SVG inline ottimizzati, tipizzati e tree-shakable: il bundle include le icone importate, non l'intero catalogo.

Importare le icone per nome:

```tsx
import { Search, Plus, Trash2 } from "lucide-react";

<Search aria-hidden="true" className="size-4" />
```

### 11.2 Regole d'uso

- non usare emoji per rappresentare azioni, stati o navigazione dell'interfaccia;
- non introdurre contemporaneamente Lucide, Heroicons, Font Awesome e React Icons;
- non copiare SVG inventati dall'agente quando esiste un'icona Lucide equivalente;
- usare dimensioni coerenti con il design system, normalmente 16/20/24 px in base alla densità;
- usare un solo stroke width coerente, salvo casi motivati;
- usare `currentColor`/il colore ereditato, non colori hardcoded nel singolo SVG;
- icone decorative: `aria-hidden="true"`;
- icone che costituiscono l'unico contenuto di un controllo: nome accessibile sul controllo;
- import statici e nominativi; evitare mappe dinamiche che importano l'intero namespace senza necessità;
- per icone brand/logo usare l'asset ufficiale del marchio, non forzare un'icona Lucide simile.

### 11.3 Modulo centrale

Il progetto MAY introdurre alias semantici per azioni ricorrenti (es. `AddIcon`, `SearchIcon`) se riducono davvero la duplicazione. Non creare un wrapper `Icon` universale se rende meno chiara l'API o impedisce il tree-shaking.

Le icone specifiche di una feature possono essere importate direttamente da `lucide-react`, rispettando dimensioni e accessibilità.

---

## 12. Animazioni e micro-interazioni

### 12.1 CSS prima di una libreria

Per hover, focus, piccoli cambi di stato e transizioni semplici usare CSS/Tailwind:

- preferire `transform` e `opacity` per animazioni frequenti;
- evitare animazioni continue o decorative non necessarie;
- evitare di animare proprietà che richiedono layout/paint costosi se esiste una soluzione equivalente;
- animazioni brevi, coerenti e non sorprendenti;
- non rallentare l'interazione in nome dell'estetica.

`tw-animate-css` può essere mantenuto per le classi richieste dai componenti shadcn aggiunti. Non creare un secondo framework di animazione per effetti banali.

### 12.2 Reduced motion

**MUST:** rispettare `prefers-reduced-motion`.

Ridurre o eliminare movimento non essenziale per chi lo richiede. Non comunicare informazioni soltanto tramite movimento.

Implementare il rispetto in modo sistematico: usare la variante `motion-reduce:` di Tailwind o azzerare una custom property di durata condivisa nel media query, evitando `!important` globali. Le animazioni infinite o decorative vanno disattivate, non solo rallentate.

### 12.3 Motion for React

La libreria Motion per React (precedentemente Framer Motion) MAY essere aggiunta quando il prodotto richiede:

- layout animation complesse;
- transizioni di entrata/uscita fra componenti;
- gesture/drag articolati;
- animazioni coordinate su più elementi;
- spring fisiche o scroll-linked animation non semplici da mantenere in CSS.

Non aggiungerla come dipendenza di default. L'ADR deve indicare quali comportamenti non sono ragionevolmente esprimibili con CSS. Verificare bundle, modalità di import e supporto reduced-motion.

---

## 13. Librerie UI ausiliarie

La regola generale è **non trasformare un catalogo di librerie utili in uno stack obbligatorio**. Ogni dipendenza deve rispondere a un bisogno concreto e avere un proprietario architetturale.

### 13.1 Matrice raccomandata

| Libreria | Stato | Quando usarla | Policy |
|---|---|---|---|
| Lucide React | Standard | Icone dell'interfaccia | Unico set di icone |
| `cn` | Standard | Composizione classi Tailwind | Una sola funzione centralizzata |
| CVA | Standard quando servono varianti | API variant/size/tone dei componenti | Non usarla per componenti banali |
| Sonner | MAY / consigliata per toast | Notifiche brevi non bloccanti | Un solo sistema toast globale |
| React Hook Form | MAY | Form complessi, dinamici o con molti campi | Non usarla per un singolo input semplice |
| `@hookform/resolvers` | MAY, con RHF | Collegare il form alla libreria schema già scelta dal progetto | Non creare un secondo schema parallelo |
| TanStack Table | MAY | Tabelle complesse con sorting, filtering, grouping, selection o pagination | Il rendering resta nei componenti del design system |
| `@tanstack/react-virtual` | MAY | Liste/tabelle con molti elementi e problema misurato di rendering | Non virtualizzare piccole liste |
| Motion | MAY | Animazioni complesse e gesture | CSS prima |
| Storybook | MAY | Catalogo, sviluppo isolato e documentazione di un design system in crescita | Non necessario per 3–5 componenti semplici |
| `@axe-core/playwright` | SHOULD | Audit accessibilità nei flussi E2E | Integrare con i test Playwright |
| `@testing-library/react` + `@testing-library/user-event` + jsdom/happy-dom | MAY, quando si testano componenti | Test comportamentali in Vitest | Un solo ambiente DOM confinato al progetto Vitest frontend, mai al dominio |
| Plugin Oxlint `jsx-a11y` | SHOULD quando esiste una UI | Lint statico di accessibilità su JSX | Abilitare le regole applicabili, senza duplicare Biome |
| `@fontsource-variable/<font>` | MAY | Self-hosting di un font variable specifico | Solo se il font è deciso dal prodotto |
| Libreria grafici | MAY | Dashboard o data visualization | Selezione separata in base ai grafici richiesti |

### 13.2 Sonner

Usare Sonner per notifiche toast brevi e non bloccanti (es. salvataggio completato, copia negli appunti). Installare il componente seguendo shadcn e collocare un unico `Toaster` al livello del layout/provider globale.

Non usare toast per:

- errori che richiedono una decisione;
- contenuti che devono rimanere visibili;
- informazioni essenziali che scompaiono troppo rapidamente;
- conferme di operazioni distruttive (usare Alert Dialog o pattern equivalente).

Non introdurre due sistemi toast contemporaneamente.

I messaggi asincroni devono essere annunciati in modo appropriato: `role="status"`/`aria-live="polite"` per conferme non urgenti, `role="alert"`/`aria-live="assertive"` solo per errori che richiedono attenzione immediata. Non duplicare lo stesso annuncio in più regioni live e non affidare informazioni essenziali a un toast che scompare.

### 13.3 React Hook Form e validazione

Per form semplici usare i controlli React e il design system senza introdurre una libreria.

Per form complessi, React Hook Form è una scelta valida. Collegarlo a `@hookform/resolvers` e alla **stessa libreria di schema scelta dal progetto** (ad esempio Zod, Valibot o altra libreria Standard Schema selezionata tramite ADR).

Regole:

- lo schema canonico e i DTO devono restare coerenti con `packages/contracts`;
- non duplicare validazioni fra frontend, API e dominio;
- il frontend può fornire feedback anticipato, ma il backend resta autorevole;
- ogni errore deve essere associato al campo e presentato con una label/testo accessibile;
- non usare React Hook Form solo per gestire un campo isolato.

### 13.4 Tabelle e liste

Usare TanStack Table quando servono funzionalità non banali: sorting, filtri combinati, grouping, row selection, column visibility o pagination.

Il rendering delle celle e dei controlli deve continuare a usare il design system. TanStack Table non deve diventare un secondo sistema visuale.

Usare TanStack Virtual soltanto quando la quantità di elementi e le misurazioni dimostrano un problema di rendering o memoria. La virtualizzazione complica scrolling, focus e accessibilità: non va applicata preventivamente.

### 13.5 Storybook

Storybook è utile quando il design system cresce e serve un catalogo navigabile di stati, varianti e interazioni.

Adottarlo quando:

- ci sono molte primitive e pattern;
- più agenti o programmatori lavorano sul sistema;
- servono review visive isolate;
- la documentazione di componenti è diventata difficile da mantenere nei README;
- si vuole testare un componente senza avviare l'intera applicazione.

Non introdurlo per un'interfaccia piccola e temporanea. Playwright rimane il riferimento per i flussi reali end-to-end.

### 13.6 Librerie da non aggiungere in parallelo

**MUST NOT**, senza ADR di sostituzione del design system:

- DaisyUI insieme a shadcn/ui come seconda libreria di component classes;
- MUI, Chakra UI, Mantine, Ant Design o altro design system completo insieme a shadcn;
- più librerie headless per gli stessi controlli;
- più librerie di icone;
- più librerie toast;
- più librerie di animazione per lo stesso scopo;
- CSS-in-JS runtime accanto al modello statico senza esigenza misurata.

Non importa quanto una libreria sia popolare: due design system completi nello stesso frontend introducono doppie API, token, stati e convenzioni.

---

## 14. Performance e CSS di produzione

### 14.1 Generare soltanto le utility usate

Tailwind analizza i sorgenti e genera le utility riconosciute. Questo riduce la necessità di interventi manuali sul CSS inutilizzato.

Regole:

- classi complete e statiche nei file TSX/CSS;
- `@source` per package sorgente non scansionati automaticamente;
- `@source inline()` solo per safelist piccole e documentate;
- `@source not` per escludere percorsi generati o irrilevanti, invece di allargare la scansione;
- niente classi dinamiche costruite per concatenazione;
- non aggiungere PurgeCSS sopra Tailwind senza una motivazione misurata;
- verificare il CSS prodotto dalla build, non dedurre la dimensione dal numero di classi nel sorgente.

### 14.2 CSS custom non utilizzato

Il rilevamento delle utility Tailwind non equivale alla rimozione automatica di ogni regola CSS personalizzata inutilizzata.

- importare CSS Modules soltanto dai componenti che li usano;
- eliminare classi/regole non più referenziate;
- valutare le regole Biome relative a classi CSS non usate quando applicabili;
- non mantenere fogli legacy dopo la migrazione;
- non introdurre plugin di purge aggiuntivi senza verificare prima i limiti degli strumenti già presenti.

### 14.3 Pipeline Vite

Usare l'integrazione ufficiale `@tailwindcss/vite`.

Vite offre già:

- import e gestione dei CSS;
- CSS Modules;
- estrazione CSS per chunk;
- code splitting;
- minificazione CSS tramite Lightning CSS nella linea documentata corrente;
- target browser configurabile.

Lasciare `build.cssCodeSplit` abilitato (default) salvo misurazioni che dimostrino un vantaggio concreto nel produrre un unico file. Il CSS associato ai chunk asincroni deve essere caricato insieme al chunk relativo.

Non aggiungere PostCSS, cssnano, PurgeCSS o una seconda pipeline CSS soltanto per duplicare funzioni già coperte da Tailwind/Vite/Lightning CSS.

### 14.4 Browser target

Adottare il browser target predefinito Baseline Widely Available di Vite salvo requisiti del prodotto diversi. Se il prodotto deve supportare browser embedded, WebView o dispositivi legacy, documentare il target in ADR e verificare le trasformazioni CSS.

Non aggiungere polyfill CSS o prefissi vendor manuali senza evidenza: la pipeline deve gestire le trasformazioni necessarie in base al target.

### 14.5 Buone pratiche di rendering

- evitare layout shift dovuti a immagini senza dimensioni/ratio;
- dichiarare `width`/`height` o `aspect-ratio`, usare `srcset`/`sizes`, formati moderni e `loading="lazy"` sotto la piega; `fetchpriority="high"` solo per l'immagine principale;
- riservare spazio per contenuti asincroni quando necessario;
- evitare animazioni continue e costose;
- non forzare `will-change` permanentemente su molti elementi;
- usare `content-visibility` o virtualizzazione soltanto dopo misurazioni;
- non complicare selettori per micro-ottimizzazioni non dimostrate;
- evitare di applicare transizioni a `all` senza motivo;
- evitare CSS duplicati con molte combinazioni di classi arbitrarie;
- verificare dimensione e numero di chunk CSS reali dopo la build.

### 14.6 Budget di performance

Non fissare un limite universale di kilobyte valido per ogni applicazione. Stabilire un budget iniziale dopo la prima build rappresentativa, registrarlo nel progetto e applicare il ratchet:

- il CSS totale e il CSS iniziale non devono crescere senza motivazione;
- un aumento significativo richiede una spiegazione nel report/PR;
- una riduzione del CSS non deve essere ottenuta eliminando funzionalità o stati;
- le soglie possono solo migliorare o essere aggiornate con ADR quando cambia lo scope del prodotto.

---

## 15. Tooling statico e quality gates

### 15.1 Formatter e linter

**Biome è l'autorità per format e lint CSS**, in continuità con il Vademecum TypeScript.

La versione corrente di Biome supporta parsing, formattazione e linting di CSS e SCSS, quindi è sufficiente per i controlli CSS standard e permette di evitare un secondo linter nel caso comune.

Attenzione alla configurazione: Biome non interpreta i direttivi Tailwind (`@theme`, `@utility`, `@source`, `@apply`, `@custom-variant`) se `css.parser.tailwindDirectives` è disattivato, ed è disattivato per default. Inoltre il linter Biome può essere spento globalmente (come in questo repository, dove Oxlint è il linter TS/JS) e restare attivo solo per il CSS tramite `css.linter.enabled`. Configurazione minima consigliata:

```json
{
  "linter": {
    "enabled": false,
    "rules": {
      "complexity": { "noImportantStyles": "error" }
    }
  },
  "css": {
    "parser": { "tailwindDirectives": true },
    "linter": { "enabled": true }
  }
}
```

Con questa configurazione `biome check`/`biome lint` controlla il CSS senza riattivare il linter Biome su TS/JS. Le severità delle regole CSS si impostano in `linter.rules` (es. `complexity.noImportantStyles: "error"`) e restano efficaci con il linter globale spento. Se invece si esegue Biome con il parser Tailwind disattivato, i direttivi vengono segnalati come errore di parsing e la formattazione si interrompe.

Policy:

- `biome format` / `biome check` formato CSS, TSX e TypeScript;
- Oxlint continua a essere il linter TS/JS autorevole secondo il vademecum TypeScript;
- attivare il linter CSS di Biome con le regole raccomandate;
- regole CSS utili: `correctness/noUnknownProperty`, `suspicious/noUnknownAtRules`, `suspicious/noDuplicateProperties`, `complexity/noImportantStyles`;
- `nursery/noUnusedClasses`: abilitarla solo su CSS per cui l'analisi è affidabile. In Biome 2.6.5 non riconosce i riferimenti CSS Modules come `styles.button` e segnala falsi positivi: escludere `*.module.css` o non abilitarla finché il supporto non è affidabile;
- `nursery/useTailwindStaticClassStrings` (dalla 2.6.0, dominio `tailwind`): raccomandata per impedire classi Tailwind costruite dinamicamente; rileva template literal e concatenazioni negli attributi e nelle funzioni riconosciute, ma non segue le variabili né i tagged template, quindi la review resta necessaria. Valutarne l'attivazione come gate dopo aver verificato i falsi positivi;
- `nursery/useTailwindSortedClasses` (fix unsafe): opt-in, non obbligatoria; se adottata diventa l'unica fonte di ordinamento al posto della convenzione manuale e va validata prima di promuoverla a gate. Usa `tailwind.stylesheet` per conoscere token e utility;
- `nursery/noTailwindRawColors` e `nursery/noTailwindRestyledComponents`: disponibili in Biome 2.6.x; valutarle inizialmente come warning per impedire colori di palette arbitrari e override dello stile dei componenti centrali, definendo le eccezioni ammesse prima di trasformarle in gate;
- le regole `nursery` vanno valutate e, se promosse a gate, impostate a `error` esplicito: non sono bloccanti per default e non si abbassano le soglie in caso di errori.
- Stylelint MAY essere aggiunto soltanto se emerge una specifica regola CSS importante non coperta da Biome;
- se Stylelint viene introdotto, definire con precisione quali regole possiede e disattivare i duplicati in Biome;
- non introdurre Prettier per il solo ordinamento delle classi Tailwind.

Le regole del dominio `tailwind` si attivano solo quando Biome rileva `tailwindcss@>=4`; in un progetto senza Tailwind restano inerti. Per `noUnusedClasses` e per le regole Tailwind sui file TSX verifica la configurazione risolta: con `linter.enabled: false` alcune regole project-domain possono non girare; usa gli `overrides` per i file pertinenti o verifica con `biome lint --only=<gruppo>/<regola>`.

Biome è aggiornato rapidamente: le opzioni di configurazione vanno verificate nello schema della versione effettivamente installata, non copiate da una versione precedente.

### 15.2 Altri strumenti

| Scopo | Tool |
|---|---|
| Formatter e lint CSS | Biome |
| Lint TS/JS | Oxlint |
| Typecheck | TypeScript |
| Build CSS/JS | Vite |
| Primitive UI | Base UI |
| Component source registry | shadcn CLI |
| Visual/E2E | Playwright |
| Accessibility audit | `@axe-core/playwright` |
| Component explorer, quando serve | Storybook |
| Analisi bundle, quando serve | Analyzer compatibile con Vite/Rolldown |

### 15.3 Regole da trasformare in gate

Il progetto SHOULD implementare una recipe `just ui-check` o integrare questi controlli nelle recipe esistenti, rispettando il modello del vademecum TypeScript.

Controlli bloccanti:

1. Biome format-check sui file CSS/TSX/TS interessati;
2. Biome lint sui CSS;
3. Oxlint e typecheck sui componenti TSX; per i progetti con UI abilitare il plugin `jsx-a11y` di Oxlint;
4. build di produzione: `just build` è obbligatoria per ogni progetto con `apps/web` ed è integrata in `just prepush` e `just ci`; il gate deve verificare che la build sia realmente eseguita e superata, non solo che la recipe esista;
5. test dei componenti e dei flussi UI modificati;
6. audit axe sui flussi critici selezionati;
7. verifica dei confini di import: le feature importano primitive dal design system e non direttamente da più librerie headless;
8. verifica che non siano state abbassate soglie, aggiunte ignore-list o disabilitati controlli;
9. verifica di dimensione CSS quando è stato fissato un budget.

La policy sui controlli interattivi HTML grezzi e sulle classi dinamiche va codificata con il meccanismo statico più sostenibile: `useTailwindStaticClassStrings` per le classi Tailwind, `jsx-a11y` e le regole disponibili per l'accessibilità, un guard di review per ciò che non è esprimibile in modo affidabile. Non introdurre un linter custom fragile solo per ottenere un gate nominale.

### 15.4 Ratchet

Le soglie di qualità CSS/UI seguono lo stesso principio del vademecum TypeScript:

- la quantità di violazioni accessibilità non deve aumentare;
- il budget CSS non deve degradare senza decisione;
- i controlli devono coprire almeno i flussi critici;
- le eccezioni devono avere proprietario e motivazione;
- le ignore-list non vanno estese per far passare il gate;
- non usare `--no-verify` e non saltare i controlli.

---

## 16. Testing della UI

### 16.1 Test componentistici

Usare Vitest e, quando aggiunge valore ai test comportamentali dei componenti React, Testing Library. Testing Library è MAY: non è obbligatoria per ogni progetto né implica testare ogni componente isolatamente. Se la si usa, serve un progetto Vitest con ambiente DOM (`jsdom` o `happy-dom`), `@testing-library/react` e `@testing-library/user-event`; l'ambiente DOM resta confinato a quel progetto e i test di dominio restano nell'ambiente Node. In questa baseline `apps/web` non ha ancora un progetto DOM e la UI è coperta solo da Playwright, quindi la sezione diventa operativa dopo l'aggiunta di quel progetto.

- stato disabled/loading;
- selezione e interazione;
- apertura/chiusura di menu e dialog;
- errori di validazione;
- accessibilità di nome/ruolo/stato;
- gestione del focus dove significativa.

Non testare classi CSS interne come surrogato del comportamento. Non scrivere test che dipendono da dettagli di implementazione non visibili all'utente.

### 16.2 E2E Playwright

Playwright deve coprire pochi flussi di alto valore, con componenti e pagine reali. Conservare trace, screenshot e log sui fallimenti.

I test SHOULD coprire:

- apertura e chiusura dei principali overlay;
- navigazione keyboard-first;
- form principali, validazione e messaggi di errore;
- responsive dei flussi critici;
- tema chiaro/scuro se supportato;
- stati loading, empty, error e success;
- integrazione frontend/backend lungo i journey essenziali.

### 16.3 Test visuali

MAY usare screenshot comparison per pagine e componenti ad alto valore.

Regole:

- non creare snapshot di ogni elemento e di ogni combinazione possibile;
- fissare browser, viewport, font e dati di test;
- evitare contenuti variabili e animazioni non deterministiche;
- disabilitare/ridurre le animazioni nel contesto dei test visuali;
- revisionare consapevolmente le baseline: non aggiornare gli snapshot soltanto per far passare la CI;
- mantenere le screenshot come evidenza sui fallimenti e nei casi in cui il confronto visivo aggiunge valore.

### 16.4 Accessibilità automatica

Integrare `@axe-core/playwright` sui journey e sulle schermate critiche. Gli audit automatici trovano una parte dei problemi, non sostituiscono la verifica manuale.

È necessario completare i controlli automatici con:

- tab order e focus visibile;
- uso da tastiera;
- zoom;
- contrasto e stati visivi;
- verifica manuale dei contenuti e delle etichette;
- test con tecnologie assistive quando il rischio e il pubblico del prodotto lo richiedono.

---

## 17. Convenzioni visive e modifiche umane

### 17.1 Visual language del prodotto

La direzione visiva è una decisione di prodotto, non una preferenza estemporanea dell'agente.

La PDR/descrizione di prodotto dovrebbe documentare, quando rilevante:

- pubblico e contesto d'uso;
- tono visivo (es. sobrio, editoriale, tecnico, giocoso);
- densità dell'interfaccia;
- gerarchia delle informazioni;
- palette e uso dei colori;
- stile tipografico;
- radius, bordi e ombre;
- comportamento responsive;
- principi di motion;
- esempi di riferimento e anti-riferimenti.

Gli agenti devono studiare l'interfaccia esistente prima di aggiungere nuovi pattern. Non introdurre un look and feel differente per una singola schermata.

### 17.2 Come deve intervenire un umano

Un programmatore umano deve poter rifinire l'interfaccia senza modificare decine di componenti.

Per un intervento visivo globale:

1. modificare i token in `design-system/theme/tokens.css`;
2. verificare light/dark e contrasto;
3. eseguire screenshot dei flussi principali;
4. aggiornare gli snapshot soltanto dopo review intenzionale.

Per modificare un componente condiviso:

1. modificare il componente in `design-system/primitives` o `patterns`;
2. verificare tutte le sue varianti;
3. controllare le feature che lo usano;
4. aggiungere test o screenshot se cambia un comportamento o un aspetto critico.

Per una rifinitura locale:

1. modificare la classe Tailwind del componente feature oppure il relativo CSS Module;
2. non creare un override globale;
3. promuovere la modifica a token/variante solo se diventa riutilizzabile.

### 17.3 Personalizzazioni dei componenti shadcn

I componenti copiati da shadcn sono sorgenti del progetto. Le personalizzazioni sono ammesse, ma devono restare leggibili e coerenti con il componente originale.

- non modificare componenti per risolvere un problema di una singola feature se basta comporli;
- non sovrascrivere a ogni aggiornamento i file customizzati tramite CLI;
- aggiornare un componente tramite confronto diff e revisione manuale;
- documentare le divergenze sostanziali;
- evitare fork locali multipli dello stesso componente.

---

## 18. Guides, Gates e Guards specifici per CSS/UI

### 18.1 Guides

Le guide devono istruire gli agenti a:

- leggere `docs/PROJECT.md`, `docs/INDEX.md`, README del design system e PDR/ADR attive;
- riutilizzare i componenti esistenti;
- usare token semantici;
- usare Base UI attraverso shadcn/design system;
- usare Lucide React;
- non introdurre DaisyUI come seconda libreria di componenti;
- non introdurre nuove dipendenze senza necessità e ADR;
- non inventare classi dinamiche Tailwind;
- non ricostruire primitive interattive;
- verificare la UI su viewport e da tastiera;
- rispettare reduced-motion e contrasto.

### 18.2 Gates

I gate devono bloccare:

- CSS non formattato o lint error;
- TSX non tipizzato o con lint error;
- build fallita;
- classi Tailwind costruite dinamicamente rilevate da `useTailwindStaticClassStrings`;
- violazioni delle regole di architettura;
- test dei flussi critici falliti;
- violazioni di accessibilità sopra la soglia concordata;
- CSS budget degradato oltre la soglia;
- dipendenze non autorizzate o design system paralleli.

### 18.3 Guards

I guard periodici MAY controllare:

- classi/regole CSS non utilizzate;
- crescita del CSS iniziale e totale;
- duplicazioni fra componenti;
- pagine con regressioni visuali;
- violazioni di accessibilità non coperte dagli E2E;
- componenti shadcn divergenti o non aggiornati;
- uso inconsistente dei token;
- dipendenze UI non più utilizzate.

I guard devono creare report e task, non auto-modificare il design system, aggiornare snapshot o committare refactoring autonomamente.

### 18.4 Divieto di aggiramento

È vietato:

- disattivare lint CSS o a11y per far passare una build;
- rimuovere classi o test che evidenziano un problema invece di risolverlo;
- aggiungere ignore-list indiscriminate;
- abbassare il budget CSS o le soglie accessibilità;
- sostituire un componente accessibile con markup improvvisato per accelerare una feature;
- introdurre `!important` o selettori globali per coprire un problema senza capirne la causa;
- aggiornare baseline visuali senza verificare il cambiamento reale.

Quando un gate fallisce ripetutamente, l'agente deve correggere la causa o segnalare il blocco esatto; non deve inventare un workaround.

---

## 19. Workflow operativo degli agenti

### 19.1 Prima di implementare

1. Verificare che i gate del repository siano verdi.
2. Leggere `docs/PROJECT.md`, `docs/INDEX.md`, `AGENTS.md` e il README del design system.
3. Leggere PDR/ADR attive che riguardano UI, layout, accessibilità e componenti.
4. Ispezionare componenti e token già esistenti.
5. Identificare il componente o pattern riutilizzabile più vicino.
6. Se manca, decidere se serve un primitive, un pattern o un componente di feature.
7. Non installare librerie prima di aver dimostrato che quelle già presenti non risolvono il problema.

### 19.2 Durante lo sviluppo

1. Comporre componenti esistenti;
2. introdurre una variante tipizzata se il caso è riutilizzabile;
3. usare utility Tailwind per lo styling standard;
4. usare CSS Module per regole complesse o selectors specifici;
5. mantenere classi Tailwind statiche;
6. verificare stati loading/empty/error/disabled dove applicabili;
7. verificare il comportamento da tastiera;
8. non modificare il visual language senza una decisione di prodotto.

### 19.3 Prima della consegna

Eseguire le recipe pubbliche `just` del repository, non comandi inventati o script alternativi. Nella baseline attuale le recipe rilevanti sono `just build`, `just format-check`, `just lint`, `just typecheck`, `just test-related`, `just test-e2e`, `just smoke`, `just prepush` e `just ci`; `just build` esegue la build di produzione ed è inclusa in `just prepush` e `just ci`. In pratica:

- `just prepush` (o `just ci` per la pipeline completa) copre format, lint, typecheck, architettura, build, test, coverage e smoke;
- `just test-e2e` per i flussi E2E coinvolti;
- audit accessibilità se previsto;
- screenshot review per cambiamenti visivi rilevanti.

Il report finale deve indicare:

1. componenti riutilizzati, creati o modificati;
2. token o varianti aggiunti;
3. eventuali nuove dipendenze e relativa ADR;
4. controlli e comandi effettivamente eseguiti;
5. esito dei test keyboard/accessibility;
6. eventuali screenshot o regressioni visuali rilevanti;
7. rischi o decisioni ancora aperte.

Non dichiarare mai un controllo superato se non è stato eseguito con successo.

---

## 20. Checklist di conformità

### Architettura

- [ ] Il progetto usa un solo design system.
- [ ] I componenti interattivi provengono dal design system.
- [ ] Le feature non importano primitive headless direttamente.
- [ ] Le feature non duplicano logica di componenti condivisi.
- [ ] I componenti sorgente shadcn sono nel repository.
- [ ] Base UI è la base delle primitive per un nuovo progetto.

### Styling

- [ ] Tailwind è usato per lo styling standard.
- [ ] CSS Modules sono circoscritti ai casi in cui migliorano la leggibilità.
- [ ] Non è stato introdotto SCSS senza ADR.
- [ ] Non sono stati introdotti CSS-in-JS runtime senza ADR.
- [ ] Le classi Tailwind sono statiche e rilevabili.
- [ ] Le arbitrary values sono limitate e motivate.
- [ ] Non ci sono override globali o `!important` ingiustificati.

### Design tokens

- [ ] I colori usano token semantici.
- [ ] I token sono centralizzati.
- [ ] Light/dark usano gli stessi token semantici.
- [ ] Radius, font e ombre sono coerenti.
- [ ] Il contrasto è verificato.
- [ ] Un umano può cambiare l'aspetto globale senza modificare ogni feature.

### Icone e librerie

- [ ] È usato Lucide React come unico set standard.
- [ ] Le icone decorative sono nascoste agli screen reader.
- [ ] I controlli icon-only hanno un nome accessibile.
- [ ] DaisyUI non è stato aggiunto come secondo design system.
- [ ] Le librerie ausiliarie sono giustificate da esigenze concrete.

### Accessibilità e responsive

- [ ] Le schermate funzionano su viewport stretti e larghi.
- [ ] La navigazione da tastiera è possibile.
- [ ] Il focus è visibile.
- [ ] I form hanno label e messaggi di errore associati.
- [ ] Gli overlay gestiscono correttamente focus e Escape.
- [ ] `prefers-reduced-motion` è rispettato.
- [ ] Il contrasto soddisfa WCAG 2.2 AA.

### Build e quality gates

- [ ] Biome format/lint CSS passa.
- [ ] Oxlint e typecheck passano.
- [ ] La build di produzione è eseguita e superata (`just build`, inclusa in `just prepush` e `just ci`).
- [ ] Tailwind rileva le classi dei package corretti.
- [ ] Il CSS di produzione è stato controllato quando rilevante.
- [ ] Non sono state abbassate soglie o aggiunte esclusioni ingiustificate.

---

## 21. Decisioni architetturali già adottate da questo vademecum

Le scelte seguenti costituiscono la baseline standard e non vanno riaperte per ogni feature:

| Decisione | Default |
|---|---|
| Modello di styling | Tailwind-first + CSS Modules selettivi |
| Preprocessore | CSS nativo, no SCSS di default |
| Component library | shadcn/ui con codice sorgente nel repository |
| Primitive | Base UI per nuovi progetti |
| DaisyUI | Esclusa dallo stack standard; alternativa separata |
| Icon library | Lucide React |
| Token | CSS custom properties + `@theme inline` |
| Varianti | CVA quando necessarie |
| Merge classi | `cn` della linea corrente shadcn |
| Formatter/linter CSS | Biome |
| CSS build | Tailwind Vite plugin + Vite/Lightning CSS |
| Animazioni semplici | CSS/Tailwind |
| Animazioni complesse | Motion solo su necessità |
| Visual testing | Playwright mirato, no snapshot indiscriminati |
| Accessibilità | WCAG 2.2 AA + test tastiera + axe sui flussi critici |

Una deroga significativa deve essere registrata tramite ADR. Le scelte di linguaggio visivo specifiche di un prodotto devono invece essere documentate nella PDR pertinente.

Queste decisioni valgono per un progetto nuovo o per un progetto che le adotta con un ADR. In un progetto esistente con un design system diverso — come la UI minima attuale del boilerplate — non sono automaticamente retroattive: la migrazione va pianificata, registrata e trattata come un cambiamento separato.

---

## 22. Fonti e documentazione di riferimento

Fonti ufficiali consultate per la baseline del **16 novembre 2026**. Le API e le versioni devono essere riverificate al bootstrap.

### Tailwind CSS

- [Installazione con Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Theme variables e `@theme`](https://tailwindcss.com/docs/theme)
- [Rilevamento delle classi sorgente](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Compatibility e preprocessori](https://tailwindcss.com/docs/compatibility)
- [Funzioni e direttive](https://tailwindcss.com/docs/functions-and-directives)

### shadcn/ui e Base UI

- [Manual installation shadcn/ui](https://ui.shadcn.com/docs/installation/manual)
- [Theming e CSS variables](https://ui.shadcn.com/docs/theming)
- [CLI shadcn: init, add, eject, migrazioni](https://ui.shadcn.com/docs/cli)
- [Dark mode e theme bootstrap](https://ui.shadcn.com/docs/dark-mode)
- [Changelog maggio 2026: `shadcn eject`](https://ui.shadcn.com/docs/changelog/2026-05-shadcn-eject)
- [Changelog luglio 2026: Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- [Changelog settembre 2026: pacchetto `cn`](https://ui.shadcn.com/docs/changelog/2026-09-cn)
- [Base UI: overview](https://base-ui.com/react/overview/about)
- [Base UI: accessibilità](https://base-ui.com/react/overview/accessibility)

### DaisyUI e icone

- [DaisyUI 5 release notes](https://daisyui.com/docs/v5/)
- [DaisyUI: component classes](https://daisyui.com/pages/tailwind-ui-components/)
- [Lucide React](https://lucide.dev/guide/react/)

### CSS moderno e Vite

- [Vite: CSS features e CSS Modules](https://vite.dev/guide/features)
- [Vite: build options e CSS code splitting](https://vite.dev/config/build-options)
- [MDN: CSS cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer)
- [MDN: CSS nesting selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Nesting_selector)
- [MDN: container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN: OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch)
- [MDN: `@scope` (Baseline 2026)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)

### Tooling e testing

- [Biome: supporto linguaggi](https://biomejs.dev/introduction/language-support/)
- [Biome: configurazione](https://biomejs.dev/reference/configuration/)
- [Biome: regole CSS](https://biomejs.dev/linter/css/rules/)
- [Biome: `useTailwindStaticClassStrings`](https://biomejs.dev/linter/rules/use-tailwind-static-class-strings/)
- [Biome: `useTailwindSortedClasses`](https://biomejs.dev/linter/rules/use-tailwind-sorted-classes/)
- [Biome: `noUnusedClasses`](https://biomejs.dev/linter/rules/no-unused-classes/)
- [Playwright: accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Storybook: React + Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Motion for React](https://motion.dev/docs/react)
- [WCAG 2.2](https://www.w3.org/TR/wcag/)

---

**Principio riassuntivo:** una sola lingua visiva, un solo design system, primitive interattive accessibili, Tailwind per lo styling ordinario, CSS nativo per i casi che lo richiedono, token semantici modificabili in un punto, Lucide per le icone e gate automatici. L'agente deve comporre e adattare il sistema esistente, non reinventarlo a ogni schermata.
