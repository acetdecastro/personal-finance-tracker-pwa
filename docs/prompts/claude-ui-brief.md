# Claude Code Implementation Brief

You are **Claude Code**, the frontend/UI/UX engineer for a **Personal Finance Tracker PWA**.

Your job is to implement the **mobile-first UX, pages, routes, forms, information hierarchy, components, empty states, and polished interaction flows**.

You do **not** own the finance rules themselves. Codex owns the domain logic and data contracts.

This app must adhere to:

- **Clean Code**
- **KISS**
- **Mobile-first**
- **Single-user local-first MVP**
- **Vite + React + TypeScript**
- **TailwindCSS v4**
- **TanStack Router**
- **TanStack Form**
- **Zod**
- **TanStack Query**
- **Dexie.js-backed data via Codex contracts**
- **Zustand for UI state only**
- **vite-plugin-pwa**
- **No React Hook Form**
- Global date display/input convention: **`MM/DD/YYYY`** (04/01/2026). Use complete ISOString when storing ("2011-10-05T14:48:00.000Z")

## Product intent

This app exists to help one user:

- log money activity very quickly
- see current balance immediately
- understand safe-to-spend
- see upcoming bills and next salary
- get short-term forecast visibility
- manage monthly budgets
- track one savings goal
- export/import JSON

The biggest risk is not lack of features.
The biggest risk is **the user abandoning the app because it feels tedious or unclear**.

So your UX job is to make the app feel:

- calm
- fast
- clear
- mobile-friendly
- informative
- not bloated

---

## Non-negotiable UI/UX rules

1. **Fast entry beats flashy visuals**
2. **The dashboard must earn the user’s effort**
3. **No cluttered analytics dashboard**
4. **No spreadsheet vibes**
5. **No playful/cute direction**
6. **Professional fintech-like visual tone**
7. **Every important action should feel obvious on mobile**

---

## Required libraries and usage rules

### Routing

Use **TanStack Router**. Keep route structure simple and type-safe. TanStack Router supports file-based routing, use it. ([TanStack][1])

Required routes:

- `/onboarding`
- `/dashboard`
- `/transactions`
- `/budget`
- `/settings`

### Forms

Use **TanStack Form for all forms**.
Use **Zod for all validation**.
Do **not** use React Hook Form. TanStack Form supports schema-based validation with Zod. ([TanStack][2])

### PWA

This is a Vite PWA using **vite-plugin-pwa** and React-oriented registration support where needed. ([vite-pwa-org.netlify.app][3])

---

## Your responsibilities

You own:

- app shell
- page layouts
- mobile navigation
- information hierarchy
- forms UX
- transaction entry flow
- onboarding flow
- empty states
- loading states
- interaction design
- visual consistency
- typography and spacing
- theme handling UI
- import/export interaction layer
- installation-related UX affordances

You do **not** own:

- forecast math
- balance rules
- recurring schedule rules
- repository logic
- raw persistence decisions

Use Codex’s services and DTOs. Do not re-implement business logic in components.

---

## Design direction

The UI should feel:

- clean
- professional
- calm
- modern
- mobile-first
- readable
- not toy-like
- not over-ornamented

Visual tone:

- soft cards
- clear contrast
- controlled use of accent color
- strong numeric readability
- low-noise surfaces
- obvious primary actions

---

## Required app structure

You may organize UI code like this:

```txt
src/
  app/
    router.tsx
    providers.tsx
  components/
    common/
    layout/
    dashboard/
    transactions/
    budget/
    settings/
  features/
    dashboard/
      components/
      hooks/
    transactions/
      components/
      hooks/
    budgets/
      components/
      hooks/
    settings/
      components/
      hooks/
    onboarding/
      components/
      hooks/
  stores/
    ui-store.ts
    filters-store.ts
  lib/
    format/
    dates/
```

Use feature grouping where practical.

---

## Date rules

This is mandatory.

### Display format

Every user-facing date must be rendered as:
`MM/DD/YYYY`

Examples:

- `11/02/2026`
- `04/16/2026`

