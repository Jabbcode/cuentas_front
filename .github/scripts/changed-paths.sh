#!/usr/bin/env bash
# changed-paths.sh — ¿el diff entre dos commits toca alguna ruta que matchea?
#
# Uso:
#   changed-paths.sh <base-sha> <head-sha> <regex-ERE>
#
# Resuelve la lista de ficheros cambiados vía
# `gh api repos/{owner}/{repo}/compare/{base}...{head}` y le aplica
# `grep -qE <regex-ERE>`.
#   exit 0  -> al menos un fichero cambiado matchea la regex
#   exit 1  -> ningún fichero matchea (o el rango no cambia ficheros)
#   exit 2  -> error de uso o de la API
#
# El repositorio se toma de $GITHUB_REPOSITORY (siempre presente en Actions) o,
# en su defecto, de `gh repo view`. Requiere: gh autenticado. Avisos por stderr.
# Comparte la detección de "cambio de código" entre release.yml y
# release-preview.yml sin duplicarla.

set -euo pipefail

err() { printf '%s\n' "changed-paths: $*" >&2; }

if [ "$#" -ne 3 ]; then
  err "uso: $0 <base-sha> <head-sha> <regex-ERE>"
  exit 2
fi

base="$1"
head="$2"
regex="$3"

command -v gh >/dev/null || { err "falta 'gh' en el PATH"; exit 2; }

repo="${GITHUB_REPOSITORY:-}"
if [ -z "$repo" ]; then
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner) || {
    err "no se pudo resolver el repositorio"
    exit 2
  }
fi

if ! files=$(gh api "repos/${repo}/compare/${base}...${head}" --jq '.files[].filename' 2>/dev/null); then
  err "gh api compare ${base}...${head} falló"
  exit 2
fi

if printf '%s\n' "$files" | grep -qE "$regex"; then
  exit 0
fi
exit 1
