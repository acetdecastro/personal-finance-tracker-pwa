# Claude Code Phase 2 Prompt

You are **Claude Code**, the UI/UX and frontend implementation partner for Phase 2 of the **Personal Finance Tracker PWA**.

You are working in parallel with **Codex**.

Codex is working on `main` and owns:

- business logic
- repositories
- Zod schemas
- Dexie persistence
- service contracts
- DTOs
- non-visual rules

You are working on a separate branch and own:

- app shell
- page layout
- responsive/mobile UX
- form presentation
- shared UI components
- route-level rendering
- loading, empty, and error states

You must follow:

- [PRD.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/PRD.md)
- [SPEC.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/SPEC.md)
- [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md)
- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [claude-ui-brief.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/claude-ui-brief.md)

## Non-negotiable rules

1. Do not implement finance or forecasting rules in components.
2. Do not create duplicate schemas or duplicate formatting logic.
3. Use Codex-owned contracts where they already exist.
4. Keep Zustand for UI state only.
5. Keep the app mobile-first.
6. Preserve the “Financial Sanctuary” design direction.

## Shared formatting contract

Use the centralized helpers and constants already in the repo.

- Date only format: `MMM dd ''yy`
- Date and time format: `MMM dd ''yy, hh:mm a`

Do not introduce `MM/DD/YYYY`, `YYYY-MM-DD`, or other date display styles in the UI.

## Your Phase 2 scope

Implement the UI and UX for:

- onboarding flow
- dashboard shell and layout
- transactions page
- budget page shell
- settings page shell
- shared app shell
- bottom navigation
- page sections
- empty states
- loading states
- mobile-friendly form layouts

## Your file ownership

Prefer edits in:

- `src/routes/**`
- `src/components/**`
- `src/features/*/components/**`
- `src/features/*/hooks/**` for UI-facing hooks only

Avoid editing unless absolutely necessary:

- `src/types/**`
- `src/db/**`
- `src/services/**`
- `src/features/*/schemas/**`
- `src/features/*/services/**`
- `src/lib/dates/**`
- `src/lib/format/**`

If a UI feature is blocked by a missing contract:

- do not invent the logic
- leave a thin adapter seam
- note the dependency clearly

## Implementation priorities

1. Make the app shell feel production-ready on mobile.
2. Make onboarding feel fast, short, and calm.
3. Make transaction entry feel friction-light and obvious.
4. Keep dashboard hierarchy focused on the most important money signals.
5. Use Codex contracts instead of rebuilding logic in hooks or components.

## Design expectations

Follow [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md):

- Manrope typography direction
- tonal layering over borders
- calm dark visual system
- strong numeric readability
- no spreadsheet feeling
- no generic template dashboard look

## Deliverable expectation

Ship a clean Phase 2 UI lane that can merge into `main` with minimal conflict because:

- UI files stay in the UI lane
- business logic stays in Codex’s lane
- contracts are consumed, not reinvented

