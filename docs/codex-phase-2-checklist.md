# Codex Phase 2 Checklist

## Purpose

This checklist defines the **Codex lane** for Phase 2 so it stays synchronized with:

- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [codex-backend-brief.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/codex-backend-brief.md)
- [claude-phase-2-ui-prompt.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/claude-phase-2-ui-prompt.md)

Codex owns the **non-visual logic lane**.

---

## Phase 2 Objective

Deliver the next layer of app-ready business foundations so Claude Code can build UI against real contracts without inventing logic in components.

Phase 2 should focus on:

- onboarding service logic
- transaction service logic
- settings service logic
- read/query helpers for UI consumption
- stable DTOs and service return shapes
- tests for all new behavior

Phase 2 should not yet expand into:

- full forecast engine
- dashboard intelligence engine
- advanced budget engine
- goal progress engine beyond minimal plumbing
- speculative abstraction layers

---

## File Ownership

Codex should prefer edits in:

- `src/types/**`
- `src/db/**`
- `src/services/**`
- `src/lib/dates/**`
- `src/lib/format/**`
- `src/lib/utils/**`
- `src/features/*/schemas/**`
- `src/features/*/services/**`
- `src/features/*/tests/**`

Codex should avoid UI-first files unless required for a contract seam:

- `src/routes/**`
- `src/components/**`
- `src/features/*/components/**`
- `src/features/*/hooks/**` when purely presentational or UI-facing

---

## Phase 2 Deliverables

### 1. Onboarding Core

Implement the non-visual onboarding foundation:

- create primary account flow support
- create salary recurring rule support
- optional recurring fixed expense persistence support
- minimum buffer settings update support
- onboarding completion update support

Suggested shape:

- onboarding service modules under `src/features/onboarding/services/`
- input validation should reuse feature schemas
- logic should remain UI-independent

### 2. Transactions Core

Implement transaction behavior needed by UI:

- create transaction
- update transaction
- delete transaction
- list transactions in a UI-friendly order
- basic account/category lookup helpers for transaction forms

Suggested shape:

- transaction application service separate from raw repository
- keep repository focused on persistence, not orchestration

### 3. Settings Core

Implement settings behavior needed by UI:

- read current settings
- update theme setting
- update minimum buffer
- expose a stable settings DTO if useful

### 4. Account And Category Read Contracts

Expose read helpers that Claude can use safely:

- active accounts list
- income categories list
- expense categories list
- seeded/default category availability

### 5. DTO Stabilization

Add or refine DTOs only where the UI lane needs a stable contract.

Likely useful:

- onboarding bootstrap DTO
- transaction form options DTO
- settings screen DTO

Do not add speculative dashboard DTOs beyond what is immediately needed.

### 6. Tests

Add tests for:

- onboarding setup paths
- transaction create/update/delete behavior
- settings updates
- query helper outputs
- any service-level invariants introduced in Phase 2

---

## Recommended Implementation Order

1. Define missing DTOs in `src/types/dto.ts`
2. Add service-layer modules for onboarding, transactions, and settings
3. Add thin query/read helpers for accounts, categories, and settings
4. Add tests for each service before or during implementation
5. Only then expose anything UI-facing that Claude should consume

---

## Service Boundary Rules

### Repositories

Repositories should:

- read and write Dexie
- validate persisted entity shapes
- stay small and explicit

Repositories should not:

- assemble UI-facing view models
- contain feature orchestration across multiple entities unless truly required

### Application Services

Application services should:

- coordinate multiple repositories where needed
- enforce workflow-level invariants
- return stable DTOs or validated results

Application services should not:

- know about JSX, components, or visual concerns

### Query Helpers

Query helpers should:

- return UI-safe data shapes
- centralize sorting/filtering needed by screens
- remain deterministic and testable

---

## Claude Dependency Targets

Codex should try to hand Claude these stable building blocks:

- onboarding setup service
- transaction mutation service
- transaction form options reader
- settings reader/updater
- account/category option readers
- centralized date and format helpers

If one of these is missing, Codex should define it before Claude builds that screen deeply.

---

## Merge Safety Rules

Before changing a shared feature area:

1. Confirm whether the change belongs in `services/`, `schemas/`, or `dto.ts`
2. Prefer extracting a contract instead of editing UI files directly
3. Keep route or component changes minimal and only when required to unblock a contract seam
4. Communicate any new DTO or service name clearly so Claude can consume it

---

## Definition Of Done For Codex Phase 2 Lane

Codex Phase 2 lane is done when:

- onboarding has real non-visual support
- transactions have real service-layer behavior
- settings have real read/write service support
- the UI lane has stable DTOs and query helpers to consume
- tests cover all new service behavior
- no business logic is duplicated in UI files

