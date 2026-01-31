#!/usr/bin/env bash
set -euo pipefail

# This script is the original Sonar integration utility.
# It has been moved out of the main scripts folder to an opt-in location.
# Usage (opt-in):
#   SONAR_HOST_URL=http://localhost:9000 SONAR_LOGIN=<token> ./scripts/optional/run_tests_and_sonar.sh

ROOT_DIR="$(pwd)"
BACKEND_COVERAGE_DIR="backend/src/storage/coverage"
mkdir -p "$BACKEND_COVERAGE_DIR"

echo "Running backend Unit tests and generating coverage (clover + text)..."
if docker compose ps --services | grep -q app; then
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml --log-junit=$BACKEND_COVERAGE_DIR/junit.xml" || true
  docker compose exec -T app sh -lc "vendor/bin/phpunit --colors=never --testsuite Unit --coverage-text" > "$BACKEND_COVERAGE_DIR/coverage.txt" || true
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

# The Sonar scanning parts follow here (unchanged from original):

echo
echo "Preparing to run Sonar Scanner..."

# Ensure sonar-project.properties exists
if [ ! -f sonar-project.properties ]; then
  echo "sonar-project.properties not found in project root. Aborting sonar-scanner step." >&2
  exit 0
fi

SONAR_HOST_URL=${SONAR_HOST_URL:-}
SONAR_TOKEN=${SONAR_TOKEN:-}

SCANNER_NETWORK=""
if docker ps --format '{{.Names}}' | grep -q '^reservas_sonarqube$'; then
  NET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{printf "%s" $k}}{{end}}' reservas_sonarqube 2>/dev/null || true)
  if [ -n "$NET" ]; then
    SCANNER_NETWORK="--network $NET"
  fi
fi

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
if [ -z "$SONAR_TOKEN" ] && [ -n "${SONAR_USERNAME:-}" ] && [ -n "${SONAR_PASSWORD:-}" ]; then
  echo "Attempting to generate Sonar token via API using provided credentials..."
  TOKEN_JSON=$(docker run --rm $SCANNER_NETWORK curlimages/curl -fsS -u "$SONAR_USERNAME:$SONAR_PASSWORD" -X POST "$TARGET_SONAR_URL/api/user_tokens/generate" -d "name=local-cli-$(date +%s)" || true)
  SONAR_TOKEN=$(printf "%s" "$TOKEN_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  if [ -n "$SONAR_TOKEN" ]; then
    echo "Generated temporary token for user $SONAR_USERNAME."
  else
    echo "Could not generate token via API; proceeding without auth."
  fi
fi

if [ -n "$SONAR_TOKEN" ]; then
  SCANNER_ARGS+=("-Dsonar.token=$SONAR_TOKEN")
fi

docker run --rm $SCANNER_NETWORK -v "$ROOT_DIR":/usr/src -w /usr/src sonarsource/sonar-scanner-cli \
  "${SCANNER_ARGS[@]}" || echo "Sonar scan failed (server down or auth required); continuing."

echo "Sonar scan completed (or attempted)."
