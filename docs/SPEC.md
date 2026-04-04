# SPEC Document — Personal Finance Tracker PWA

Version: 1.0
Date: April 4, 2026
Status: Ready for implementation
Based on: Approved PRD for Personal Finance Tracker PWA

---

# 1. Document Purpose

This SPEC translates the approved PRD into an implementation-ready plan for development.

It is written for two AI-assisted development roles:

- **Codex** — backend/core logic/data layer engineer
- **Claude Code** — frontend/UI/UX engineer

This SPEC must remain aligned with the PRD and follow these development principles:

- **Clean Code**
- **KISS**
- **Red-Green TDD**
- **Mobile-first**
- **Single-user local-first MVP**
- **Fast shipping over overengineering**

---

# 2. Product Summary

## Product name

Working title: **Personal Finance Tracker PWA**

## Product type

A mobile-first Progressive Web App for personal finance tracking with:

- quick manual transaction logging
- recurring salary and fixed expense modeling
- dashboard look-ahead forecasting
- budgets
- savings goal tracking
- JSON export/import

## Primary user

A single personal user who wants:

- low-friction logging
- awareness of current financial position
- forward-looking cash visibility
- professional and informative UI

---

# 3. MVP Objective

Ship a working MVP by **April 5, 2026, 12:00 noon**.

## MVP success criteria

The app is considered shipped if the user can:

1. install/open the PWA on phone
2. set up salary, accounts, and recurring fixed expenses
3. add/edit/delete transactions
4. view dashboard with current balance and forward-looking figures
5. set category budgets
6. set one savings goal
7. export and import data as JSON

---

# 4. Technical Stack

## Core stack

