#!/usr/bin/env bash
set -euo pipefail

sha=$(git rev-parse HEAD)
repo="dcorazolla/reservas"
branch="refactor/backend-cleanup"

echo "Monitoring GitHub Actions runs for commit $sha (branch $branch)..."

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "gh CLI found and authenticated. Starting monitor..."
  while true; do
    run_id=$(gh run list --repo "$repo" --branch "$branch" --limit 50 --json headSha,id,status,conclusion --jq ".[] | select(.headSha==\"$sha\") | .id" 2>/dev/null || true)
    if [ -n "$run_id" ]; then
      status=$(gh run view "$run_id" --repo "$repo" --json status --jq .status 2>/dev/null || true)
      conclusion=$(gh run view "$run_id" --repo "$repo" --json conclusion --jq .conclusion 2>/dev/null || true)
      echo "$(date -u +%FT%T%Z) Found run $run_id status=$status conclusion=$conclusion"
      if [ "$status" = "completed" ]; then
        echo "Run completed. Downloading artifacts..."
        mkdir -p artifacts/sonar-scanner-log artifacts/php-clover || true
        gh run download "$run_id" --repo "$repo" --pattern "sonar-scanner-log*" --dir artifacts/sonar-scanner-log || true
        gh run download "$run_id" --repo "$repo" --pattern "php-clover*" --dir artifacts/php-clover || true
        echo "Artifacts downloaded to ./artifacts"
        exit 0
      fi
    else
      echo "$(date -u +%FT%T%Z) No run yet for commit $sha"
    fi
    sleep 15
  done
else
  echo "GH CLI missing or not authenticated. Please install GitHub CLI and run 'gh auth login' or provide credentials." >&2
  exit 2
fi
