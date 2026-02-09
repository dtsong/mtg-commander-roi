#!/usr/bin/env bash
# Creates GitHub issues for the UX/UI Comprehensive Overhaul plan.
# Run: bash scripts/create-ux-issues.sh
#
# Handles rate limiting with retries. Safe to re-run — checks for
# existing issues by title prefix before creating duplicates.

set -euo pipefail

DELAY=5  # seconds between API calls to avoid rate limits

gh_create() {
  local attempt=0
  while true; do
    if output=$(gh issue create "$@" 2>&1); then
      echo "$output"
      return 0
    fi
    if echo "$output" | grep -q "429"; then
      attempt=$((attempt + 1))
      if [ $attempt -ge 5 ]; then
        echo "FAILED after 5 retries: $output" >&2
        return 1
      fi
      echo "  Rate limited, waiting $((DELAY * attempt * 2))s (attempt $attempt)..." >&2
      sleep $((DELAY * attempt * 2))
    else
      echo "ERROR: $output" >&2
      return 1
    fi
  done
}

issue_exists() {
  local title_prefix="$1"
  gh issue list --limit 200 --state all --json title -q ".[].title" 2>/dev/null | grep -qF "$title_prefix"
}

# --- Create missing labels ---
echo "=== Creating missing labels ==="
gh label create P3 --description "Priority: Accessibility & Polish" --color "0E8A16" 2>/dev/null || echo "P3 label already exists"
sleep "$DELAY"

# --- Track created issue numbers ---
declare -a ISSUE_NUMS=()

create_issue() {
  local num="$1"
  local title="$2"
  shift 2
  # remaining args are passed to gh issue create

  if issue_exists "$title"; then
    echo "SKIP: '$title' already exists"
    # Grab its number for the epic
    local existing
    existing=$(gh issue list --limit 200 --state all --json number,title -q ".[] | select(.title == \"$title\") | .number" 2>/dev/null | head -1)
    ISSUE_NUMS[$num]="${existing:-?}"
    return 0
  fi

  echo "Creating issue $num: $title"
  local url
  url=$(gh_create --title "$title" "$@")
  local issue_number
  issue_number=$(echo "$url" | grep -o '[0-9]*$')
  ISSUE_NUMS[$num]="$issue_number"
  echo "  -> #$issue_number"
  sleep "$DELAY"
}

echo ""
echo "=== Creating Phase 1 Issues (P0 — Quick Wins) ==="

create_issue 1 "Surface commander card as hero element on home page" \
  --label "ux,P0" \
  --body "$(cat <<'BODY'
## Problem
Commander identity is the #1 purchase signal for MTG players — currently buried in a 100-card flat list. Users must scroll through the entire card list to find the commander.

## Solution
Filter loaded cards for `isCommander: true` and display the commander name/image prominently above or alongside the ROI verdict.

## Implementation
- **Files:** `app/page.tsx`, `components/ROISummary.tsx`
- The `isCommander` flag already exists in the data types (`types/index.ts` line 63)
- Mirror the pattern already used in `app/deck/[id]/DeckContent.tsx` lines 208-219

## Acceptance Criteria
- [ ] Commander card name displayed prominently in the deck analysis view
- [ ] Commander card image visible without scrolling
- [ ] Works for all 98 precon decks (some have partner commanders)
BODY
)"

create_issue 2 "Render TrendingCards component on home page" \
  --label "ux,P0" \
  --body "$(cat <<'BODY'
## Problem
The `TrendingCards` component (`components/TrendingCards.tsx`) is fully built (146 lines) but never rendered on any page. Users have no visibility into trending cards from EDHREC.

## Solution
Import and render `TrendingCards` in the home page sidebar below `DeckSelector`.

## Implementation
- **Files:** `app/page.tsx`
- Import `TrendingCards` from `components/TrendingCards.tsx`
- It shows EDHREC trending cards with links to which precons contain them via `findTrendingInPrecons()` from `lib/trending.ts`

## Acceptance Criteria
- [ ] TrendingCards component visible on home page
- [ ] Trending cards show links to relevant precon decks
- [ ] Component handles loading and empty states gracefully
BODY
)"

create_issue 3 "Add ROI indicator badges to DeckSelector items" \
  --label "ux,data,P0" \
  --body "$(cat <<'BODY'
