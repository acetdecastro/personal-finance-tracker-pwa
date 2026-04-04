# PRD — Personal Finance Tracker PWA

## 1) Product Overview

### Product name

Working title: **FlowTrack**, **CashLook**, or **SahodSense**

Temporary PRD name: **Personal Finance Tracker PWA**

### Product type

A **Progressive Web App (PWA)** for personal income and expense tracking with forward-looking dashboard insights.

### Primary platform

- Mobile-first web app
- Installable as a PWA on phone
- Desktop usable, but secondary

### Core promise

> “Log money in seconds, understand your cash position instantly, and see how your next days/weeks look before problems happen.”

---

## 2) Problem Statement

The user currently manages finances mostly through **mental tracking**, not a formal system. That causes several problems:

- unclear awareness of real cash position
- unclear safe spending amount
- weak visibility into upcoming financial pressure
- low consistency with tracking because most tools feel tedious
- existing methods do not give helpful decision-oriented insights

The user needs a finance tracker that is:

- **fast to use**
- **easy to maintain**
- **insightful, not noisy**
- centered around **salary cycles and future cash look-ahead**

---

## 3) Target User

### Primary user

You.

### User profile

- Salaried worker with **fixed semi-weekly / semi-monthly style income**
- Wants future support for more income streams later
- Needs clarity on daily spending and upcoming cash position
- Has low tolerance for tracking friction
- Will abandon the app if input is slow or cognitively heavy

### Behavioral truth

The biggest product risk is **not missing features**.

It is **you stopping usage because it feels annoying**.

So the app must prioritize:

1. **speed of entry**
2. **clear dashboard value**
3. **minimal setup friction**
4. **smart defaults**

---

## 4) Product Goals

## Primary goals

1. Make expense/income logging easy enough to sustain
2. Show current financial position clearly
3. Show future cash outlook based on recurring income and expected expenses
4. Help user make safer spending decisions

## Secondary goals

1. Support budgeting and savings goals
2. Support multiple accounts in a simple way
3. Enable local-first data ownership with JSON export

## Non-goals for MVP

Do **not** build these first:

- bank sync
- receipt OCR
- AI categorization
- shared household finance
- investments
- loan amortization engine
- complex accounting concepts
- cloud auth/sync
- native mobile app

---

## 5) Core Product Vision

This app should feel like a blend of:

- **quick expense logger**
- **salary-cycle cash planner**
- **light personal finance dashboard**

Not a bookkeeping app.

Not a spreadsheet clone.

Not a full financial planner.

The product’s edge is:

> **Simple input + genuinely helpful look-ahead figures**

---

## 6) Key Insights From Your Interview

Based on your answers, here’s what matters most:

### What you care about most

- awareness of spending
- easy logging
- look-ahead forecasting
- current balance visibility
- professional UI
- future flexibility for multiple income streams/accounts

### What matters less right now

- full offline-native mobile architecture
- heavy analytics complexity
- over-optimized automation
- advanced debt/loan modeling

### Important tension to resolve

You chose:

- very simple usage
- but also rich forecasting and insight

That means the product must **hide complexity behind defaults**.

---

# 7) Product Principles

## Principle 1 — 5-second logging

A user should be able to add a transaction in about **5 seconds**.

## Principle 2 — Dashboard earns the effort

Every logged transaction should make the dashboard immediately more useful.

## Principle 3 — Opinionated simplicity

The app should decide sensible defaults rather than asking too many questions.

## Principle 4 — Forecasting without overwhelm

Forward-looking figures should feel clear, not “finance nerd” heavy.

## Principle 5 — Local-first ownership

User data should remain available locally, with optional export to JSON.

---

# 8) MVP Scope

## MVP theme

**Track now, understand now, anticipate next**

## MVP Modules

### A. Onboarding / Setup

User can configure:

- main salary amount
- salary cadence
- next salary date
- recurring fixed expenses
- preferred accounts
- monthly savings goal
- currency (PHP default)

### B. Transactions

User can add:

- expense
- income
- transfer between accounts

Fields for transaction:

- amount
- category
- account
- date
- optional note

Fast-add UX should prioritize:

- amount
- category
- save

### C. Recurring Rules

User can define recurring items:

- salary recurrence
- rent
- subscriptions
- utilities
- other fixed expenses

Recurring entries should power forecasting even if not yet “realized” as posted transactions.

### D. Dashboard

Main dashboard should show:

- current total balance
- balance by account
- this pay cycle income vs expenses
- upcoming recurring expenses
- next salary date
- projected balance over next 7 / 14 / 30 days
- safe-to-spend estimate
- budget progress
- savings goal progress

### E. Budgets

Simple category budgets:

- monthly
- maybe cycle-based later

### F. Goals

Basic savings goal:

- target amount
- target date optional
- progress shown on dashboard

### G. Export / Import

- export all data as JSON
- import from JSON
- backup / restore flow

### H. PWA Support

- installable
- responsive
- app shell caching
- usable like an app on phone

---

# 9) Features — Ranked by Importance

