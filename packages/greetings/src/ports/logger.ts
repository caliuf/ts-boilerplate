/**
 * Porta di logging del bounded context. I tipi `Logger` e `LogLevel` vivono in
 * `@project/contracts` perché sono parte del linguaggio condiviso dell'ecosistema
 * (adapter, testkit, app). Questo file le riusa per non rompere l'import
 * storico `from "@project/greetings"`.
 */

export type { Logger, LogLevel } from "@project/contracts";
