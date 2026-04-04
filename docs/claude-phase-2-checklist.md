# Claude Phase 2 Checklist

## Purpose

This checklist defines the **Claude Code lane** for Phase 2 so it stays synchronized with:

- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [phase-2-milestones.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-milestones.md)
- [claude-phase-2-ui-prompt.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/claude-phase-2-ui-prompt.md)

Claude owns the **UI and UX lane**.

---

## Phase 2 Objective

Deliver the mobile-first UI/UX implementation for Phase 2 while consuming Codex-owned contracts instead of recreating business rules in the frontend.

Focus on:

- app shell
- onboarding UI
- transactions UI
- settings UI
- dashboard shell
- budget shell
- shared component patterns
- loading, empty, and error states

---

## File Ownership

Claude should prefer edits in:

- `src/routes/**`
- `src/components/**`
- `src/features/*/components/**`
- `src/features/*/hooks/**` when UI-facing

Claude should avoid editing unless necessary:

- `src/types/**`
- `src/db/**`
- `src/services/**`
- `src/features/*/schemas/**`
- `src/features/*/services/**`
- `src/lib/dates/**`
- `src/lib/format/**`

If blocked by a missing contract:

- do not invent it in UI code
- leave a thin seam
- note the dependency clearly

---

## Phase 2 Deliverables

### 1. Shared App Shell

Build:

- main app shell
- mobile bottom navigation
- page container pattern
- shared section/card surfaces
- consistent spacing and hierarchy

### 2. Onboarding UI

Build:

- onboarding route UX
- step or section flow
- account setup UI
- salary setup UI
- recurring expense setup UI
- minimum buffer UI
- finish state

Rules:

- keep it short
- keep it calm
- keep it mobile-first
- use Codex contracts for real validation and submission

### 3. Transactions UI

Build:

- transactions list screen
- add transaction flow
- edit transaction flow
- empty state
- validation state
- save and error feedback

Rules:

- fast entry is the priority
- no business rules in components
- use shared date and format helpers

### 4. Settings UI

Build:

- settings page shell
- minimum buffer controls
- theme controls
- future-friendly settings sections

### 5. Dashboard Shell

Build:

- calm dashboard layout
- hierarchy for current balance and safe-to-spend areas
- sections for future Phase 3+ data
- loading and empty placeholders

Do not invent forecast logic.

### 6. Budget Shell

Build:

- page shell
- section structure
- empty states
- placeholder-safe containers for future budget data

Do not implement budget calculations.

---

## Design Rules

Follow:

- [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md)
- [mobile-ui-rules.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/skills/mobile-ui-rules.md)
- [card-and-surface-rules.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/skills/card-and-surface-rules.md)
- [theme-rules.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/skills/theme-rules.md)

Key reminders:

- use tonal layering over visible borders
- keep the interface calm and professional
- prioritize numeric readability
- avoid generic dashboard templates
- do not let the app feel cluttered

---

## Contract Rules

Claude should use:

- Codex schemas for validation boundaries
- Codex services and DTOs when they exist
- centralized date helpers
- centralized currency and number format helpers

Claude should not:

- create duplicate data formatting helpers
- create duplicate Zod schemas for persisted entities
- access Dexie directly in route or component code
- place finance logic in JSX

---

## Recommended Implementation Order

1. Build shared app shell and core layout surfaces
2. Build onboarding page structure
3. Wire onboarding UI to Codex contracts once available
4. Build transactions page structure
5. Wire transactions UI to Codex contracts once available
6. Build settings page structure
7. Wire settings UI to Codex contracts once available
8. Build dashboard and budget shells against available contracts

---

## Definition Of Done For Claude Phase 2 Lane

Claude Phase 2 lane is done when:

- the app shell is solid on mobile
- onboarding UI is implemented and ready to consume real contracts
- transaction entry and list UI are implemented cleanly
- settings UI is implemented cleanly
- dashboard and budget shells are structurally ready
- no business logic is duplicated in UI code
- the UI branch is low-conflict to merge into `main`

