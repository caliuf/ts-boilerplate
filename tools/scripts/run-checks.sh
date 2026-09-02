#!/usr/bin/env bash
# run-checks.sh — esegue una lista ordinata di comandi di gate.
#
# Con GNU parallel installato i comandi girano in parallelo (uno slot per core),
# ma stdout/stderr restano raggruppati per comando e stampati nell'ordine
# originale della lista (--keep-order), non in ordine di completamento: l'output
# è identico a una esecuzione sequenziale. Senza GNU parallel i comandi girano
# in sequenza, nello stesso ordine: il tool è un'accelerazione opzionale, non un
# prerequisito (non è pinnabile via mise).
#
# Fail-late: TUTTI i comandi girano sempre, anche dopo un fallimento
# (--halt never), così un singolo giro mostra ogni problema invece di richiedere
# un rerun per ogni errore. Lo script esce non-zero se almeno un comando ha
# fallito (con parallel: il numero di job falliti; in sequenza: 1).
#
# Colori: il buffering di parallel toglie il TTY ai job, quindi di default
# perderebbero i colori. Su terminale interattivo la wrapper esporta
# FORCE_COLOR=1, JUST_COLOR=always (echo dei just annidati) e
# RUN_CHECKS_COLORS=1 (le recipe la usano per i flag dedicati dei tool che
# ignorano FORCE_COLOR, es. biome --colors=force, tsc --pretty). Se NO_COLOR è
# settata (anche vuota) o l'output non è un terminale (agenti, redirect su
# file), l'output resta plain: meno ANSI, meno token.
#
# Carico: sulla macchina di sviluppo principale (whoami = caio) i comandi
# girano sotto nice -n 19 per non saturare la workstation quando vengono
# lanciati in parallelo. In CI l'utente non è mai caio, quindi niente nice.
#
# Uso:
#   tools/scripts/run-checks.sh "just format-check" "just lint" ...
#
# Escape hatch: RUN_CHECKS_SEQUENTIAL=1 forza il percorso sequenziale anche se
# GNU parallel è installato (debug, macchine con poca RAM/CPU).
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: run-checks.sh <command> [<command>...]" >&2
  exit 64
fi

# exec 2>&1 in testa a ogni job: parallel bufferizza stdout e stderr in blocchi
# separati; fonderli dentro la shell del job mantiene l'interleaving originale
# di ogni comando (un "2>&1" in coda si legherebbe solo all'ultimo comando).
if [ -n "${NO_COLOR+x}" ] || [ ! -t 1 ]; then
  # Plain richiesto esplicitamente (NO_COLOR) oppure output non interattivo.
  export NO_COLOR=1
  unset FORCE_COLOR
elif [ -z "${FORCE_COLOR+x}" ]; then
  export FORCE_COLOR=1
  export JUST_COLOR=always
  export RUN_CHECKS_COLORS=1
fi

nice_cmd=()
if [ "$(whoami)" = "caio" ]; then
  # 19 è la massima "niceness" valida; valori superiori vengono comunque
  # tagliati a 19 da GNU nice.
  nice_cmd=(nice -n 19)
fi

if [ "${RUN_CHECKS_SEQUENTIAL:-0}" != "1" ] && command -v parallel >/dev/null 2>&1; then
  parallel --no-notice --keep-order --halt never --jobs 0 "${nice_cmd[@]}" bash -c ::: "${@/#/exec 2>&1; }"
else
  rc=0
  for cmd in "$@"; do
    "${nice_cmd[@]}" bash -c "$cmd" 2>&1 || rc=1
  done
  exit "$rc"
fi
