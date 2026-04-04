# Phase 2 Kickoff Pack

## Purpose

Use this document to start Phase 2 cleanly with:

- one kickoff message for Claude Code
- one kickoff message for Codex
- one simple merge and rebase routine for parallel work

Read with:

- [phase-2-contract.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-contract.md)
- [phase-2-milestones.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-2-milestones.md)
- [codex-phase-2-checklist.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/codex-phase-2-checklist.md)
- [claude-phase-2-checklist.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/claude-phase-2-checklist.md)

---

## Kickoff Message For Claude Code

```md
You are Claude Code, the UI/UX and frontend engineer for Phase 2 of this project.

Before starting, read and follow these files strictly:

- docs/PRD.md
- docs/SPEC.md
- docs/DESIGN.md
- docs/phase-2-contract.md
- docs/phase-2-milestones.md
- docs/claude-phase-2-checklist.md
- docs/prompts/claude-phase-2-ui-prompt.md

You are working on a separate branch from Codex.

Branch:
- claude/phase-2-ui

Your job is to own the UI lane only:
- app shell
- shared layout surfaces
- onboarding UI
- transactions UI
- settings UI
- dashboard shell
- budget shell
- loading, empty, and error states

You must not:
- implement finance logic
- duplicate schemas
- duplicate formatting helpers
- bypass Codex contracts
- put business logic in components

Start with the milestones in this order:
1. app shell and shared surfaces
2. onboarding UI structure
3. transactions page structure
4. settings page structure
5. dashboard and budget shells

If blocked by a missing contract from Codex:
- do not invent it
- leave a thin seam
- note the dependency clearly

Use the centralized date and formatting helpers already in the repo.
```

---

## Kickoff Message For Codex

```md
You are Codex, the core logic and service-layer engineer for Phase 2 of this project.

Before starting, read and follow these files strictly:

- docs/PRD.md
- docs/SPEC.md
- docs/DESIGN.md
- docs/phase-2-contract.md
- docs/phase-2-milestones.md
- docs/codex-phase-2-checklist.md
- docs/prompts/codex-phase-2-prompt.md

You are working on:
- main

Your job is to own the non-visual logic lane:
- onboarding service logic
- transaction service logic
- settings service logic
- account/category query helpers
- DTO stabilization for UI consumption
- tests for all new logic

You must not:
- do final UI polish
- move business logic into routes/components
- overbuild future phases
- introduce speculative abstractions

Start with the milestones in this order:
1. onboarding service contracts
2. transaction service contracts
3. settings service contracts
4. UI-facing DTO and query helper cleanup

For any shared feature area, define the contract first so Claude can consume it without inventing logic.
```

---

## Suggested Manager Routine

Use this routine while both lanes are active.

### Daily Or Session Start

1. Check `main` status
2. Let Codex continue on `main`
3. Rebase Claude branch onto `main`
4. Review whether a new UI dependency needs a Codex contract first

### When Codex Finishes A Contract

1. Confirm the contract is on `main`
2. Tell Claude exactly which service, schema, or DTO is now ready
3. Have Claude rebase onto `main`
4. Let Claude wire the UI against that contract

### When Claude Finishes A UI Slice

1. Check whether Claude stayed inside the UI-owned files
2. Confirm no business logic was duplicated
3. Merge or cherry-pick if the branch is clean

---

## Simple Rebase Routine For Claude

Run this on Claude’s branch:

```bash
git checkout claude/phase-2-ui
git fetch origin
git rebase origin/main
```

If conflicts appear:

1. Keep Codex-owned service/schema/date/format logic from `main`
2. Keep Claude-owned component/route/layout work from the UI branch
3. If a shared file is messy, extract the contract into a Codex-owned module instead of stuffing logic into UI files

---

## Simple Merge Routine

When a Claude slice is ready:

```bash
git checkout main
git pull origin main
git merge claude/phase-2-ui
```

If you prefer safer incremental integration, cherry-pick only the relevant UI commits after review.

---

## Best First Parallel Start

Use this exact opening split:

### Codex Starts

- onboarding service contracts
- onboarding tests
- transaction service contract planning

### Claude Starts

- app shell
- bottom navigation
- shared card and section patterns
- onboarding page structure without deep logic wiring

This gives both lanes useful work immediately with low conflict risk.

