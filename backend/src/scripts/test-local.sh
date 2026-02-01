#!/usr/bin/env bash
set -euo pipefail

# Test runner helper for local development.
# Tries to run PHPUnit with phpdbg (preferred), then with PCOV, otherwise falls back to plain PHPUnit.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CD="cd "$ROOT_DIR"/src || exit 1"

echo "Running tests in $ROOT_DIR/src"
cd "$ROOT_DIR/src"

if command -v phpdbg >/dev/null 2>&1; then
  echo "Found phpdbg — running tests with coverage via phpdbg"
  phpdbg -qrr ./vendor/bin/phpunit -c phpunit.xml --coverage-clover=clover.xml
  exit $?
fi

echo "phpdbg not found. Trying PCOV..."
PHP=$(command -v php || true)
if [ -n "$PHP" ]; then
  if php -m 2>/dev/null | grep -qi pcov; then
    echo "PCOV extension present — running tests with PCOV"
    php -dpcov.enabled=1 ./vendor/bin/phpunit -c phpunit.xml --coverage-clover=clover.xml
    exit $?
  fi
fi

echo "No coverage driver available — running tests without coverage"
./vendor/bin/phpunit -c phpunit.xml