## Tier 1 — Must have

- quick add transaction
- income and expense categories
- recurring salary
- recurring fixed expenses
- dashboard with current balance
- look-ahead forecast
- budget limits
- savings goal
- multi-account basics
- JSON export/import
- PWA installability

## Tier 2 — Should have

- transaction filters
- category summaries
- account-based balances
- upcoming bills widget
- overspending alerts
- preset recurring templates

## Tier 3 — Later

- calendar cash flow view
- custom dashboard widgets
- tags
- split transactions
- salary bonuses/overtime modeling
- trend comparisons
- reminders / push notifications
- cloud sync

---

# 10) Core User Stories

## Transaction logging

- As a user, I want to add an expense in seconds so I don’t avoid tracking
- As a user, I want categories to be fast to pick so entry feels lightweight
- As a user, I want reusable patterns over time so repeat entries get easier

## Income planning

- As a user, I want to set my semi-weekly/semi-monthly salary so my dashboard reflects my real cycle
- As a user, I want future support for extra income streams without changing the app model

## Forecasting

- As a user, I want to see projected balance in the coming days/weeks
- As a user, I want to know whether I’m safe to spend right now
- As a user, I want upcoming recurring expenses reflected before they hit

## Control

- As a user, I want simple budget caps so I know when I’m overspending
- As a user, I want alerts or warnings when I’m trending badly

## Trust / portability

- As a user, I want my data exportable to JSON so I’m not trapped

---

# 11) Dashboard Definition

This is the heart of the app.

## First screen priorities

You selected **Current Balance** and **Forecast** as top priorities. So the dashboard should open with:

### Top summary cards

1. **Current Balance**
2. **Safe to Spend**
3. **Next Salary In**
4. **Projected Balance in 7 / 14 / 30 Days**

### Main dashboard sections

### 1. Cash snapshot

- total balance
- balance by account
- this cycle spent
- this cycle income

### 2. Forward look

- next salary date
- upcoming recurring expenses
- projected lowest balance before next salary
- projected end-of-cycle balance

### 3. Budget and goals

- budget consumption by category
- savings goal progress

### 4. Recent activity

- latest transactions
- quick add CTA

---

# 12) Forecasting Logic

You specifically want **look-ahead figures**. So this needs clear product logic.

## Forecast inputs

The forecast should include:

- current account balances
- posted income transactions
- posted expense transactions
- recurring future salary events
- recurring future fixed expenses
- optional budget trend signals later

## MVP forecast outputs

### Show:

- projected balance tomorrow
- projected balance on next payday
- projected balance after upcoming bills
- lowest projected balance in next 30 days
- safe-to-spend amount until next salary

## Suggested “Safe to Spend” formula for MVP

A simple version:

`safeToSpend = currentBalance - requiredUpcomingRecurringExpenses - minimumBuffer`

Where:

- `requiredUpcomingRecurringExpenses` = sum of future fixed expenses before next salary
- `minimumBuffer` = user-defined or system default

Later, this can become smarter, but MVP should stay understandable.

---

# 13) Information Architecture

## Main navigation

Keep it simple: 4 tabs max.

### Recommended tabs

1. **Dashboard**
2. **Transactions**
3. **Budget**
4. **Settings**

Optional fifth later:

5. **Accounts** or **Goals**

## Suggested mobile structure

### Dashboard

- summary
- forecast
- quick insights
- recent transactions

### Transactions

- transaction list
- filters
- add transaction FAB

### Budget

- category budgets
- savings goal
- spending warnings

### Settings

- salary setup
- recurring rules
- accounts
- export/import
- theme/preferences

---

# 14) UX Requirements

## UX must-haves

- mobile-first
- one-thumb friendly
- low typing burden
- default category suggestions
- visible save confirmation
- quick repeat behavior
- clean typography
- professional fintech-like design

## Quick add form should ask only:

- amount
- type
- category
- account
- note optional
- date defaults to today

## Anti-dropoff UX decisions

Because you said you often quit early:

- do not make onboarding long
- do not require detailed setup to start
- allow “setup later”
- let user add transactions immediately
- progressively enhance configuration

---

# 15) Functional Requirements

## Transactions

- create, edit, delete income/expense/transfer
- filter by date/category/account/type
- sort by latest first

## Accounts

- create multiple accounts
- examples:
  - cash
  - bank
  - e-wallet
- view per-account balances

## Recurring items

- create recurring income
- create recurring expense
- define amount, cadence, next date, category, account

## Budgets

- set budget per category
- compare actual vs target
- flag overspending

## Goals

- create one or more savings goals
- show amount saved vs target

## Export/import

- export structured JSON
- import and validate JSON
- prevent duplicate accidental import if possible

## PWA

- install prompt where appropriate
- offline caching for shell
- smooth reload
- icon / manifest / splash basics

---

# 16) Non-Functional Requirements

## Performance

- app should open fast on mid-range phones
- transaction add flow should feel instant
- dashboard load should be under a few hundred ms for normal dataset sizes

## Reliability