## Problem
Users must select a deck and wait for data to load before seeing if it has positive ROI. With 98 decks, this creates blind browsing.

## Solution
Load static price data to show small ROI indicator dots/badges on each deck in the sidebar. Green dot = BUY, yellow = HOLD, red = PASS.

## Implementation
- **Files:** `components/DeckSelector.tsx`
- Use `loadStaticPrices()` from `lib/scryfall.ts`
- Use `getROIVerdict()` from `lib/calculations.ts`
- Small colored dot or badge next to each deck name

## Acceptance Criteria
- [ ] Each deck in the selector shows a colored ROI indicator
- [ ] Green = BUY (>15% distro ROI), Yellow = HOLD (0-15%), Red = PASS (<0%)
- [ ] Indicators load from static data (no API calls required)
- [ ] Does not slow down initial page load
BODY
)"

create_issue 4 "Remove duplicate per-page Scryfall attribution footers" \
  --label "ux,P0" \
  --body "$(cat <<'BODY'
## Problem
Three pages render their own inline Scryfall attribution footer in addition to the global `Footer` component, creating redundant attribution text.

## Solution
Remove the inline duplicate footers — the global footer already handles attribution.

## Implementation
- **Files:** `app/page.tsx` (lines 201-212), `app/compare/page.tsx`, `app/deck/[id]/DeckContent.tsx`
- Remove the inline Scryfall attribution sections from each page
- Verify the global `Footer` component includes proper Scryfall attribution

## Acceptance Criteria
- [ ] No duplicate Scryfall attribution visible on any page
- [ ] Global footer still contains proper Scryfall attribution
- [ ] All three pages updated
BODY
)"

create_issue 5 "Replace fixed-height scroll container with progressive card display" \
  --label "ux,P0" \
  --body "$(cat <<'BODY'
## Problem
`max-h-96 overflow-y-auto` (line 65 in CardList.tsx) creates a "scroll within scroll" anti-pattern where users see ~8 cards in a 384px window with 92% of the card list hidden.

## Solution
Remove the fixed-height scroll container. Show first 20 cards by default with a "Show all N cards" expandable button.

## Implementation
- **Files:** `components/CardList.tsx`
- Remove `max-h-96 overflow-y-auto` from the container
- `contentVisibility: 'auto'` already handles render performance
- Add state for expanded/collapsed view
- Show first 20 cards, then "Show all N cards" button

## Acceptance Criteria
- [ ] No nested scroll containers
- [ ] First 20 cards visible without interaction
- [ ] "Show all N cards" button reveals remaining cards
- [ ] Performance remains acceptable with large card lists
BODY
)"

echo ""
echo "=== Creating Phase 2 Issues (P1 — Data Display Cleanliness) ==="

create_issue 6 "Group card list by value tiers with collapsible sections" \
  --label "ux,visual,P1" \
  --body "$(cat <<'BODY'
## Problem
Cards are displayed as a flat, undifferentiated list. 60-70% of precon cards are sub-dollar bulk that creates noise for ROI analysis.

## Solution
Group cards into collapsible tiers with count and subtotals. Add a toggle to hide bulk cards.

## Implementation
- **Files:** `components/CardList.tsx`, `components/CardPriceRow.tsx`
- Tiers: "High Value (>$5)" with count + subtotal, "Medium ($1-5)", "Bulk (<$1)"
- "Hide cards under $1" toggle
- Pin commander card at the top with distinct visual treatment (`border-l-4` in verdict color)
- Uses existing `sortCardsByValue` from `lib/calculations.ts`

## Acceptance Criteria
- [ ] Cards grouped into 3 value tiers with headers showing count and subtotal
- [ ] Each tier is collapsible
- [ ] "Hide bulk" toggle hides cards under $1
- [ ] Commander card pinned at top with visual distinction
BODY
)"

create_issue 7 "Make CardPriceRow expandable with progressive disclosure" \
  --label "ux,visual,P1" \
  --body "$(cat <<'BODY'
## Problem
Each card row shows 10+ elements (name, price, foil price, lowest listing, purchase links, condition info), creating visual noise that makes the list hard to scan.

## Solution
Primary row shows card name + price only (clean, scannable). Click/tap to expand for details.

