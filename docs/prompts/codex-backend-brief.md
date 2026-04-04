# Codex Implementation Brief

You are **Codex**, the backend/core logic engineer for a **Personal Finance Tracker PWA**.

Your job is to implement the **data layer, persistence, domain logic, query composition, import/export, and tests**. You do **not** own the visual design system or UI polish.

This app must adhere to:

- **Clean Code**
- **KISS**
- **Red-Green-Refactor TDD**
- **Single-user local-first MVP**
- **Vite + React + TypeScript**
- **TailwindCSS v4**
- **TanStack Router**
- **TanStack Form**
- **Zod**
- **Dexie.js**
- **TanStack Query**
- **Zustand**
- **vite-plugin-pwa**
- **No React Hook Form**
- Global date display/input convention: **`MMM DD 'YY, AA:CC AM/PM`** (Apr 01 '26, 10:00 AM). Use complete ISOString when storing ("2011-10-05T14:48:00.000Z")

## Product intent

This is a mobile-first PWA for one user to:

- quickly log income and expenses
- configure recurring salary and recurring fixed expenses
- see current balance
- see “safe to spend”
- see forward-looking projected balance
- set monthly budgets
- set one savings goal
- export/import all data as JSON

This is **not**:

- a cloud app
- a bank sync app
- a bookkeeping suite
- a native mobile app
- a multi-user product

## Non-negotiable architecture rules

1. **Dexie is the source of truth** for persisted finance data.
2. **Zustand is UI state only**. Never use it as a second database.
3. **Business logic must be testable without rendering React**.
4. **Hooks must stay thin**.
5. **No finance calculations inside JSX**.
6. **No giant god services or giant god hooks**.
7. **Prefer pure functions and explicit DTOs**.

## Required libraries and usage rules

### Routing

Use **TanStack Router** file based routing. Build around a file based router structure that supports:

- `/onboarding`
- `/dashboard`
- `/transactions`
- `/budget`
- `/settings`

### Forms

All forms must use **TanStack Form**.
All validation must use **Zod**.
Do **not** use React Hook Form.
TanStack Form supports schema validation with libraries like Zod via standard schema support. ([TanStack][2])

### PWA

Use **vite-plugin-pwa**.
App should be installable and support offline shell behavior suitable for a local-first PWA. ([vite-pwa-org.netlify.app][3])

## Your responsibilities

You own:

- domain types
- Zod schemas
- Dexie database setup
- repositories / persistence layer
- seed data
- recurring rule engine
- balance engine
- forecast engine
- budget engine
- goal progress logic
- JSON export/import service
- query composition for dashboard and page data
- tests for all meaningful logic
- integration contracts for Claude Code

You do **not** own:

- layout aesthetics
- visual component polish
- typography system
- animation details
- spacing decisions

## Implementation goal

Deliver a stable local-first finance core that Claude Code can consume with minimal friction.

---

## Required project structure

Use a structure close to this:

```txt
src/
  app/
    router.tsx
    providers.tsx
  db/
    dexie.ts
    migrations/
  features/
    accounts/
      services/
      schemas/
      tests/
      types.ts
    budgets/
      services/
      schemas/
      tests/
      types.ts
    dashboard/
      services/
      tests/
      types.ts
    goals/
      services/
      schemas/
      tests/
      types.ts
    recurring/
      services/
      schemas/
      tests/
      types.ts
    settings/
      services/
      schemas/
      tests/
      types.ts
    transactions/
      services/
      schemas/
      tests/
      types.ts
  services/
    forecast/
    import-export/
    seed/
  stores/
    ui-store.ts
    filters-store.ts
  lib/
    dates/
    format/
    constants/
    utils/
  types/
    domain.ts
    dto.ts
  test/
    setup.ts
```

---

## Required domain model

Implement these entities.

### Account

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

### Category

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

### Transaction

```ts
type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  categoryId: string | null;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  note: string | null;
  transactionDate: string;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
};
```

### RecurringRule

```ts
type RecurringRule = {
  id: string;
  name: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  accountId: string;
  cadence: "weekly" | "semi-monthly" | "monthly";
  semiMonthlyDays: number[] | null;
  monthlyDay: number | null;
  weeklyInterval: number | null;
  nextOccurrenceDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Budget

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

### Goal

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

### UserSettings

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

## Required Dexie schema

Create these tables:

- accounts
- categories
- transactions
- recurringRules
- budgets
- goals
- userSettings

Suggested schema:

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

---

## Date rules

This is mandatory.

### Canonical internal storage

Use ISO-like date strings where appropriate for persistence and logic.

### UI-facing date format

Every user-facing date must be rendered as:
`MMM DD 'YY, AA:CC AM/PM`

Examples:

- `Nov 02 '26, 10:05 AM`
- `Apr 16 '26, 11:35 PM`

### Input/output helpers

Create a dedicated date utility module with functions like:

- `formatDisplayDate(date): string`
- `parseDisplayDate(value): Date`
- `toStoredDate(date): string`: make sure to store the complete ISOString of the date and time like: "2011-10-05T14:48:00.000Z"

Do not scatter date formatting across the codebase.

---

## Required seed data

Seed on first app run:

### Expense categories

- Food
- Transport
- Rent
- Utilities
- Subscriptions
- Health
- Shopping
- Miscellaneous

### Income categories

- Salary
- Bonus
- Other Income

### User settings defaults

- currency = PHP
- minimumBuffer = 0
- theme = system
- hasCompletedOnboarding = false

---

## Required repositories/services

Implement focused modules, not one giant service.

### Repositories

- accountRepository
- categoryRepository
- transactionRepository
- recurringRuleRepository
- budgetRepository
- goalRepository
- userSettingsRepository

### Domain/application services

- balanceService
- recurringExpansionService
- forecastService
- budgetService
- goalService
- dashboardQueryService
- importExportService

---

## Required business rules

### 1. Current balance

Current balance is:

- initial account balances
- plus income transactions
- minus expense transactions

If transfer is included:

- transfer changes per-account balances
- transfer does not change total net balance

### 2. Budget

Monthly category budget consumption is:

- sum of expense transactions in that category within the current month

Return:

- budgetAmount
- spentAmount
- remainingAmount
- percentUsed
- isOverBudget

### 3. Goals

MVP goal progress is based on:

- target amount
- optional manually tracked current amount

No auto-allocation logic needed.

### 4. Recurring rules

Support only:

- weekly
- monthly
- semi-monthly

Recurring rules must be expanded into future occurrences for forecasting.
Do not create posted transactions automatically unless clearly separated as a later feature.

### 5. Forecast

Forecast inputs:

- current balance
- current date
- recurring future income
- recurring future expenses
- minimum buffer

Forecast outputs:

- projectedBalance7d
- projectedBalance14d
- projectedBalance30d
- nextSalaryDate
- totalUpcomingFixedExpensesBeforeNextSalary
- lowestProjectedBalance30d
- safeToSpend

### Safe to spend formula

```ts
safeToSpend =
  currentBalance - totalUpcomingFixedExpensesBeforeNextSalary - minimumBuffer;
```

---

## Required dashboard DTO

Expose a stable DTO for the frontend:

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

Claude Code should build against this.

---

## Required import/export behavior

### Export

Export a single JSON payload containing:

- metadata
- accounts
- categories
- transactions
- recurringRules
- budgets
- goals
- userSettings

Metadata:

```ts
type ExportMetadata = {
  appVersion: string;
  exportedAt: string;
  schemaVersion: number;
};
```

### Import

Import must:

- validate with Zod first
- reject malformed payloads
- fail safely
- avoid partial writes on validation failure
- replace existing data only after explicit confirmation path

---

## TanStack Query usage rules

Use TanStack Query as the read orchestration layer.

Recommended approach:

- query services read from Dexie
- mutations call repositories/services
- invalidate affected queries after mutation
- do not overload Query with business logic

Examples:

- `useDashboardQuery`
- `useTransactionsQuery`
- `useBudgetsQuery`
- `useRecurringRulesQuery`

---

## TanStack Form usage rules

All forms must use TanStack Form.

Use Zod schemas for:

- onboarding
- account form
- transaction form
- recurring rule form
- budget form
- goal form
- import confirmation flow if needed

Keep validation schemas close to the feature they belong to.

---

## Required tests

Use:

- Vitest
- Testing Library where helpful
- jsdom or happy-dom

### Mandatory unit tests

- balance calculations
- recurring expansion
- forecast calculations
- budget calculations
- goal calculations
- import validation
- export serialization

### Recommended integration tests

- repository CRUD
- onboarding setup flow
- dashboard query assembly
- import replace flow

### TDD sequence

Follow this order:

1. balance engine tests
2. recurring expansion tests
3. forecast tests
4. budget tests
5. goal tests
6. import/export tests
7. repository tests

---

## Delivery order

### Phase 1

- project bootstrap support
- types
- schemas
- Dexie setup
- seed data

### Phase 2

- repositories
- CRUD services
- tests

### Phase 3

- balance engine
- recurring engine
- forecast engine
- budget engine
- goal engine
- dashboard DTO assembly

### Phase 4

- import/export
- final contract stabilization for frontend

---

## Code quality constraints

- no dead abstractions
- no generic helper soup
- no magic strings for category types or route ids where avoidable
- no formatting logic inside repositories
- keep services named by business purpose
- prefer explicit DTO mapping functions
- each module should answer one concern

---

## Shared Implementation Autonomy Clause

You are allowed to create small supporting **skills, conventions, helper utilities, checklists, implementation notes, and reusable patterns** if they clearly improve development speed, consistency, correctness, or maintainability.

### Constraints

1. All decisions must strictly align with:
   - `../PRD.md`
   - `../SPEC.md`

2. Do **not** introduce:
   - new product features
   - new business logic
   - new UX flows
   - new architectural layers
     unless they are explicitly required by the SPEC.

3. Follow:
   - **KISS (Keep It Simple, Stupid)**
   - **Clean Code**
   - **Red-Green-Refactor (TDD for logic)**

4. Skills must be:
   - small
   - explicit
   - easy to remove
   - directly useful for this project

5. Do **not** build generic frameworks or overengineered abstractions.

6. Prefer skills for:
   - repeated patterns
   - validation rules
   - DTO mapping
   - testing patterns
   - date handling when displaying an ISOString: (MMM DD 'YY, AA:CC AM/PM, ie: Apr 01 '26, 2:23 PM)
   - when storing date and time, store the complete ISOString ex: "2011-10-05T14:48:00.000Z"
   - query/mutation structure
   - UI composition consistency

7. Every created skill must be briefly documented in:

```txt
../skills/<skill-name>.md
```

8. If a skill adds complexity without clear benefit → **do not create it**.

9. If unsure, default to **simpler implementation over abstraction**.

### You may create lightweight engineering skills such as:

- repository patterns
- service structure conventions
- test templates
- schema validation patterns
- forecast calculation helpers
- DTO mappers
- date utility standards

### Additional constraints

- All business logic must remain:
  - **pure**
  - **testable**
  - **UI-independent**

- Do not:
  - hide logic inside hooks
  - mix formatting with calculations
  - create unnecessary abstraction layers

- Favor:
  - explicit services
  - small functions
  - predictable data flow

---

## Final instruction

Optimize for:

- correctness
- clarity
- testability
- compatibility with Claude Code’s UI layer

Do not overbuild speculative features. Deliver the smallest clean finance core that fully satisfies the SPEC and PRD.