- no data loss from basic use
- export/import must be trustworthy
- local persistence must be stable

## Maintainability

- schema should support future income streams
- forecast logic should be separable from UI
- store boundaries should be clear

## Privacy

- local-first by default
- no account required in MVP

---

# 17) Recommended Data Model

High-level only.

## Entities

### Transaction

- id
- type: income | expense | transfer
- amount
- categoryId
- accountId
- note
- transactionDate
- createdAt
- updatedAt
- recurringRuleId nullable

### Account

- id
- name
- type
- initialBalance
- isArchived

### Category

- id
- name
- type: income | expense
- icon optional
- color token optional later

### RecurringRule

- id
- name
- type: income | expense
- amount
- categoryId
- accountId
- cadence
- nextOccurrenceDate
- isActive

### Budget

- id
- categoryId
- amount
- periodType

### Goal

- id
- name
- targetAmount
- targetDate nullable
- linkedAccountId optional

### Settings

- currency
- payday cadence
- payday config
- minimum buffer
- theme
- install dismissed flags
- onboarding flags

---

# 18) Your Chosen Tech Direction

Your stack choice is good for this app.

## Final stack

- **Vite**
- **React**
- **TailwindCSS v4**
- **TanStack Router** or React Router if you want simpler routing
- **TanStack Query**
- **Zustand**
- **Dexie.js**
- **PWA plugin for Vite**
- optional:
  - Zod
  - React Hook Form
  - date-fns

## Architecture roles

### Dexie.js

Primary local database and source of truth for persisted financial data.

### TanStack Query

Useful for query lifecycle, derived fetch abstraction, invalidation, and keeping the UI predictable.

### Zustand

Good for ephemeral UI state:

- filters
- theme
- modal states
- onboarding progress
- current form draft
- selected date range

## Important recommendation

Use **Dexie as the true data source**, not Zustand.

Zustand should not become a shadow database.

---

# 19) Important Product/Tech Clarification

You originally talked about offline-native concern, but then selected:

- online-only is fine
- export to JSON preferred

That means the product does **not** need native mobile storage to succeed.

A PWA with **Dexie/IndexedDB** is enough for MVP.

That is the right call.

It gives you:

- installable app feel
- local data persistence
- no backend dependency for MVP
- faster shipping

So don’t let “not native mobile” block you.

For this product, **PWA is valid**.

---

# 20) Risks

## Product risks

1. You stop using it because entry still feels tedious
2. Forecasting becomes confusing instead of useful
3. Too many setup screens reduce adoption
4. Budgeting becomes too rigid for real life

## Technical risks

1. Overengineering local state boundaries
2. Forecast logic mixed into UI components
3. Import/export edge cases
4. PWA expectations confusing users on iPhone install flow

## Delivery risk

Your real risk is trying to build:

- too many charts
- too many settings
- too much polish
- too much architecture

You need a **tight MVP**.

---

# 21) Success Metrics

For MVP, define success as:

## Behavioral

- user can add a transaction in under 5 seconds
- user uses app at least once daily for 7 days
- dashboard helps answer “can I spend today?”

## Product

- recurring salary setup works correctly
- upcoming fixed expenses affect forecast correctly
- JSON export/import works reliably
- app is installable as PWA

---

# 22) Recommended MVP Cut for Your Deadline

You said you need to ship by **April 5, 2026 at 12:00 noon**.

That is very tight.

So here is the correct MVP cut:

## Ship tomorrow MVP

### Must include

- PWA installable shell
- onboarding for salary + accounts
- add/edit/delete transactions
- recurring salary
- recurring fixed expenses
- dashboard:
  - current balance
  - next salary
  - upcoming bills
  - projected balance
- category budgets
- one savings goal
- JSON export/import

### Cut for later

- advanced charts
- notifications
- complex calendar views
- fancy analytics
- split transactions
- multiple savings goals
- transfer workflows if time gets tight

---

# 23) Suggested Build Order

## Phase 1 — foundation

- app shell
- Dexie schema
- seeded categories
- account model
- transaction CRUD

## Phase 2 — key value

- recurring salary
- recurring expenses
- dashboard totals
- forecast engine

## Phase 3 — retention value

- budget module
- savings goal
- export/import

## Phase 4 — polish

- PWA install
- mobile UX refinement
- empty states
- professional visual cleanup

---

# 24) Clear PRD Summary

## One-sentence PRD

A mobile-first installable personal finance tracker that lets a salaried user quickly log money activity and instantly understand current balance, upcoming obligations, and short-term projected cash position.

## MVP thesis

If the app makes logging fast and the dashboard meaningfully answers **“where am I financially, and what do the next days look like?”**, then it succeeds.

---

# 25) Final Recommendation

Your best move is to build this as:

- **local-first PWA**
- **single-user only**
- **fast-entry-first**
- **forecast-centric**
- **salary-cycle aware**
- **clean and professional**

That is the right product.

Not a spreadsheet clone.

Not a bloated finance platform.

A sharp personal tool that solves your real behavior problem.
