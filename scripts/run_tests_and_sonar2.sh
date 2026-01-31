#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
BACKEND_COVERAGE_DIR="backend/src/storage/coverage"
mkdir -p "$BACKEND_COVERAGE_DIR"

# Optional knobs for low-spec machines
SCAN_BACKEND_ONLY="${SCAN_BACKEND_ONLY:-true}"   # true|false
GENERATE_HUMAN_REPORTS="${GENERATE_HUMAN_REPORTS:-false}" # true|false

echo "Running backend Unit tests and generating coverage (clover + junit)..."

PHPUNIT_CMD="vendor/bin/phpunit --colors=never --testsuite Unit \
  --coverage-clover=$BACKEND_COVERAGE_DIR/clover.xml \
  --log-junit=$BACKEND_COVERAGE_DIR/junit.xml"

if [ "$GENERATE_HUMAN_REPORTS" = "true" ]; then
  PHPUNIT_CMD="$PHPUNIT_CMD --coverage-text --coverage-html=$BACKEND_COVERAGE_DIR/html"
fi

if docker compose ps --services | grep -q '^app$'; then
  docker compose exec -T app sh -lc "$PHPUNIT_CMD" || true
else
  echo "Warning: docker 'app' container not running. Running phpunit locally..."
  sh -lc "$PHPUNIT_CMD" || true
fi

if [ "$GENERATE_HUMAN_REPORTS" = "true" ]; then
  echo
  echo "Coverage summary (backend):"
  # When running in container, coverage-text prints inside container; if you need it in a file, redirect there.
  echo "Tip: set GENERATE_HUMAN_REPORTS=false to reduce CPU."
fi

echo
echo "Preparing to run Sonar Scanner..."

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

# Wait for SonarQube via container health (no extra containers spawned)
echo "Waiting for SonarQube healthcheck to be healthy..."
for i in $(seq 1 60); do
  STATUS=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' reservas_sonarqube 2>/dev/null || true)
  if [ "$STATUS" = "healthy" ]; then
    echo "SonarQube is healthy."
    break
  fi
  sleep 2
done

echo "Running sonar-scanner (docker) with resource limits..."

SCANNER_ARGS=(
  "-Dsonar.host.url=$TARGET_SONAR_URL"
  "-Dsonar.projectBaseDir=/usr/src"
)

# For low-spec dev machines: override scope to backend only (optional)
if [ "$SCAN_BACKEND_ONLY" = "true" ]; then
  SCANNER_ARGS+=(
    "-Dsonar.sources=backend/src"
    "-Dsonar.tests=backend/src/tests"
    "-Dsonar.exclusions=**/vendor/**,public/**,storage/framework/**,bootstrap/cache/**,backend/src/tests/**"
    "-Dsonar.coverage.exclusions=**/tests/**"
  )
fi

if [ -z "$SONAR_TOKEN" ] && [ -n "${SONAR_USERNAME:-}" ] && [ -n "${SONAR_PASSWORD:-}" ]; then
  echo "Attempting to generate Sonar token via API using provided credentials..."
  TOKEN_JSON=$(docker run --rm $SCANNER_NETWORK curlimages/curl -fsS -u "$SONAR_USERNAME:$SONAR_PASSWORD" \
    -X POST "$TARGET_SONAR_URL/api/user_tokens/generate" -d "name=local-cli-$(date +%s)" || true)
  SONAR_TOKEN=$(printf "%s" "$TOKEN_JSON" | sed -n 's/.*"token":"\([^\"]*\)".*/\1/p')
  if [ -n "$SONAR_TOKEN" ]; then
    echo "Generated temporary token for user $SONAR_USERNAME."
  else
    echo "Could not generate token via API; proceeding without auth."
  fi
fi

if [ -n "$SONAR_TOKEN" ]; then
  SCANNER_ARGS+=("-Dsonar.token=$SONAR_TOKEN")
fi

# Limit scanner CPU/RAM + JVM heap (this is what stops the 200% CPU spike)
docker run --rm $SCANNER_NETWORK \
  --cpus 0.75 --memory 768m \
  -e SONAR_SCANNER_OPTS="-Xmx512m" \
  -v "$ROOT_DIR":/usr/src -w /usr/src \
  sonarsource/sonar-scanner-cli \
  "${SCANNER_ARGS[@]}" || echo "Sonar scan failed; continuing."

echo "Sonar scan completed (or attempted)."
