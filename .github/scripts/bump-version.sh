#!/usr/bin/env bash
# bump-version.sh — calcula la siguiente versión semver.
#
# Uso:
#   bump-version.sh <version-actual> <patch|minor|major>
#
# Imprime la nueva versión (X.Y.Z) por stdout. Errores y avisos por stderr.
# Sin dependencias externas — pensado para usarse desde release.yml y
# release-preview.yml sin duplicar la lógica de bump en cada workflow.

set -euo pipefail

err() { printf '%s\n' "bump-version: $*" >&2; }

if [ "$#" -ne 2 ]; then
  err "uso: $0 <version-actual> <patch|minor|major>"
  exit 1
fi

current="$1"
bump="$2"

if ! printf '%s' "$current" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  err "la versión actual no es semver válida: '$current'"
  exit 1
fi

IFS='.' read -r major minor patch <<<"$current"

case "$bump" in
  major) major=$((major + 1)); minor=0; patch=0 ;;
  minor) minor=$((minor + 1)); patch=0 ;;
  patch) patch=$((patch + 1)) ;;
  *)
    err "tipo de bump no reconocido: '$bump' (esperado: patch|minor|major)"
    exit 1
    ;;
esac

printf '%s.%s.%s\n' "$major" "$minor" "$patch"
