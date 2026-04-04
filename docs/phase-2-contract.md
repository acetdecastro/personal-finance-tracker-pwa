# Phase 2 Contract

## Purpose

This document defines how **Codex** and **Claude Code** work in parallel during Phase 2 without stepping into each other.

Phase 2 goal:

- Codex owns the **core application logic, repositories, services, query-facing contracts, and non-visual feature behavior**
- Claude Code owns the **UI/UX implementation, page composition, forms presentation, layout, and component structure**

This contract is intended to reduce merge conflicts, avoid duplicate business logic, and keep the project moving in parallel.

---

## Branch Strategy

### Codex

- Works on: `main`
- Owns the core logic lane

### Claude Code

- Works on: a dedicated UI branch
- Recommended branch name: `claude/phase-2-ui`

### Merge order

1. Codex lands contract-safe core changes first when a dependency is needed by UI.
2. Claude rebases regularly on `main`.
3. Claude avoids editing Codex-owned files unless the contract explicitly allows it.
4. If both lanes need the same file, Codex defines the contract shape first, then Claude integrates against it.

---

## Source Of Truth

Both agents must follow:

- [PRD.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/PRD.md)
- [SPEC.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/SPEC.md)
- [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md)
- [codex-backend-brief.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/codex-backend-brief.md)
- [claude-ui-brief.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/claude-ui-brief.md)

Shared date contract:

- Date only: `MMM dd ''yy`
- Date and time: `MMM dd ''yy, hh:mm a`
- Centralized in [date-format.ts](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/src/lib/constants/date-format.ts)

---

## Ownership Split

### Codex Owns

- `src/types/**`
- `src/db/**`
- `src/services/**`
- `src/lib/dates/**`
- `src/lib/format/**`
- `src/lib/utils/**` when logic-focused
- `src/features/*/schemas/**`
- `src/features/*/services/**`
- `src/features/*/tests/**`
- TanStack Query query orchestration when introduced
- Repository contracts and service return shapes

### Claude Code Owns

- `src/components/**`
- `src/routes/**`
- `src/features/*/components/**`
- `src/features/*/hooks/**` when UI-facing
- page composition and layout files
- form presentation and interaction states
- empty, loading, and error states
- app shell and navigation UX
- styling and responsive behavior

### Shared But Contract-Led

These areas may be touched by both, but Codex defines the non-visual contract first:

- `src/app/providers.tsx`
- `src/features/onboarding/**`
- `src/features/dashboard/**`
- `src/features/transactions/**`
- `src/features/budgets/**`
- `src/features/settings/**`
- `src/services/import-export/**`

Rule:

- Codex owns data shape, validation, persistence, and service behavior
- Claude owns rendering, interaction flow, and component structure

---

## File Editing Rules

### Claude Must Not

- implement finance calculations in components
- duplicate Zod schemas in UI-only files
- read Dexie directly from page components
- add repository logic inside hooks
- reformat or restructure Codex-owned logic files without need

### Codex Must Not

- do final page polish
- redesign page hierarchy inside UI files unless required for a contract fix
- add speculative presentational components

### Both Must

- preserve the centralized date helpers
- keep Zustand as UI state only
- avoid inline business rules in JSX
- prefer adding small explicit modules over giant shared abstractions

---

## Phase 2 Work Split

### Codex Phase 2 Lane

Codex should implement:

- repository expansion where Phase 2 UI needs real reads and writes
- onboarding application services
- transaction create, update, delete service logic
- settings service logic
- category and account query helpers
- import/export service foundations if needed by UI shell
- query-facing DTOs that UI can consume safely
- tests for all new service logic

Codex should still defer:

- forecast engine
- dashboard assembly logic beyond minimal placeholders unless explicitly scheduled
- advanced budget engine
- goal progress engine beyond necessary simple data plumbing

### Claude Code Phase 2 Lane

Claude should implement:

- onboarding screens and flow UX
- dashboard placeholder layout wired to available contracts only
- transactions page UI and transaction entry form
- budget page UI shell
- settings page UI shell
- shared app shell, headers, bottom navigation, cards, form UI, and empty states
- loading and error presentation for future query/mutation hooks

Claude should not:

- invent business logic contracts
- bypass Codex services and schemas
- create alternative date or currency formatting logic

---

## Safe Integration Boundary

Codex should expose stable functions and types that Claude can consume.

Examples:

- `createTransactionInputSchema`
- `transactionRepository`
- `accountRepository`
- `categoryRepository`
- `userSettingsRepository`
- future query DTOs in `src/types/dto.ts`
- shared date helpers from `src/lib/dates`
- shared format helpers from `src/lib/format`

Claude should consume these boundaries rather than rebuilding validation or formatting locally.

---

## Recommended Coordination Sequence

### Step 1

Codex defines any missing service/query contracts required by the next UI surface.

### Step 2

Claude builds the screen and interaction layer against those contracts.

### Step 3

Codex fills in deeper behavior under the same contract if the screen needs real functionality.

### Step 4

Claude refines UX states without changing business rules.

This keeps the data contract stable while allowing UI work to continue.

---

## Conflict Avoidance Checklist

Before either lane starts work on a feature:

1. Confirm who owns the target files.
2. Confirm whether a service or DTO contract already exists.
3. If a contract does not exist, Codex defines it first.
4. Claude builds against the contract, not assumptions.
5. Rebase Claude’s branch frequently onto `main`.

---

## Suggested Phase 2 Milestone Definition

Phase 2 is successful if:

- the app shell is visually usable on mobile
- onboarding UI is implemented against real foundational contracts
- transaction entry UI is implemented against real validation and persistence boundaries
- settings UI is wired to real settings data boundaries
- no finance/business logic is duplicated in UI files
- merging Claude’s branch into `main` is low-conflict

---

## Handoff Notes

If a file becomes contentious, prefer this resolution:

1. Codex extracts the shared non-visual contract into a service, schema, DTO, or helper.
2. Claude consumes that extracted contract from UI code.
3. The previously shared file becomes thinner and easier to merge.

When in doubt:

- Codex owns truth
- Claude owns presentation

