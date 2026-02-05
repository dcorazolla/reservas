#!/usr/bin/env bash
set -euo pipefail

echo "Running backend tests..."
php -dpcov.enabled=1 backend/src/vendor/bin/phpunit -c backend/src/phpunit.xml --testdox

echo "Running frontend tests..."
(cd frontend && npm test -- --run)

echo "All tests passed."
