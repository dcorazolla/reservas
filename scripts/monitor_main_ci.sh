#!/usr/bin/env bash
# Monitor GitHub Actions runs for 'main' branch and report failing jobs.
# Usage: ./scripts/monitor_main_ci.sh [interval_seconds] [max_checks]

INTERVAL=${1:-30}
MAX=${2:-60}
REPO=dcorazolla/reservas

echo "Monitoring workflow runs for branch 'main' in $REPO (interval=${INTERVAL}s, max=${MAX})"
for i in $(seq 1 $MAX); do
  echo "Check #$i..."
  # get the latest workflow runs for the default branch
  runs=$(gh api -H "Accept: application/vnd.github+json" /repos/$REPO/actions/runs --jq '.workflow_runs[] | select(.head_branch=="main") | {id: .id, status: .status, conclusion: .conclusion, html_url: .html_url, name: .name}' )
  if [ -z "$runs" ]; then
    echo "No workflow runs found for 'main'"
  else
    echo "$runs" | jq -s '.'
    # show any non-success conclusions
    fails=$(gh api -H "Accept: application/vnd.github+json" /repos/$REPO/actions/runs --jq '.workflow_runs[] | select(.head_branch=="main" and .conclusion!="success") | {id: .id, status:.status, conclusion:.conclusion, html_url:.html_url, name:.name}')
    if [ -n "$fails" ]; then
      echo "Found non-successful runs:" ; echo "$fails" | jq -s '.'
      exit 1
    fi
  fi
  sleep $INTERVAL
done

echo "Monitoring finished (no failing runs detected during checks)."
exit 0
