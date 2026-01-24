#!/bin/bash
# Usage: ./scripts/review-loop.sh [PR_NUMBER]
# Automates the wait-and-read cycle for AI code review feedback

set -e

PR=${1:-$(gh pr view --json number -q .number 2>/dev/null)}

if [ -z "$PR" ]; then
  echo "Error: Could not determine PR number. Please provide it as an argument."
  echo "Usage: ./scripts/review-loop.sh <PR_NUMBER>"
  exit 1
fi

echo "🔄 Watching PR #$PR for review feedback..."

# Push if there are staged changes
if ! git diff --cached --quiet 2>/dev/null; then
  echo "📤 Pushing staged changes..."
  git commit -m "fix: address review feedback" && git push
elif ! git diff --quiet 2>/dev/null; then
  echo "⚠️  You have unstaged changes. Stage them first with 'git add' or commit manually."
fi

# Wait for the Code Review workflow to complete
echo "⏳ Waiting for CI workflows to complete..."
gh run watch --exit-status || true

# Fetch and display the latest review
echo ""
echo "📝 Latest Review Feedback:"
echo "=========================="
gh pr view "$PR" --comments --json comments -q '.comments[-1].body' | head -100

# Show workflow status
echo ""
echo "🔍 Workflow Status:"
gh pr view "$PR" --json statusCheckRollup -q '.statusCheckRollup[] | "\(.state)\t\(.name)"' | column -t
