#!/usr/bin/env bash
set -eo pipefail
# Generate simple release notes for the frontend package.
# Usage: ./scripts/generate_release_notes.sh

# Move to frontend root
cd "$(dirname "$0")/.."

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -n "${LAST_TAG}" ]; then
  RANGE="${LAST_TAG}..HEAD"
else
  RANGE="HEAD"
fi

OUTFILE="RELEASE_NOTES.md"
HEADER="## Release - $(date +%F)"

echo "# Frontend Release Notes" > "$OUTFILE.tmp"
echo "" >> "$OUTFILE.tmp"
echo "$HEADER" >> "$OUTFILE.tmp"
echo "" >> "$OUTFILE.tmp"

# Append commits in the range
if [ "$RANGE" = "HEAD" ]; then
  git log -n 30 --pretty=format:'- %s (%an)' >> "$OUTFILE.tmp" || true
else
  git log "$RANGE" --pretty=format:'- %s (%an)' >> "$OUTFILE.tmp" || true
fi

mv "$OUTFILE.tmp" "$OUTFILE"

echo "Generated $OUTFILE"

exit 0
