# Domanda

Ok, è il momento di provare ad eseguire il progetto con bun. Scorriti la doc a riguardo e cerca di capire come è stato predisposto il progetto e poi immagina cosa sia necessario per poterlo eseguire ANCHE con bun.
La domanda che ti faccio è: si può "tenere il piede in due staffe" e usare sia bun che node in modo configurabile oppure conviene switchare completamte a bun se questa è la mia intenzione?
Come funzionerebbe? Conviene fare questo passaggio a questo punto o sarebbe meglio prima sviluppare codice vero e poi quando tutto funziona con node fare lo switching?

# Risposta - Sintesi

Runtime configurabile (RUNTIME=node|bun) => Significa due composition root (o adapter di ingresso) per API/CLI/MCP, due modi di servire HTTP (@hono/node-server vs Bun.serve / adapter Hono Bun), test sotto due runtime, e quasi certamente due mondi di dipendenze.

# Risposta

bun-smoke non avvia CLI/API/MCP/web. Fa solo:

parse Zod
sayHello / greet
logger in-memory
È un canarino del core, non un secondo ambiente di sviluppo.

Le superfici girano su Node:

API: node src/main.ts + @hono/node-server
MCP: node src/server.ts
CLI: node apps/cli/src/cli.ts e parseArgs da node:util
just dev / test / coverage / doctor / knip / tsc: tutti Node + pnpm
coverage V8: solo Node (JavaScriptCore di Bun non la dà)
Il passaggio a Bun, per policy, è spike + ADR, non un cambio di comando di avvio. Lo spike deve coprire SDK, subprocess/worker, streaming, tracing, driver DB, crash recovery, integration/E2E, profiling, deploy. Oggi quasi nessuno di questi esiste.

“Piede in due staffe”: due significati diversi
1. Quello che hai già (consigliato)
Node = esecuzione, test, coverage, CI, tooling.
Bun = smoke del core a ogni PR, per non chiudere la porta.

Questo è il dual-runtime economico: un solo package manager (pnpm), un solo lockfile, una sola coverage, un solo engines. Il costo extra è un job CI piccolo e la disciplina architetturale (niente node:* nel dominio).

2. Runtime configurabile (RUNTIME=node|bun)
Significa due composition root (o adapter di ingresso) per API/CLI/MCP, due modi di servire HTTP (@hono/node-server vs Bun.serve / adapter Hono Bun), test sotto due runtime, e quasi certamente due mondi di dipendenze.

Punti di attrito concreti in questo repo:

Package manager. packageManager: pnpm@11.22.0 e pnpm-lock.yaml sono la fonte di verità. Bun ha il suo installer/lockfile. Tenerli entrambi allineati è toil continuo; “configurabile” in pratica diventa “a volte pnpm install, a volte bun install” e i gate si spaccano.
API. serve di @hono/node-server è Node-only. Sotto Bun serve un altro bootstrap. Hono stesso è portabile; l’adapter no.
CLI. node:util.parseArgs è nella shell, quindi accettabile, ma non è “un flag e via”: sotto Bun va verificato o sostituito.
Tooling. Biome, Oxlint, tsc, knip, Playwright, Vitest coverage restano su Node. Anche in un mondo “Bun first” il 70% dei gate resterebbe Node.
Coverage. Non puoi raccogliere V8 sotto Bun. La suite di qualità resterebbe Node comunque.
CI. Oggi un job bun-smoke. Dual full-runtime = matrice (o job duplicati) su integration/E2E, budget tempo, flake surface.
Il vademecum scarta Deno come terzo runtime per lo stesso motivo: costo senza beneficio dimostrato. Dual full Node+Bun è la stessa classe di costo.

Quindi: sì si può, ma non come switch in .env. È una policy di prodotto/architettura (nuova ADR che ridefinisce ADR-0001), con adapter di ingresso per runtime e CI a due binari. Non è “configurabile” nel senso di un flag.

Switch completo a Bun?
Solo se l’intenzione è Bun in produzione, non “provare Bun in locale”.

Anche allora non conviene farlo al posto di Node sul tooling. Lo stack sano, se un giorno Bun vince, è:

Bun come runtime delle app (CLI/API/MCP)
Node (o comunque la toolchain attuale) per typecheck, lint, coverage V8, knip, Playwright
pnpm che resta, oppure migrazione esplicita a bun install con ADR — non entrambi
Bun come sostituto totale di Node+pnpm+Vitest coverage non sta in piedi su questo boilerplate: i gate di qualità dipendono da cose che Bun non copre allo stesso modo.

Ora o dopo il codice vero?
Dopo. Anzi: continua su Node e tieni vivo bun-smoke.

Motivi, in ordine:

Oggi lo spike non misura nulla di difficile. Hello-world + Hono + pino + MCP stdio è il pezzo facile. I fallimenti Bun arrivano con DB, worker, SDK nativi, inspector, node:sqlite, test runner, deploy. Farlo ora ti dà un “funziona” falso.
Il costo di switch è front-loaded. ADR-0001, engines, script start/dev, CI, eventualmente package manager, adapter HTTP. Per un dominio ancora dimostrativo sprechi il momento in cui il repo è pulito senza guadagnare evidenza.
L’architettura c’è apposta per rinviare. Domain/application già senza node:*. Se sviluppi così, lo switch futuro è sostituire composition root e qualche adapter, non riscrivere il prodotto.
Sviluppare “codice vero” su Node non brucia la strada. Brucerebbe solo se iniziassi a spargere node:* nel dominio, Fastify al posto di Hono, o API Node-only nei use case. I gate just arch lo impediscono già.
L’unica cosa utile adesso, se vuoi “provare Bun”, non è lo switch:

lanciare a mano bun run apps/cli/src/cli.ts hello-world
eventualmente allargare bun-smoke a un fetch verso un server Hono avviato con Bun (spike isolato, non ADR di stack)
non sostituire just dev / Vitest / pnpm
Se quegli esperimenti rompono, hai un dato; se passano, non hai ancora il via libera al cambio di runtime.

Raccomandazione
Tieni il piede in due staffe come è disegnato il repo, non come dual-runtime configurabile.

Runtime di lavoro e di produzione: Node 24.
Bun: compatibility suite, pinnato, in CI, mai nel dominio.
Switch completo: solo con spike su superficie reale + ADR che supersede ADR-0001.
Dual configurabile full-stack: no. Raddoppi lockfile, adapter, CI e mental model per un beneficio che questo perimetro non ha.
Se l’intenzione vera è “voglio Bun come runtime delle app”, il momento giusto è quando esiste almeno un adapter I/O non banale (filesystem, DB, subprocess) da spikare. Prima è teatro di compatibilità, e il teatro lo fa già just bun-smoke.