## Implementation
- **Files:** `components/CardPriceRow.tsx`, `components/PurchaseLinks.tsx`
- Default view: card name + price (2-3 elements)
- Expanded view: foil price, lowest listing, purchase links (TCGplayer + CardMarket), condition info
- Increase `text-[9px]`/`text-[10px]` badges to `text-xs` (12px) minimum for legibility

## Acceptance Criteria
- [ ] Default row shows only card name and price
- [ ] Click/tap expands to show all details
- [ ] Minimum text size is 12px (`text-xs`)
- [ ] Expandable animation is smooth
BODY
)"

create_issue 8 "Add visual hierarchy for high-value vs bulk cards" \
  --label "visual,P1" \
  --body "$(cat <<'BODY'
## Problem
A $50 card and a $0.15 card get identical visual treatment. The current $5 threshold for green text highlights too many cards and dilutes the signal.

## Solution
Add tiered styling based on card value.

## Implementation
- **Files:** `components/CardPriceRow.tsx`
- Cards >$10: `border-l-2 border-green-400`
- Cards >$25: `border-l-4 border-green-500 bg-green-900/10`
- Cards <$1: `opacity-75`
- Adjust or replace the current $5 green text threshold

## Acceptance Criteria
- [ ] High-value cards (>$10, >$25) are visually distinct
- [ ] Bulk cards (<$1) are visually de-emphasized
- [ ] Visual hierarchy is immediately apparent without reading prices
BODY
)"

create_issue 9 "Simplify compare table — remove low-value columns, fix recomputation" \
  --label "ux,performance,P1" \
  --body "$(cat <<'BODY'
## Problem
(1) "Updated" and "Action" columns add clutter without proportional value. (2) Line 171 discards computed metrics (`return result.map(r => r.deck)`) then JSX recomputes them for every row (~400 redundant calculations per render).

## Solution
Clean up columns and fix the performance issue.

## Implementation
- **Files:** `components/DeckComparisonTable.tsx`
1. Remove "Updated" column — move staleness info to a tooltip on the value cell
2. Remove "Action" column — static prices auto-load; move refresh to a row hover action or inline icon
3. **Performance fix:** Return full metric objects from the sort/filter pipeline instead of discarding them at line 171, then use the pre-computed values in JSX
4. Wrap individual table rows in `memo()`

## Acceptance Criteria
- [ ] "Updated" column removed, info available via tooltip
- [ ] "Action" column removed, refresh available on hover
- [ ] Metrics computed once and passed through (no redundant recalculation)
- [ ] Table rows wrapped in `memo()` to prevent unnecessary re-renders
BODY
)"

create_issue 10 "Add value concentration stat and visual bar" \
  --label "ux,visual,data,P1" \
  --body "$(cat <<'BODY'
## Problem
No way to quickly see if a deck's value is concentrated in a few chase cards or spread across many — a key buying signal.

## Solution
Add a "Top 5 cards = X% of total value" stat and a stacked horizontal bar visualization.

## Implementation
- **Files:** `components/ROISummary.tsx`, `components/TopValueCards.tsx`
1. Add "Top 5 cards = X% of total value" stat to `ROISummary` — pass `cards` as additional prop
2. Add a stacked horizontal bar in `TopValueCards`: two flexbox segments (`bg-purple-500` for top cards, `bg-slate-600` for rest)

## Acceptance Criteria
- [ ] "Top 5 cards = X% of total value" displayed in ROI summary
- [ ] Stacked bar visually represents value concentration
- [ ] Works correctly for decks with fewer than 5 valuable cards
BODY
)"

echo ""
echo "=== Creating Phase 3 Issues (P2 — Insight Surfacing) ==="

create_issue 11 "Redesign home page as data-first dashboard landing" \
  --label "ux,visual,P2" \
  --body "$(cat <<'BODY'
## Problem
The home page shows an empty "Select a deck to view ROI analysis" state. Users must make 3-4 selections before seeing any value.

## Solution
Replace the empty state with a data-first landing showing actionable insights immediately.

## Implementation
- **Files:** `app/page.tsx`
1. "Best Value Right Now" — top 3-5 BUY-verdict decks with verdict badge, ROI%, and commander name (computed from static `prices.json`, zero API calls)
2. TrendingCards section (from Issue 2)
3. CTA to Compare page
4. Move CardSearch + BulkImport below the card list (power-user features, not primary flow)
5. On mobile: show ROI analysis first, deck selector second using Tailwind `order` utilities

