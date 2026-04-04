# Phase 2 Milestones

## Purpose

This document sequences Phase 2 so **Codex** and **Claude Code** can work in parallel with minimal blocking and minimal merge conflict risk.

Read with:

- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [codex-phase-2-checklist.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/codex-phase-2-checklist.md)
- [claude-phase-2-checklist.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/claude-phase-2-checklist.md)

---

## Guiding Rule

When a screen needs a real contract:

1. Codex defines the contract first
2. Claude consumes the contract second
3. Neither side re-implements the other side’s responsibility

---

## Milestone 1: App Shell And Surface Contracts

### Codex

- Confirm stable shared formatting and date helpers
- Keep route-safe data contracts stable
- Expose any tiny app bootstrap reads if needed

### Claude

- Build the shared app shell
- Build mobile bottom navigation
- Build page container patterns
- Build reusable card, section, and empty-state surfaces
- Establish the layout language for dashboard, transactions, budget, and settings

### Dependency Level

Low.

Claude can start most of this immediately.

---

## Milestone 2: Onboarding Contracts First, Then Onboarding UI

### Codex First

- Define onboarding service contracts
- Support:
  - create primary account
  - create salary recurring rule
  - optional recurring fixed expenses
  - minimum buffer update
  - mark onboarding complete
- Add onboarding DTOs if needed for initial/default values
- Add service tests

### Claude Second

- Build onboarding page flow
- Build onboarding step UX
- Build form presentation using Codex schemas/contracts
- Add loading, success, and error states
- Keep flow short and mobile-friendly

### Dependency Level

Medium.

Claude can design the flow structure early, but should wire deeply only after Codex defines the onboarding contract.

---

## Milestone 3: Transaction Contracts First, Then Transaction UI

### Codex First

- Define transaction service layer
- Support:
  - create transaction
  - update transaction
  - delete transaction
  - list transactions
  - read account and category options for forms
- Add tests for transaction service behavior
- Add any transaction form option DTOs if useful

### Claude Second

- Build transactions page UI
- Build transaction list presentation
- Build add/edit transaction form UX
- Build empty state, loading state, and validation feedback
- Use Codex contracts and shared formatting helpers

### Dependency Level

High.

This is the first feature where deep UI wiring should follow the Codex contract closely.

---

## Milestone 4: Settings Contracts First, Then Settings UI

### Codex First

- Define settings read/update service behavior
- Support:
  - read settings
  - update minimum buffer
  - update theme
  - expose stable settings screen DTO if needed
- Add tests

### Claude Second

- Build settings page shell
- Build settings forms and controls
- Add save, loading, and error states
- Preserve the calm and low-friction interaction style

### Dependency Level

Medium.

Claude can prepare layout early, but real settings interactions should wait for Codex contracts.

---

## Milestone 5: Budget And Dashboard Shells

### Codex

- Expose only the minimal read contracts needed for placeholder-safe UI
- Do not overbuild forecast, dashboard assembly, or advanced budget logic yet unless explicitly scheduled

### Claude

- Build dashboard shell layout using current placeholder-safe contracts
- Build budget page shell and placeholder sections
- Focus on hierarchy, structure, empty states, and responsive composition

### Dependency Level

Low to medium.

This milestone can proceed with partial contracts as long as Claude does not invent business logic.

---

## Milestone 6: Merge Stabilization

### Codex

- Review all exported service and DTO names for clarity
- Keep contracts explicit and well-located
- Avoid late refactors in UI-owned files

### Claude

- Rebase on `main`
- Keep UI files isolated to the UI lane
- Resolve any shallow integration seams without moving business logic into components

### Shared Outcome

- Claude branch is low-conflict to merge
- UI uses Codex contracts instead of duplicating them

---

## Recommended Start Order

If both lanes begin at the same time, use this order:

1. Claude starts app shell and shared surfaces
2. Codex starts onboarding contracts
3. Claude builds onboarding UI once onboarding contracts land
4. Codex starts transaction contracts
5. Claude builds transactions UI once transaction contracts land
6. Codex starts settings contracts
7. Claude builds settings UI once settings contracts land
8. Claude builds dashboard and budget shells against available contracts

---

## Quick Parallel Plan

### Codex Immediate Start

- onboarding service contracts
- onboarding tests
- transaction service contract planning

### Claude Immediate Start

- app shell
- bottom nav
- shared cards and page sections
- onboarding page structure without final wiring

This is the best early overlap with the lowest chance of conflict.

