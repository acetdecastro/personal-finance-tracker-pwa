# Phase 3 Plan

## Purpose

This document prepares Phase 3 before Phase 2 is fully finished.

It is intentionally a **planning and contract-prep document**, not permission to start building everything immediately.

Phase 3 should begin only when the required Phase 2 contracts are stable enough to support:

- dashboard query assembly
- recurring expansion inputs
- budget calculations
- goal progress calculations
- import/export workflows

---

## Why Plan Early

Planning Phase 3 now helps us:

- avoid painting Phase 2 into a corner
- define the next stable DTOs early
- reduce refactors when Claude starts budget/dashboard UI wiring
- keep Codex and Claude aligned on what “next” means

---

## Source Of Truth

Phase 3 planning must follow:

- [PRD.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/PRD.md)
- [SPEC.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/SPEC.md)
- [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md)
- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [phase-2-milestones.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-milestones.md)

---

## Phase 3 Objective

Phase 3 is where the app starts delivering deeper retention value:

- meaningful dashboard data assembly
- recurring expansion for forecast windows
- forecast calculations
- monthly budget calculations
- savings goal progress
- JSON export and import flow foundations

This phase should still stay KISS:

- no advanced analytics
- no speculative charts
- no overbuilt scheduling engine
- no spreadsheet-style complexity

---

## Working Definition Of Phase 3

### Codex Lane

Codex should own:

- recurring occurrence generator
- forecast service
- budget calculation service
- goal progress service
- dashboard query service
- import/export service behavior
- tests for each engine and service

### Claude Lane

Claude should own:

- dashboard data presentation using real DTOs
- budget page data presentation
- goal block presentation
- upcoming bills presentation
- import/export interaction layer
- empty, loading, success, and error states for the new data surfaces

---

## Phase 3 Dependency Gates

Phase 3 should not start in full until these Phase 2 pieces are reasonably stable:

1. onboarding service contract
2. transaction service contract
3. settings service contract
4. account/category option query helpers
5. route and app shell structure stable enough for dashboard/budget/settings screens

Planning can happen now.
Implementation should respect these gates.

---

## Key Output Contracts To Prepare

These are the most important Phase 3 contracts to design around:

### 1. Recurring Occurrence DTO

Needed for forecast assembly.

Should represent:

- originating recurring rule id
- occurrence date
- type
- amount
- category id
- account id
- derived display name

### 2. Budget Snapshot DTO

Needed for budget page and dashboard summary.

Should represent:

- category id
- category name
- budget amount
- spent amount
- remaining amount
- percent used
- over-budget flag

### 3. Goal Snapshot DTO

Needed for dashboard and budget page.

Should represent:

- goal id
- name
- target amount
- current amount
- remaining amount
- percent complete

### 4. Dashboard DTO

Should follow the approved shape from the backend brief and SPEC:

- current balance
- safe to spend
- next salary date
- projected balances
- upcoming bills
- budgets
- goal
- recent transactions

### 5. Import/Export DTO

Should preserve:

- full export payload
- schema version
- app version
- safe validation before import

---

## Recommended Phase 3 Sequence

### Milestone 1

Codex:

- recurring occurrence generator
- recurring occurrence tests

Claude:

- dashboard loading skeletons
- budget and goal presentation shells

### Milestone 2

Codex:

- forecast service
- forecast tests
- next salary and upcoming bills derivation

Claude:

- real dashboard cards consuming forecast-safe DTOs

### Milestone 3

Codex:

- budget calculation service
- goal progress service
- tests for both

Claude:

- budget page data rendering
- goal block rendering
- over-budget and progress states

### Milestone 4

Codex:

- dashboard query service assembly
- dashboard DTO stabilization

Claude:

- final dashboard composition against the stable DTO

### Milestone 5

Codex:

- import/export service
- import validation and replace-flow logic
- tests

Claude:

- import/export UI in settings
- success and failure UX

---

## Ownership Split

### Codex Owns

- `src/services/forecast/**`
- `src/services/import-export/**`
- `src/features/dashboard/services/**`
- `src/features/budgets/services/**`
- `src/features/goals/services/**`
- related schemas, DTOs, and tests

### Claude Owns

- `src/features/dashboard/components/**`
- `src/features/budgets/components/**`
- `src/features/goals/components/**`
- route-level rendering and UI states

### Shared But Contract-Led

- `src/features/dashboard/**`
- `src/features/budgets/**`
- `src/features/goals/**`
- `src/services/import-export/**`

Rule:

- Codex defines contracts first
- Claude consumes and renders them

---

## Important Constraints

### Do

- keep forecast logic pure and isolated
- keep budget logic separate from formatting
- keep dashboard assembly out of JSX
- keep import validation fully safe before any write
- keep tests scenario-based and explicit

### Do Not

- put calculations in hooks or components
- mix formatting with financial calculation logic
- auto-create posted transactions from recurring rules
- overbuild charts or analytics
- introduce speculative abstractions

---

## Ready-To-Start Signal

Phase 3 can be considered ready to actively start when:

- Phase 2 onboarding, transactions, and settings contracts are stable
- Claude no longer needs frequent contract changes for those screens
- Codex can work on pure engines without destabilizing active UI work

