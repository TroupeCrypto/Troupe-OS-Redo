# Troupe OS Redo

Next.js App Router experience for the Troupe Inc. control surface. The interface is organized into sections for command, creative studio, publishing workspace, reading view, analytics, health, money, notes/history, and system status.

## Features (through Step 5)
- Auth gate with session persistence (local storage) and role-based modes (Founder, Creative, Finance, Health, Public).
- Today / Command center with focus, obligations, and scratchpad controls.
- Creative Studio with sessions, publishing planner/editor, and reading view.
- Money snapshot and daily ledger.
- Health & energy tracking.
- Notes and history viewer.
- Analytics panel plus new Publishing Summary dashboard (Step 5) showing publishing telemetry from the publishing store.
- System diagnostics and audit log.
- Founder-only Family Business page (separate tab) for private capital, ledger, atlas, and audit controls.

## New in Step 5
- Added `components/PublishingSummaryPanel.jsx` to present publishing counts, status, and domain breakdowns using `usePublishingStore`.
- Surfaced the publishing summary within the Analytics section of `app/page.jsx` and fixed the Today banner border class.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

## Testing & Linting
Run linting (may surface existing warnings unrelated to Step 5):
```bash
npm run lint
```

## Notes
- Data is local-only today; publishing and other panels use client-side state.
- The Publishing Summary panel is additive and non-destructive; prior sections remain intact.