## Acceptance Criteria
- [ ] Home page shows top BUY-verdict decks on first load
- [ ] No API calls needed for initial landing data
- [ ] Mobile layout prioritizes ROI analysis over deck selector
- [ ] CardSearch and BulkImport accessible but not prominent
BODY
)"

create_issue 12 "Add lowest listing savings summary to deck detail" \
  --label "ux,data,P2" \
  --body "$(cat <<'BODY'
## Problem
Lowest listing data is scattered across individual card rows with no aggregate view. Users can't see the total savings from buying at lowest listings.

## Solution
Compute and display total buyout cost using lowest listings with a savings comparison.

## Implementation
- **Files:** `components/ROISummary.tsx` or new component
- Compute: `cards.reduce((sum, c) => sum + (c.lowestListing ?? c.price ?? 0), 0)`
- Display: "Buy singles at lowest listings: ~$X.XX (save $Y.YY vs market)"
- Position below ROI metrics or in a new summary component

## Acceptance Criteria
- [ ] Total lowest-listing buyout cost displayed
- [ ] Savings vs market price clearly shown
- [ ] Handles cards without lowest listing data gracefully (falls back to market price)
BODY
)"

create_issue 13 "Add price distribution summary bar above card list" \
  --label "ux,visual,data,P2" \
  --body "$(cat <<'BODY'
## Problem
Users have no mental model of value distribution before drilling into individual cards.

## Solution
Add a mini tier bar above the card list showing card count per price tier with proportional colored segments.

## Implementation
- **Files:** `components/CardList.tsx`
- Display: "5 cards >$10 | 12 cards $1-5 | 83 cards <$1"
- Proportional colored segments as a horizontal bar
- Use existing `sortCardsByValue` from `lib/calculations.ts` with threshold-based counting

## Acceptance Criteria
- [ ] Tier bar visible above card list
- [ ] Shows count for each tier (>$10, $1-5, <$1)
- [ ] Proportional colored segments match tier colors
- [ ] Updates when card data changes
BODY
)"

echo ""
echo "=== Creating Phase 4 Issues (P3 — Accessibility & Polish) ==="

create_issue 14 "Accessibility fixes across data display components" \
  --label "accessibility,P3" \
  --body "$(cat <<'BODY'
## Problem
Several components lack proper ARIA attributes and accessibility features.

## Solution
Add appropriate ARIA attributes and accessibility improvements across key components.

## Implementation
- **Files:** `components/DeckComparisonTable.tsx`, `components/CardList.tsx`, `components/ROISummary.tsx`, `app/globals.css`
1. Add `aria-sort` attribute to `SortHeader` component in `DeckComparisonTable.tsx` (lines 19-34)
2. Add `role="region" aria-label="Card list" tabindex="0"` to the scrollable container in `CardList.tsx`
3. Add `aria-live="polite"` to `ROISummary` container for screen reader announcements when data loads
4. Add `prefers-reduced-motion` media query to `globals.css` to disable animations for users who prefer reduced motion

## Acceptance Criteria
- [ ] `aria-sort` on sortable table headers
- [ ] Card list container has proper role and label
- [ ] ROI summary announces updates to screen readers
- [ ] Animations disabled for `prefers-reduced-motion` users
BODY
)"

create_issue 15 "Fix theme token consistency for light mode support" \
  --label "visual,accessibility,P3" \
  --body "$(cat <<'BODY'
## Problem
The theme token system (`--surface-primary`, `--text-primary`, etc.) exists in `globals.css` but most components bypass it with hardcoded `text-white`, `text-slate-400`, `bg-slate-800/50`. Light mode renders invisible text.

## Solution
Systematically replace hardcoded color classes with theme token references.

## Implementation
- **Files:** `components/ROISummary.tsx`, `components/CardPriceRow.tsx`, `components/DeckComparisonTable.tsx`, `components/CardList.tsx`, `components/TopValueCards.tsx`, `components/DeckSelector.tsx`
- Replacements:
  - `text-white` -> `text-[var(--text-primary)]`
  - `text-slate-400` -> `text-[var(--text-secondary)]`
  - `bg-slate-800/50` -> `bg-[var(--card-bg)]`
  - `border-slate-700` -> `border-[var(--surface-border)]`
- Header component correctly uses theme tokens — follow its pattern

