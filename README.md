# FinPulse — Financial Wellness for Young Professionals

> A high-fidelity React prototype designed to make personal finance feel **approachable, reflective, and anxiety-free** — not like accounting software.

**Live Demo:** `npm run dev` → [http://localhost:5173](http://localhost:5173)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Requires **Node.js 18+**. No backend needed — data persists in `localStorage`.

---

## Why FinPulse Exists

Most finance apps punish users with red numbers and guilt-inducing budgets. Young professionals — salaried, freelance, or students — need a tool that builds **financial awareness through reflection**, not restriction.

FinPulse replaces the "you overspent" model with a "let's understand your spending" model.

---

## Core Design Decisions

| Decision | Rationale |
|---|---|
| **3-Bucket Taxonomy** | All spending maps to *Necessities*, *Running*, or *Discretionary* — simpler than 15+ categories |
| **No Income Display** | Showing salary on every screen creates anxiety and defines users by earnings. Removed entirely. |
| **UPI-Style Numpad** | Custom on-screen keypad makes data entry feel intentional, like a real payment |
| **One-Off Toggle** | Annual expenses (insurance, flights) are excluded from trend analysis to prevent false spikes |
| **Weekly Money Debrief** | Combines quantitative spending data with qualitative emotional reflection |

---

## Screens

| Screen | Purpose |
|---|---|
| **Onboarding** | 3-step flow: Welcome → Focus Picker → Name. No income asked. |
| **Dashboard** | Net cash flow card with graphical IN/OUT bar, quick actions, debrief widget |
| **Activity** | Transaction log with bucket-grouped categories, custom numpad, quick-fill chips |
| **Goals** | Visual savings goal tracker with progress rings |
| **Deep Insights** | Modular analytics: donut chart + configurable widget trackers |
| **Money Debrief** | Weekly reflection with emoji sentiment, regret flagging, wellness score |
| **Profile** | Name + Work Style (not income). Data reset option. |

---

## Unique Feature: Configurable Deep Insights Engine

The Insights page is not a static chart dump. Users can:

- **Add/Remove** tracker widgets (Nutrition, EMI Safety, E-Commerce, Subscriptions)
- **Rank-order** them by priority (#1, #2, #3…)
- Each tracker **auto-scans transaction notes** using keyword matching — zero manual tagging

This means logging "Swiggy Pizza ₹350" automatically feeds the Health vs Fast Food tracker without any extra steps from the user.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| Data | localStorage + mock seed data |

---

## Project Structure

```
src/
├── components/       # Reusable UI (BottomNav, AnimatedNumber)
├── data/             # Mock transactions, goals, storage helpers
├── pages/            # All screen components + co-located CSS
├── utils/            # Debrief calculator, date/currency formatters
├── index.css         # Global design system tokens
├── App.jsx           # Route definitions
└── main.jsx          # Entry point
```

---

## Design System

- **Base:** AMOLED black (`#000`) with elevated surfaces (`#1C1C1E`, `#2C2C2E`)
- **Accent:** iOS System Blue (`#0A84FF`)
- **Typography:** Inter — optimized for financial numerals
- **Border Radius:** 28px for cards, 16px for inputs, full-round for pills
- **Animations:** Spring-based transitions via Framer Motion, easeOutQuart number roll-ups

---

## Documentation

- [`case-study/FinPulse_CaseStudy.md`](./case-study/FinPulse_CaseStudy.md) — Full design rationale aligned to evaluation criteria

---

*Built as a UI/UX design assessment submission.*