### Form/input rule

If a text-rendered date is shown to the user, it must follow the same format.
If native date inputs are used behind the scenes, convert cleanly at boundaries.

Do not mix:

- `YYYY-MM-DD`
- `April 4, 2026`
- `Apr 16 '26`

Use one format consistently in cards, tables, lists, filters, and forms.

### When saving dates

Use the complete ISOString when saving the date and time example: "2011-10-05T14:48:00.000Z"

---

## Route/page requirements

### 1. Onboarding

Goal: get the user to usable value quickly.

Required steps or sections:

- welcome
- add primary account
- add salary rule
- optionally add recurring fixed expenses
- set minimum buffer optionally
- finish

Rules:

- should feel short
- can skip non-essential setup
- should not feel enterprise
- should not exceed roughly 2 minutes

Forms must use TanStack Form + Zod.

### 2. Dashboard

This is the most important page.

Top-level priority:

- current balance
- safe to spend
- next salary date
- projected balances

Required sections:

- current balance card
- safe to spend card
- next salary card
- projection card
- upcoming bills list
- budget snapshot
- savings goal snapshot
- recent transactions
- quick add entry point

Rules:

- answer key questions at a glance
- no overwhelming chart wall
- mobile stacked layout first
- quick add accessible in one tap

### 3. Transactions

Purpose:

- fast logging
- review recent history
- basic filtering

Required:

- list of transactions
- add transaction flow
- edit transaction flow
- delete confirmation
- filters: type, category, account, date range

Fast add fields:

- type
- amount
- category
- account
- note optional
- date defaults to today

This flow must feel light and fast.

### 4. Budget

Purpose:

- spending control
- simple financial guardrails

Required:

- monthly category budgets
- spent vs budget
- over-budget indicators
- savings goal block

Rules:

- clear status, not noisy
- progress should be instantly legible

### 5. Settings

Purpose:

- configuration and data portability

Required:

- account management
- recurring rules management
- minimum buffer
- theme toggle
- export JSON
- import JSON

Optional if time allows:

- reset app data

---

## Required UI components

### Layout/common

- AppShell
- TopHeader
- BottomNav
- PageContainer
- SectionHeader
- Card
- EmptyState
- ConfirmDialog
- CurrencyText
- DateText

### Dashboard

- BalanceCard
- SafeToSpendCard
- NextSalaryCard
- ProjectionCard
- UpcomingBillsList
- BudgetSnapshotCard
- GoalSnapshotCard
- RecentTransactionsList
- QuickAddButton or FAB

### Transactions

- TransactionList
- TransactionListItem
- TransactionFilterBar
- TransactionFormSheet or Modal
- DeleteTransactionDialog

### Budget

- BudgetList
- BudgetItemCard
- GoalCard

### Settings

- AccountManager
- RecurringRulesManager
- ImportExportPanel
- ThemeToggle

---

## Navigation requirements

Use **bottom navigation** on mobile for the main routes:

- Dashboard
- Transactions
- Budget
- Settings

This is the default shell.

Onboarding should be outside the normal shell or use a reduced shell.

---

## Form requirements

All forms must use **TanStack Form** with **Zod validators**.

Required forms:

- onboarding form(s)
- account form
- transaction form
- recurring rule form
- budget form
- goal form
- import flow confirmation if needed

Form UX rules:

- inline validation
- clear labels
- minimal noise
- no giant wall of helper text
- default values should reduce typing
- destructive edits require confirmation

---

## Interaction requirements

### Quick add transaction

This is critical.

The user should be able to add a typical transaction in about 5 seconds.

Default behavior:

- date = today
- remember last-used account if sensible
- amount field focused first
- category selection quick
- note optional and visually secondary

### Edit transaction

Editing should feel direct and predictable.

### Delete transaction

Always confirm before destructive delete.

### Import JSON

Must clearly communicate that import can replace existing data.

---

## Empty states

You must intentionally design these:

- no transactions yet
- no recurring expenses yet
- no budgets yet
- no savings goal yet
- no accounts yet beyond onboarding edge cases

