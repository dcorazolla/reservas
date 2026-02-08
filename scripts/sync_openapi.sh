#!/usr/bin/env bash
set -euo pipefail

# Copies the canonical OpenAPI spec from backend to public for static hosting.
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
SRC="$ROOT_DIR/backend/src/public/openapi.yaml"
DST="$ROOT_DIR/public/openapi.yaml"

if [ ! -f "$SRC" ]; then
  echo "Source OpenAPI not found at $SRC" >&2
  exit 1
fi

mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "Synced $SRC -> $DST"