## Acceptance Criteria
- [ ] No hardcoded color classes in listed components
- [ ] All components use theme token CSS variables
- [ ] Light mode renders all text legibly
- [ ] No visual regression in dark mode
BODY
)"

create_issue 16 "Add set-level ROI aggregation to compare page" \
  --label "data,ux,P3" \
  --body "$(cat <<'BODY'
## Problem
No way to answer "which set had the best precons?" — users must compare individual decks manually.

## Solution
Pre-compute per-set aggregations and display as collapsible set group headers on the compare page.

## Implementation
- **Files:** `scripts/update-prices.ts`, `app/compare/page.tsx`, `components/DeckComparisonTable.tsx`, `types/index.ts`
- Pre-compute in `prices.json` during nightly `update-prices.ts` run:
  - `avgDistroROI`, `bestDeck`, `worstDeck`, `deckCount`, `buyCount` per set
- Display as collapsible set group headers when a set filter is active
- New type `SetAggregation` in `types/index.ts`
- Extend `StaticPricesData` type

## Acceptance Criteria
- [ ] `SetAggregation` type defined
- [ ] `update-prices.ts` computes per-set aggregations
- [ ] Compare page shows set group headers when filtered by set
- [ ] Group headers are collapsible
- [ ] Shows avgDistroROI, bestDeck, worstDeck per set
BODY
)"

echo ""
echo "=== Creating Epic Issue ==="

# Build the checklist body dynamically
EPIC_BODY="## UX/UI Comprehensive Overhaul

The MTG Commander ROI website helps players evaluate precon deck value by comparing market prices against MSRP. While the data layer is rich (98 decks, trending data, lowest listings, commander flags, foil pricing), the current UI buries key insights behind manual interactions and presents data as flat, undifferentiated lists. Users must make 3-4 selections before seeing any value, and the most actionable data points (trending cards, lowest listings, commander identity) are either hidden or disconnected from the decision flow.

A council of 5 specialized agents (Advocate/UX, Artisan/Visual Design, Architect/Data, Strategist/Prioritization, Tuner/Performance) conducted a comprehensive evaluation. This epic tracks all improvement issues.

---

### Phase 1: Quick Wins (P0)
- [ ] #${ISSUE_NUMS[1]} Surface commander card as hero element on home page
- [ ] #${ISSUE_NUMS[2]} Render TrendingCards component on home page
- [ ] #${ISSUE_NUMS[3]} Add ROI indicator badges to DeckSelector items
- [ ] #${ISSUE_NUMS[4]} Remove duplicate per-page Scryfall attribution footers
- [ ] #${ISSUE_NUMS[5]} Replace fixed-height scroll container with progressive card display

### Phase 2: Data Display Cleanliness (P1)
- [ ] #${ISSUE_NUMS[6]} Group card list by value tiers with collapsible sections
- [ ] #${ISSUE_NUMS[7]} Make CardPriceRow expandable with progressive disclosure
- [ ] #${ISSUE_NUMS[8]} Add visual hierarchy for high-value vs bulk cards
- [ ] #${ISSUE_NUMS[9]} Simplify compare table — remove low-value columns, fix recomputation
- [ ] #${ISSUE_NUMS[10]} Add value concentration stat and visual bar

### Phase 3: Insight Surfacing (P2)
- [ ] #${ISSUE_NUMS[11]} Redesign home page as data-first dashboard landing
- [ ] #${ISSUE_NUMS[12]} Add lowest listing savings summary to deck detail
- [ ] #${ISSUE_NUMS[13]} Add price distribution summary bar above card list

### Phase 4: Accessibility & Polish (P3)
- [ ] #${ISSUE_NUMS[14]} Accessibility fixes across data display components
- [ ] #${ISSUE_NUMS[15]} Fix theme token consistency for light mode support
- [ ] #${ISSUE_NUMS[16]} Add set-level ROI aggregation to compare page
"

create_issue 0 "Epic: UX/UI Comprehensive Overhaul" \
  --label "epic" \
  --body "$EPIC_BODY"

echo ""
echo "=== Summary ==="
echo "Created issues:"
for i in "${!ISSUE_NUMS[@]}"; do
  echo "  Issue $i: #${ISSUE_NUMS[$i]}"
done
echo ""
echo "Done! Verify with: gh issue list --limit 20"
