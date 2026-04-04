# Codex Phase 3 Checklist

## Purpose

This checklist defines the Codex lane for Phase 3.

Use with:

- [phase-3-plan.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-3-plan.md)
- [codex-backend-brief.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/prompts/codex-backend-brief.md)

---

## Codex Phase 3 Scope

Implement:

- recurring occurrence generator
- forecast service
- budget service
- goal service
- dashboard query service
- import/export service
- tests for all of the above

---

## Recommended Order

1. recurring occurrence generator
2. forecast service
3. budget service
4. goal service
5. dashboard query service
6. import/export service

---

## Required Outputs

- stable recurring occurrence DTO
- stable budget snapshot DTO
- stable goal snapshot DTO
- stable dashboard DTO
- stable import/export validation behavior

---

## Rules

- keep business logic pure and testable
- keep services small and explicit
- do not move calculation logic into hooks or components
- do not overbuild beyond the approved MVP logic

