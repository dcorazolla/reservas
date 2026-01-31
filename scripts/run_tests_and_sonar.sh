#!/usr/bin/env bash
set -euo pipefail

# Runs backend Unit tests with coverage and then sends results to SonarQube using the sonar-scanner Docker image.
# Usage:
#   SONAR_HOST_URL=http://localhost:9000 SONAR_LOGIN=<token> ./scripts/run_tests_and_sonar.sh

ROOT_DIR="$(pwd)"
BACKEND_COVERAGE_DIR="backend/src/storage/coverage"
mkdir -p "$BACKEND_COVERAGE_DIR"

echo "Running backend Unit tests and generating coverage (clover + text)..."
if docker compose ps --services | grep -q app; then
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml --coverage-text=$BACKEND_COVERAGE_DIR/coverage.txt || test_exit=\$?; exit \${test_exit:-0}"
else
  echo "Warning: docker 'app' container not running. Running phpunit locally..."
  vendor/bin/phpunit --colors=never --testsuite Unit --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml --coverage-text=$BACKEND_COVERAGE_DIR/coverage.txt || true
fi

echo
echo "Coverage summary (backend):"
if [ -f "$BACKEND_COVERAGE_DIR/coverage.txt" ]; then
  sed -n '1,200p' "$BACKEND_COVERAGE_DIR/coverage.txt"
else
  echo "Coverage text report not found at $BACKEND_COVERAGE_DIR/coverage.txt"
fi

echo
echo "Preparing to run Sonar Scanner..."

# Ensure sonar-project.properties exists
if [ ! -f sonar-project.properties ]; then
  echo "sonar-project.properties not found in project root. Aborting sonar-scanner step." >&2
  exit 0
fi

# Use Dockerized sonar-scanner
SONAR_HOST_URL=${SONAR_HOST_URL:-http://localhost:9000}
SONAR_LOGIN=${SONAR_LOGIN:-}

echo "Using Sonar host: $SONAR_HOST_URL"

if [ -z "$SONAR_LOGIN" ]; then
  echo "SONAR_LOGIN not provided. If your SonarQube requires authentication, set SONAR_LOGIN env var. Proceeding without auth (may fail)."
fi

echo "Running sonar-scanner (docker)..."
docker run --rm -e SONAR_HOST_URL="$SONAR_HOST_URL" -e SONAR_LOGIN="$SONAR_LOGIN" -v "$ROOT_DIR":/usr/src -w /usr/src sonarsource/sonar-scanner-cli \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.login="$SONAR_LOGIN" \
  -Dsonar.projectBaseDir=/usr/src || echo "Sonar scan failed or requires authentication; continuing."

echo "Sonar scan completed (or attempted)."
