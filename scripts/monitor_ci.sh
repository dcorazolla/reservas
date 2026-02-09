#!/usr/bin/env bash
set -euo pipefail

sha=$(git rev-parse HEAD)
repo="dcorazolla/reservas"
# Use current branch name so the script works when run from feature branches or locally.
branch=$(git rev-parse --abbrev-ref HEAD)

INTERVAL=${1:-15}
MAX_CHECKS=${2:-120} # default ~30 minutes of polling

echo "Monitoring PR for branch '$branch' (commit $sha) in $repo..."

if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
  echo "GH CLI missing or not authenticated. Please install GitHub CLI and run 'gh auth login'." >&2
  exit 2
fi

echo "gh CLI found and authenticated. Looking for open PR for branch '$branch'..."

# Find the open PR for this branch (if multiple, pick the most recent)
pr_json=$(gh pr list --repo "$repo" --head "$branch" --state open --json number,headRefName,headSha,createdAt --jq 'sort_by(.createdAt) | reverse | .[0]' 2>/dev/null || echo "")
if [ -z "$pr_json" ] || [ "$pr_json" = "null" ]; then
  echo "No open PR found for branch '$branch'. Exiting." >&2
  exit 3
fi

pr_number=$(echo "$pr_json" | jq -r .number)
pr_head_sha=$(echo "$pr_json" | jq -r .headSha)
echo "Found PR #$pr_number with head SHA $pr_head_sha"

checks=0
while [ $checks -lt $MAX_CHECKS ]; do
  echo "[poll #$checks] Checking workflow runs for SHA $pr_head_sha..."

  # Get recent runs for the branch and filter by headSha
  runs_json=$(gh run list --repo "$repo" --branch "$branch" --limit 100 --json headSha,id,status,conclusion,html_url,workflowName 2>/dev/null || echo '[]')
  matching_runs=$(echo "$runs_json" | jq -c --arg sha "$pr_head_sha" 'map(select(.headSha==$sha)) | sort_by(.id) | reverse')

  if [ "$matching_runs" != "[]" ]; then
    # iterate runs and check conclusions
    all_completed=true
    any_failed=false
    failed_run_ids=()
    success_count=0

    # iterate each run object
    for run in $(echo "$matching_runs" | jq -c '.[]'); do
      run_id=$(echo "$run" | jq -r .id)
      run_status=$(gh run view "$run_id" --repo "$repo" --json status --jq .status 2>/dev/null || echo "")
      run_conclusion=$(gh run view "$run_id" --repo "$repo" --json conclusion --jq .conclusion 2>/dev/null || echo "")
      run_url=$(echo "$run" | jq -r .html_url)
      echo "  run $run_id status=$run_status conclusion=$run_conclusion url=$run_url"
      if [ "$run_status" != "completed" ]; then
        all_completed=false
      fi
      if [ "$run_conclusion" = "failure" ] || [ "$run_conclusion" = "cancelled" ] || [ "$run_conclusion" = "timed_out" ]; then
        any_failed=true
        failed_run_ids+=("$run_id")
      fi
      if [ "$run_conclusion" = "success" ]; then
        success_count=$((success_count+1))
      fi
    done

    if [ "$all_completed" = true ]; then
      if [ "$any_failed" = true ]; then
        echo "Detected failing workflow runs for PR #$pr_number: ${failed_run_ids[*]}"
        mkdir -p artifacts/pr_${pr_number}
        for rid in "${failed_run_ids[@]}"; do
          echo "Downloading artifacts and logs for run $rid..."
          gh run download "$rid" --repo "$repo" --dir "artifacts/pr_${pr_number}/run_${rid}" || true
          echo "Run page: https://github.com/$repo/actions/runs/$rid"
          echo "==== Begin logs for run $rid ===="
          gh run view "$rid" --repo "$repo" --log || true
          echo "==== End logs for run $rid ===="
        done
        echo "PR #$pr_number has failing checks. Not merging. Exiting with code 1." >&2
        exit 1
      else
        echo "All workflow runs for PR #$pr_number succeeded. Merging PR..."
        # Merge PR and delete branch
        if gh pr merge "$pr_number" --repo "$repo" --merge --delete-branch --body "Merged by monitor script after CI passed."; then
          echo "PR #$pr_number merged successfully."
          exit 0
        else
          echo "Failed to merge PR #$pr_number via gh CLI." >&2
          exit 4
        fi
      fi
    else
      echo "Not all runs completed yet. Waiting..."
    fi
  else
    echo "No workflow runs found yet for SHA $pr_head_sha"
  fi

  checks=$((checks+1))
  sleep $INTERVAL
done

echo "Timed out waiting for workflow runs to complete for PR #$pr_number (SHA $pr_head_sha)." >&2
exit 3