- **Vite**
- **React**
- **TypeScript**
- **TailwindCSS v4**
- **TanStack Query**
- **TanStack Router**
- **TanStack Form**
- **Zustand**
- **Dexie.js**
- **vite-plugin-pwa**
- **Zod**
- **date-fns**
- **clsx** (https://www.npmjs.com/package/clsx)
- **lucide-react**
- **eslint**
- **prettier**
- **prettier-plugin-tailwindcss**

## Architecture role assignment

### Dexie.js

Persistent local database and source of truth.

### TanStack Query

Read abstraction, cached query states, invalidation, derived data orchestration.

### TanStack Router

Used for file based routing

Reference: https://tanstack.com/router/v1/docs/routing/file-based-routing

### TanStack Form

TanStack Form supports Zod-based validation through standard-schema validation

Reference: https://tanstack.com/form/latest

### Zustand

Ephemeral UI state only.

Examples:

- modal open/close
- theme
- selected filters
- onboarding step state
- draft form state if necessary

### Important rule

**Zustand must never become a second database.**
Persisted finance data belongs in Dexie.

---

# 5. Development Principles

## 5.1 KISS

Do not build for speculative future complexity.
Every feature must justify its existence in the MVP.

## 5.2 Clean Code

- small focused modules
- explicit naming
- minimal shared mutable state
- pure business logic where possible
- no giant god components
- no giant utility dumping grounds

## 5.3 TDD — Red, Green, Refactor

All core business logic should follow:

1. write failing test
2. implement smallest working solution
3. refactor without breaking behavior

TDD is mandatory for:

- forecast calculations
- balance calculations
- budget calculations
- recurring schedule calculations
- import/export validation
- repository/service layer logic

TDD is recommended for:

- custom hooks with meaningful logic
- state transitions in onboarding/setup

TDD is not required for:

- purely visual styling
- static layout code

---

# 6. Team Role Split

# 6.1 Codex Responsibilities

Codex owns the non-visual product core.

### Codex scope

- Dexie schema
- repositories/data access
- transaction CRUD logic
- recurring rule engine
- forecast engine
- balance calculation engine
- budget engine
- goal progress calculation
- JSON export/import service
- Zod schemas and validation
- unit tests for all core logic
- query functions consumed by frontend

### Codex should NOT own

- detailed visual styling
- final UI polish
- animations
- layout aesthetics
- visual hierarchy decisions

---

# 6.2 Claude Code Responsibilities

Claude Code owns the UI/UX implementation.

### Claude scope

- route/page composition
- mobile-first layouts
- dashboard information hierarchy
- forms and interaction flows
- empty states
- loading states
- install prompt UX
- visual consistency
- typography and spacing system
- quick-add UX
- accessibility-minded interaction design

### Claude should NOT own

- business rules that change finance calculations
- forecast logic design
- schema decisions without alignment to Codex layer
- hidden derived logic scattered inside components

---

# 6.3 Shared Contract

Both agents must align on shared interfaces.

These should be defined early:

- domain types
- DTOs
- query result shapes
- form input schemas
- page-level data requirements

---

# 7. High-Level Architecture

Use a simple layered architecture.

## Recommended layers

1. **UI Layer**
2. **Hooks / Query Layer**
3. **Application Services / Use Cases**
4. **Repository Layer**
5. **Dexie Persistence Layer**

---

## 7.1 Architecture Rules

### Rule 1

UI components do not directly perform raw Dexie logic.

### Rule 2

Business logic must live in pure functions or application services.

### Rule 3

Formatting logic and calculation logic must stay separate.

### Rule 4

Derived dashboard metrics should come from selectors/services, not JSX.

### Rule 5

Every non-trivial calculation should be testable without rendering UI.

---

# 8. Project Structure

Recommended structure:

```txt
src/
  app/
    router.tsx
    providers.tsx
  components/
    common/
    dashboard/
    transactions/
    budget/
    goals/
    settings/
    layout/
  features/
    accounts/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
    budgets/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
    dashboard/
      components/
      hooks/
      services/
      tests/
      types.ts
    goals/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
    recurring/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
    settings/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
    transactions/
      components/
      hooks/
      services/
      schemas/
      tests/
      types.ts
  db/
    dexie.ts
    tables/
    migrations/
  lib/
    dates/
    format/
    utils/
    constants/
  services/
    forecast/
    import-export/
    seed/
  stores/
    ui-store.ts
    filters-store.ts
  types/
    domain.ts
    dto.ts
  test/
    setup.ts
```

## Notes

- Keep `services/forecast` pure and isolated
- Avoid deeply nested abstraction unless it clearly improves maintainability
- Prefer feature grouping over type grouping for UI-facing code

---

# 9. Domain Model

This aligns directly with the PRD.

## 9.1 Account

Represents where money is stored.

```ts
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "other";
  initialBalance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## 9.2 Category

Represents expense or income category.

```ts
type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## 9.3 Transaction

Represents actual posted financial activity.

```ts
type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  categoryId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  accountId: string | null;
  note: string | null;
  transactionDate: string;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## Notes

For MVP, you may simplify transfer handling if needed.

Two valid approaches:

- include transfer support properly
- cut transfer from first release if it threatens deadline

Since PRD marked transfer lower than core balance/forecast value, it may be deferred.

---

## 9.4 Recurring Rule

Represents future modeled events like salary or fixed bills.

```ts
type RecurringRule = {
  id: string;
  name: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  accountId: string;
  cadence: "weekly" | "semi-monthly" | "monthly" | "custom";
  semiMonthlyDays: number[] | null;
  monthlyDay: number | null;
  weeklyInterval: number | null;
  nextOccurrenceDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## Important MVP simplification

For MVP, support these only:

- salary recurring rule
- fixed recurring expenses

Do not overbuild cron-like recurrence complexity.

---

## 9.5 Budget

```ts
type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  periodType: "monthly";
  createdAt: string;
  updatedAt: string;
};
```

## MVP note

Only monthly budget is required for MVP.

---

## 9.6 Savings Goal

```ts
type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## MVP simplification

Support one active goal in UI, but schema can allow multiple goals.

---

## 9.7 User Settings

```ts
type UserSettings = {
  id: "primary";
  currency: "PHP";
  minimumBuffer: number;
  theme: "light" | "dark" | "system";
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

# 10. Dexie Schema

## 10.1 Tables

Recommended Dexie tables:

- accounts
- categories
- transactions
- recurringRules
- budgets
- goals
- userSettings

## 10.2 Suggested schema

```ts
db.version(1).stores({
  accounts: "id, name, type, isArchived, createdAt, updatedAt",
  categories: "id, name, type, isSystem, createdAt, updatedAt",
  transactions:
    "id, type, categoryId, accountId, transactionDate, recurringRuleId, createdAt, updatedAt",
  recurringRules:
    "id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt",
  budgets: "id, categoryId, periodType, createdAt, updatedAt",
  goals: "id, createdAt, updatedAt",
  userSettings: "id, createdAt, updatedAt",
});
```

## 10.3 Storage rule

All persisted monetary records live in Dexie.

---

# 11. Routing

Use TanStack File based routing. Keep routing minimal.

## Required routes

```txt
/
  -> redirect to /dashboard or /onboarding

/onboarding
/dashboard
/transactions
/budget
/settings
```

## Optional route

```txt
/goals
```

If goals can fit inside budget page, keep goals out of top-level routing.

---

# 12. Page Specifications

# 12.1 Onboarding Page

## Purpose

Allow user to begin quickly without excessive friction.

## Required inputs

- primary salary amount
- salary cadence
- next salary date
- at least one account
- optional recurring fixed expenses
- optional minimum buffer

## UX rules

- short, step-based or single long form
- must not feel like enterprise onboarding
- user can skip non-essential setup
- should take under 2 minutes

## MVP sections

1. Welcome
2. Add primary account
3. Add salary rule
4. Add recurring expenses
5. Finish and go to dashboard

## Acceptance criteria

- onboarding creates required base records
- user can finish with just one account + one salary rule
- categories are seeded automatically

---

# 12.2 Dashboard Page

## Purpose

Give current clarity and forward-looking visibility.

## Required blocks

1. current balance
2. safe to spend
3. next salary date
4. projected balance
5. upcoming bills
6. budget snapshot
7. savings goal snapshot
8. recent transactions
9. quick add entry point

## Information hierarchy

Top priority:

- current balance
- safe to spend
- next salary
- projected balance before next salary

Secondary:

- budgets
- goals
- upcoming bills
- recent activity

## Mobile layout

Stacked cards, no dense desktop table first.

## Acceptance criteria

- dashboard reflects posted transactions
- dashboard includes future recurring items in forecast
- dashboard remains readable on phone widths
- quick add is accessible within one tap from dashboard

---

# 12.3 Transactions Page

## Purpose

Allow fast logging and history review.

## Required capabilities

- view latest transactions
- filter by type
- filter by category
- filter by account
- filter by date range
- add transaction
- edit transaction
- delete transaction

## Fast add fields

- type
- amount
- category
- account
- note optional
- date defaults to today

## Acceptance criteria

- add transaction in roughly 5 seconds
- new transaction updates dashboard data
- filters work correctly
- delete and edit trigger correct recalculation

---

# 12.4 Budget Page

## Purpose

Show spending control.

## Required sections

- monthly category budgets
- current spending against budget
- overspending indicators
- savings goal block

## Acceptance criteria

- user can create/update monthly budget per category
- actual category spend is computed from expense transactions
- over-budget state is visually obvious
- savings goal is visible and editable

---

# 12.5 Settings Page

## Purpose

Manage app configuration and data portability.

## Required sections

- accounts management
- recurring rules management
- user settings
- minimum buffer
- export JSON
- import JSON
- theme toggle
- reset data optional only if time allows

## Acceptance criteria

- export creates valid JSON
- import validates schema before writing
- invalid import fails safely
- recurring rules editable from settings

---

# 13. Query and Hook Design

## Rule

Hooks should be thin.
Business logic belongs in services/selectors, not in hooks.

## Examples

Good:

- `useDashboardData()` that delegates to a dashboard service
- `useTransactions(filters)` that delegates to repository/query functions

Avoid:

- giant hook with inline balance, forecast, filtering, formatting, and mutation logic mixed together

---

# 14. Business Logic Specifications

# 14.1 Current Balance Calculation

## Definition

Current balance is the sum of all account balances derived from:

`initialBalance + income transactions - expense transactions`

If transfer support is included:

- transfers move money between accounts
- transfers do not change total net worth

## Acceptance criteria

- total balance updates after every transaction mutation
- account-level balances remain consistent

---

# 14.2 Budget Calculation

## Definition

Budget consumption for a category is:

`sum(expense transactions in category within current month)`

## Output

For each budget:

- budget amount
- spent amount
- remaining amount
- percent used
- over-budget boolean

## Acceptance criteria

- monthly boundary uses local device date
- only expense transactions count toward spending budget

---

# 14.3 Goal Progress Calculation

## MVP definition

Goal progress may be based on manually entered current amount or inferred available funds.

Preferred MVP:

- user sets target amount
- user optionally sets current saved amount

This is simpler and avoids fake precision.

## Acceptance criteria

- show percent complete
- show remaining amount to target

---

# 14.4 Recurring Rule Expansion

## Definition

Recurring rules represent future modeled events.

For forecasting, the system must generate expected future occurrences within a forecast window.

## MVP supported recurrence patterns

1. weekly
2. monthly
3. semi-monthly

## Semi-monthly support

Needed because salary is a central use case.

Example:

- 15th and 30th
- 14th and 29th
- custom two dates

## Acceptance criteria

- recurring occurrences can be generated correctly for next 30 days
- recurring rules do not automatically create posted transactions unless explicitly designed later
- forecast uses expanded future occurrences without polluting actual transaction history

---

# 14.5 Forecast Calculation

This is the heart of the app.

## Inputs

- current balance
- current date
- future recurring income occurrences
- future recurring expense occurrences
- minimum buffer

## Forecast window

MVP required:

- 7 days
- 14 days
- 30 days
- until next salary

## Required outputs

- projected balance in 7 days
- projected balance in 14 days
- projected balance in 30 days
- next salary date
- total upcoming fixed expenses before next salary
- lowest projected balance in next 30 days
- safe to spend

## Safe to spend formula

For MVP:

```ts
safeToSpend =
  currentBalance - totalUpcomingFixedExpensesBeforeNextSalary - minimumBuffer;
```

If result is negative, display negative or zero depending on UX choice.

Recommended:

- calculation returns raw value
- UI decides how to message it

## Acceptance criteria

- forecast calculations are pure and unit tested
- future recurring occurrences are included
- already posted transactions are not double counted as forecast items
- next salary date is correctly resolved from recurring salary rule

---

# 15. JSON Export / Import Specification

# 15.1 Export

## Export payload must include

- accounts
- categories
- transactions
- recurringRules
- budgets
- goals
- userSettings
- metadata

## Example metadata

```ts
type ExportMetadata = {
  appVersion: string;
  exportedAt: string;
  schemaVersion: number;
};
```

## Acceptance criteria

- export returns complete valid JSON
- export can be downloaded from browser
- export structure is documented in code

---

# 15.2 Import

## Rules

- validate incoming JSON with Zod
- reject malformed payloads
- import should replace existing data only after confirmation
- avoid partial writes if validation fails

## Acceptance criteria

- failed import does not corrupt current data
- successful import restores complete dataset
- schema version mismatch should fail clearly or be handled explicitly

---

# 16. UI/UX Specification

# 16.1 Design Direction

The UI should feel:

- clean
- professional
- calm
- informative
- not playful
- not cluttered
- not spreadsheet ugly

## Visual tone

Think:

- modern fintech dashboard
- soft card layout
- strong readability
- restrained accent use
- mobile-first spacing

---

# 16.2 UX Rules

1. transaction entry should be fast
2. forms should prefer selects and presets over typing
3. primary actions must be obvious
4. dashboard should answer key money questions at a glance
5. avoid excessive charts in MVP
6. one screen should not try to explain everything

---

# 16.3 Important UI Components

## Common

- AppShell
- BottomNav
- TopHeader
- Card
- SectionHeader
- EmptyState
- CurrencyText
- DateText
- ConfirmDialog

## Dashboard

- BalanceCard
- SafeToSpendCard
- NextSalaryCard
- ProjectionCard
- UpcomingBillsList
- BudgetSnapshotCard
- GoalSnapshotCard
- RecentTransactionsList
- QuickAddFab

## Transactions

- TransactionList
- TransactionListItem
- TransactionFilterBar
- TransactionFormModal / Sheet

## Budget

- BudgetList
- BudgetItemCard
- GoalCard

## Settings

- AccountManager
- RecurringRulesManager
- ImportExportPanel
- ThemeToggle

---

# 16.4 Mobile Navigation

Use bottom nav for MVP:

- Dashboard
- Transactions
- Budget
- Settings

This is simple and phone-friendly.

---

# 16.5 Empty States

Must be intentionally designed.

Examples:

- no transactions yet
- no recurring expenses yet
- no budgets set
- no savings goal yet

Each should include a clear CTA.

---

# 16.6 Loading States

Because local-first app is fast, loading should be minimal.

Preferred:

- skeleton only when meaningful
- otherwise immediate render with local fetch

---

# 17. State Management Rules

## Zustand allowed use cases

- theme preference
- modal state
- filter state
- onboarding wizard state
- current selected forecast range
- install prompt dismissed state

## Zustand forbidden use cases

- storing transactions
- storing budgets as primary source
- storing recurring rules as primary source

---

# 18. Testing Strategy

# 18.1 Test Levels

## Unit tests — mandatory

For:

- balance calculation
- forecast generation
- recurring schedule expansion
- budget calculation
- goal calculation
- import validation
- export serialization

## Integration tests — recommended

For:

- repository CRUD
- onboarding creation flow
- dashboard data assembly
- import/replace flow

## UI tests — optional if time allows

For:

- transaction form happy path
- onboarding flow
- dashboard rendering

---

# 18.2 Suggested Test Stack

- **Vitest**
- **Testing Library**
- **happy-dom** or **jsdom**

---

# 18.3 TDD Implementation Order

Codex should use this order:

1. balance engine tests
2. recurring expansion tests
3. forecast tests
4. budget tests
5. import/export tests
6. repository tests

Claude Code can build UI against stable mocks while logic is being developed.

---

# 19. Delivery Sequence

This is the safest implementation order for the deadline.

# Phase 1 — Foundation

Owner: Codex first, Claude parallel on shell

## Tasks

- initialize project
- configure Tailwind v4
- configure PWA plugin
- define domain types
- create Dexie schema
- seed default categories
- create basic AppShell and bottom nav

---

# Phase 2 — Core Data

Owner: Codex

## Tasks

- account repository
- transaction repository
- recurring rule repository
- budget repository
- settings repository
- goal repository
- CRUD APIs/services
- unit tests

Claude can concurrently build page shells and static forms.

---

# Phase 3 — Core Logic

Owner: Codex

## Tasks

- balance engine
- recurring occurrence generator
- forecast engine
- budget engine
- goal progress logic
- query composition services
- tests

Claude can wire UI to mocked data shapes first.

---

# Phase 4 — MVP UI

Owner: Claude

## Tasks

- onboarding UI
- dashboard UI
- transactions list and form
- budget page
- settings page
- quick add UX
- empty states
- validation feedback
- responsive polish

Codex supports with real hooks/data contracts.

---

# Phase 5 — Portability and Finalization

Shared

## Tasks

- JSON export/import
- smoke test main flows
- PWA manifest/icons/install
- final bug fixes
- final visual polish
- final data validation

---

# 20. Interface Contracts

These should be locked early.

## Example dashboard DTO

```ts
type DashboardData = {
  currentBalance: number;
  safeToSpend: number;
  nextSalaryDate: string | null;
  projectedBalance7d: number;
  projectedBalance14d: number;
  projectedBalance30d: number;
  lowestProjectedBalance30d: number;
  upcomingBills: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
  }>;
  budgets: Array<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentUsed: number;
    isOverBudget: boolean;
  }>;
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentComplete: number;
  } | null;
  recentTransactions: Array<{
    id: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    categoryName: string | null;
    accountName: string | null;
    note: string | null;
    transactionDate: string;
  }>;
};
```

Claude should build UI against DTO contracts like this, not raw table structure where avoidable.

---

# 21. Seed Data Specification

On first app run, seed:

## System expense categories

- Food
- Transport
- Rent
- Utilities
- Subscriptions
- Health
- Shopping
- Miscellaneous

## System income categories

- Salary
- Bonus
- Other Income

## Default settings

- currency: PHP
- minimumBuffer: 0
- theme: system
- hasCompletedOnboarding: false

---

# 22. Error Handling Rules

## Import errors

Must be human-readable:

- invalid file structure
- unsupported schema version
- malformed data

## Form errors

- inline field-level validation
- no technical error dumps in UI

## Data integrity errors

If a referenced category or account is missing:

- fail safe
- do not silently corrupt metrics

---

# 23. Accessibility and UX Quality Bar

Minimum requirements:

- buttons have clear labels
- inputs have labels
- touch targets are phone-friendly
- contrast is readable
- destructive actions require confirmation
- keyboard use should still be reasonable on desktop

---

# 24. Out of Scope for MVP

Do not build these now:

- authentication
- cloud sync
- bank integrations
- OCR receipts
- push notifications
- AI suggestions
- shared accounts
- debt amortization engine
- investments
- multi-currency
- advanced analytics dashboards
- elaborate charting suite

---

# 25. Known Simplifications

These are acceptable for MVP.

1. Forecast only uses recurring fixed items and salary rules
2. Goal tracking can be manually updated instead of auto-allocating real cash
3. Transfer support may be postponed if deadline is at risk
4. Monthly budgets only
5. Single-user only
6. No backend server

---

# 26. Build Checklist

## Codex checklist

- [ ] Domain types defined
- [ ] Dexie schema implemented
- [ ] Repositories implemented
- [ ] Seed data implemented
- [ ] Balance engine tested
- [ ] Recurring expansion tested
- [ ] Forecast engine tested
- [ ] Budget engine tested
- [ ] Goal logic tested
- [ ] Import/export tested
- [ ] Query DTOs stable

## Claude Code checklist

- [ ] App shell built
- [ ] Bottom nav built
- [ ] Onboarding built
- [ ] Dashboard built
- [ ] Transactions page built
- [ ] Budget page built
- [ ] Settings page built
- [ ] Quick add flow polished
- [ ] Empty states added
- [ ] Import/export UX wired
- [ ] Mobile-first polish complete

---

# 27. Final Implementation Guidance

## For Codex

Be ruthless about keeping logic pure and testable.
Do not bury calculation rules inside hooks or components.
Start with failing tests for finance logic.

## For Claude Code

Design for behavioral success, not feature impressiveness.
The app must feel easy enough that the user does not abandon it.
Prioritize clarity, touch ergonomics, and fast entry. Avoid using too much borders.
Only use shadow on cards when necessary.

## Shared rule

If a decision conflicts with both speed and simplicity, choose the simpler version that still preserves the PRD promise.

---

# 28. Final Alignment Statement

This SPEC aligns with the PRD by preserving the approved product intent:

- fast manual tracking
- salary-cycle awareness
- look-ahead forecasting
- informative but simple dashboard
- budgets and savings goal support
- installable PWA
- local-first with JSON portability

It intentionally avoids unnecessary complexity so the MVP can ship fast and clean.
