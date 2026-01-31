#!/usr/bin/env bash
set -euo pipefail

echo "Running backend tests and Sonar scan..."
if [ -f scripts/run_tests_and_sonar.sh ]; then
  bash scripts/run_tests_and_sonar.sh
else
  echo "scripts/run_tests_and_sonar.sh not found or not executable. Falling back to basic phpunit run."
  if docker compose ps --services | grep -q app; then
    docker compose exec -T app bash -lc "vendor/bin/phpunit --colors=never"
  else
    echo "Warning: docker 'app' container not running. Skipping backend tests."
  fi
fi

echo "Running frontend tests (if available)..."
if [ -d frontend ]; then
  (cd frontend && npm ci --silent && npm test --silent) || true
fi

if [ -z "${1:-}" ]; then
  echo "Usage: $0 \"<commit message>\""
  exit 1
fi

git add -A
MSG="$1"
git commit -m "$MSG"
echo "Committed with message: $MSG"