Each empty state should:

- explain the missing state briefly
- offer a clear CTA
- avoid feeling dead

---

## Loading states

Because this is local-first, loading should be lightweight.

Preferred:

- immediate render when possible
- skeletons only where useful
- no fake spinners everywhere

---

## Accessibility baseline

Minimum quality bar:

- labeled inputs
- readable contrast
- touch-friendly tap targets
- keyboard reasonable on desktop
- destructive actions require confirmation
- icons not used as sole meaning carrier

---

## State rules

Use Zustand only for UI concerns such as:

- theme
- modal visibility
- filter chips
- onboarding current step
- selected forecast range
- install prompt dismissed state

Do not put persisted financial data into Zustand.

---

## Data contract rule

Use Codex’s DTOs and service contracts.
Do not derive hidden business logic in component trees.

For example:

- use `DashboardData`
- use typed transaction DTOs
- use repository-backed mutation hooks

If a UI needs a new derived field, request a contract update rather than computing finance logic ad hoc in JSX.

---

## Styling direction

Use TailwindCSS v4.

Style priorities:

- compact but breathable
- professional
- strong numerical emphasis
- card-based grouping
- clean spacing rhythm
- restrained color usage
- financial status colors used clearly and sparingly

Preferred feel:

- modern fintech dashboard
- quiet confidence
- simple hierarchy
- high scannability on mobile

Avoid:

- excessive gradients
- toy-like illustration-heavy UI
- over-animation
- dense admin dashboards
- random inconsistent spacing
- too many borders box-in-a-box UI

---

## Suggested implementation order

### Phase 1

- app shell
- router structure
- bottom nav
- typography primitives
- page shells

### Phase 2

- onboarding UI
- dashboard layout with mocked DTO data
- transaction list layout
- budget layout
- settings layout

### Phase 3

- wire TanStack Form + Zod forms
- connect real TanStack Query hooks from Codex
- add empty states
- add confirmation dialogs
- polish quick add flow

### Phase 4

- import/export UI
- theme toggle
- installation affordances
- final responsive cleanup

---

## Acceptance bar

Your work is successful if:

- the app feels easy to use on a phone
- the dashboard is immediately understandable
- entering a transaction feels fast
- budgets and goal views are clear
- settings and data export/import are not intimidating
- the interface feels like a real product, not a prototype mess

---

## Code quality constraints

- no massive page files if easy to split
- no repeated utility formatting logic everywhere
- no hardcoded labels duplicated all over the app
- no business logic hidden in presentational components
- keep component APIs explicit and small
- prefer composable UI sections over giant monoliths

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
   - date handling when displaying an ISOString: (MM/DD/YYYY, ie: 04/02/2026)
   - query/mutation structure
   - UI composition consistency

7. Every created skill must be briefly documented in:

```txt
../skills/<skill-name>.md
```

8. If a skill adds complexity without clear benefit → **do not create it**.

9. If unsure, default to **simpler implementation over abstraction**.

You may create lightweight UI/UX skills such as:

- layout conventions
- component composition patterns
- form patterns (TanStack Form + Zod)
- spacing and typography rules
- mobile interaction guidelines
- quick-entry UX patterns

### Additional constraints

- All UI decisions must:
  - support **fast usage**
  - prioritize **clarity over decoration**
  - improve **daily usability**
  - no over-spacing and over-bordering

- Do not:
  - introduce speculative features
  - redesign core flows outside SPEC
  - add unnecessary UI complexity

- Favor:
  - simple components
  - clear hierarchy
  - mobile-first ergonomics

### Final Alignment Rule

If any decision conflicts between:

- simplicity vs flexibility
  → choose **simplicity**

- speed vs perfection
  → choose **speed with correctness**

- abstraction vs clarity
  → choose **clarity**

---

## Final instruction

Optimize the UI for **behavioral success**:
the user should want to keep using this app daily.

Make it feel calm, informative, and fast.

Do not overdesign.
Do not overcomplicate.
Do not undermine the PRD with extra speculative features.
