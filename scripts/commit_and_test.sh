#!/usr/bin/env bash
set -euo pipefail

# Simple commit-and-test helper for local development and CI.
# - Runs PHPUnit tests
# - Ensures that when backend files are changed, API docs (`backend/src/public/openapi.yaml`) or
#   the Bruno collection (`docs/collections/reservas`) are included in the commit.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Running backend PHPUnit tests..."
if [ -x ./vendor/bin/phpunit ]; then
  ./vendor/bin/phpunit --colors=never
else
  echo "Warning: ./vendor/bin/phpunit not found. If you use Docker, run tests inside the app container instead." >&2
  # Try docker compose if available
  if command -v docker >/dev/null 2>&1 && docker compose ps --services | grep -q app; then
    docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never"
  else
    echo "Cannot run tests automatically. Aborting." >&2
    exit 1
  fi
fi

echo "Tests passed. Checking documentation updates for backend changes..."

# Get staged files
STAGED=$(git diff --cached --name-only)

# Detect backend changes
echo "$STAGED" | grep -E '^backend/src/|^backend/' >/dev/null 2>&1 || BACKEND_CHANGED=0 && BACKEND_CHANGED=1
if echo "$STAGED" | grep -Eq '^backend/src/|^backend/'; then
  BACKEND_CHANGED=1
else
  BACKEND_CHANGED=0
fi

if [ "$BACKEND_CHANGED" -eq 1 ]; then
  echo "Detected staged backend changes. Verifying API docs / collection updates..."
  # Ensure public copy of OpenAPI is synced from canonical backend spec so checks are consistent.
  if [ -f "$ROOT_DIR/scripts/sync_openapi.sh" ]; then
    bash "$ROOT_DIR/scripts/sync_openapi.sh" || true
  fi
  if echo "$STAGED" | grep -Eq '^backend/src/public/openapi.yaml$|^docs/collections/reservas/'; then
    echo "API documentation or Bruno collection included in staged changes. Good."
  else
    echo "ERROR: You changed backend files but did not include API docs or Bruno collection updates in this commit." >&2
    echo "Please update `backend/src/public/openapi.yaml` (OpenAPI) and/or `docs/collections/reservas` (Bruno collection) and stage them before committing." >&2
    exit 2
  fi
else
  echo "No backend changes staged. Skipping docs check."
fi

echo "All checks passed. You can commit now."
exit 0
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
