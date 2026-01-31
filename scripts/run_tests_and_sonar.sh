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
  # 1) Clover para Sonar
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml" || true
  # 2) Texto legível por humano (redireciona stdout)
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-text" > "$BACKEND_COVERAGE_DIR/coverage.txt" || true
  # 3) HTML opcional
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-html=$BACKEND_COVERAGE_DIR/html" || true
else
  echo "Warning: docker 'app' container not running. Running phpunit locally..."
  vendor/bin/phpunit --colors=never --testsuite Unit --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml || true
  vendor/bin/phpunit --colors=never --testsuite Unit --coverage-text > "$BACKEND_COVERAGE_DIR/coverage.txt" || true
  vendor/bin/phpunit --colors=never --testsuite Unit --coverage-html=$BACKEND_COVERAGE_DIR/html || true
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
SONAR_HOST_URL=${SONAR_HOST_URL:-}
SONAR_LOGIN=${SONAR_LOGIN:-}

# Try to detect compose network via the running SonarQube container
SCANNER_NETWORK=""
if docker ps --format '{{.Names}}' | grep -q '^reservas_sonarqube$'; then
  NET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{printf "%s" $k}}{{end}}' reservas_sonarqube 2>/dev/null || true)
  if [ -n "$NET" ]; then
    SCANNER_NETWORK="--network $NET"
  fi
fi

# Decide target URL: prefer service name if on same network, else fallback to localhost
if [ -z "$SONAR_HOST_URL" ]; then
  if [ -n "$SCANNER_NETWORK" ]; then
    TARGET_SONAR_URL="http://sonarqube:9000"
  else
    TARGET_SONAR_URL="http://localhost:9000"
  fi
else
  TARGET_SONAR_URL="$SONAR_HOST_URL"
fi

echo "Using Sonar host: $TARGET_SONAR_URL"

# Wait for SonarQube to be UP (up to ~60s)
echo "Waiting for SonarQube to be UP..."
for i in $(seq 1 30); do
  if docker run --rm $SCANNER_NETWORK curlimages/curl -fsS "$TARGET_SONAR_URL/api/system/status" | grep -q 'UP' 2>/dev/null; then
    echo "SonarQube is UP."
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "SonarQube not UP after waiting. Proceeding anyway."
  fi
done

echo "Running sonar-scanner (docker)..."
SCANNER_ARGS=("-Dsonar.host.url=$TARGET_SONAR_URL" "-Dsonar.projectBaseDir=/usr/src")
if [ -n "$SONAR_LOGIN" ]; then
  SCANNER_ARGS+=("-Dsonar.login=$SONAR_LOGIN")
fi

docker run --rm $SCANNER_NETWORK -v "$ROOT_DIR":/usr/src -w /usr/src sonarsource/sonar-scanner-cli \
  "${SCANNER_ARGS[@]}" || echo "Sonar scan failed (server down or auth required); continuing."

echo "Sonar scan completed (or attempted)."
