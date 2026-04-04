# Claude Phase 3 Checklist

## Purpose

This checklist defines the Claude lane for Phase 3.

Use with:

- [phase-3-plan.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/phase-3-plan.md)
- [DESIGN.md](/Users/acedc/Documents/projects/2026/personal-finance-tracker-pwa/docs/DESIGN.md)

---

## Claude Phase 3 Scope

Implement UI for:

- real dashboard cards and sections
- upcoming bills presentation
- budget summaries and over-budget states
- goal progress presentation
- import/export interaction UX

---

## Recommended Order

1. dashboard data-rendering shells
2. budget and goal rendering
3. dashboard composition against the stable DTO
4. import/export UI

---

## Rules

- use Codex DTOs and services
- do not implement forecast, budget, or goal logic in UI code
- keep states calm, readable, and mobile-first
- use centralized date and format helpers only

