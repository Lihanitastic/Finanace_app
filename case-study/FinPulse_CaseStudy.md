# FinPulse — Design Case Study
### A Financial Wellness Experience for Young Professionals
*Zorvyn UI/UX Designer Intern Assessment*

---

## 1. Problem Framing

**Target Users:** Young professionals (22–30) across three financial realities:
- Salaried employees managing a fixed paycheck for the first time
- Freelancers dealing with irregular, unpredictable income
- Students transitioning into independent financial planning

**The Real Problem:** Finance apps today are built like accounting ledgers. They show you a number, compare it against an arbitrary budget, and highlight failures in red. This creates a guilt cycle:

> Overspend → See red warning → Feel shame → Avoid the app → Lose financial awareness entirely

**FinPulse's Thesis:** The solution is not stricter budgets — it's *self-awareness*. If users understand *why* they spent, they naturally adjust behavior. FinPulse replaces the punitive "You overspent by ₹3,000" model with a reflective "Here's what your week looked like — would you change anything?" model.

**A deliberate choice:** FinPulse never asks for or displays monthly income. Showing salary on every screen subtly tells users "you are worth ₹X/month." That framing is psychologically harmful. We track flow (in vs out) without anchoring identity to a number.

---

## 2. Information Architecture

### Navigation Model
A 5-tab bottom bar separates concerns by user intent:

```
┌──────────────────────────────────────────────────────┐
│  Home    Activity    Goals    Insights    Debrief    │
│   📊       ↔️         🎯       📈          🧠       │
│ overview  logging   saving   analysis  reflection   │
└──────────────────────────────────────────────────────┘
```

**Why this order?** Users open the app most often to glance (Home) or log (Activity). Goals and Insights are visited weekly. Debrief is intentionally last — it's a dedicated ritual, not a quick check.

### The 3-Bucket Taxonomy
Instead of 15+ granular categories that overwhelm users, every expense maps to exactly one of three psychological buckets:

| Bucket | Examples | Color |
|---|---|---|
| **Absolute Necessities** | Rent, EMI, Insurance | Blue |
| **Running Expenses** | Groceries, Transport, Utilities | Orange |
| **Discretionary** | Dining, Shopping, Entertainment | Red |

**Why?** "I spent 62% on necessities and 22% on discretionary" is immediately actionable. "I spent 8% on transport, 4% on subscriptions, 11% on dining…" is not.

### Screen Hierarchy

```
Onboarding (3 steps) → Protected App Shell
                          ├── Home (Dashboard)
                          │     └── Profile (settings)
                          ├── Activity
                          │     └── Add Expense Modal
                          ├── Goals
                          │     └── New Goal Modal
                          ├── Deep Insights
                          │     └── Widget Configurator Modal
                          └── Money Debrief
                                └── Reflection Flow
```

---

## 3. Core Screens

### Onboarding (3 Steps)
1. **Welcome** — One sentence explaining the product philosophy. No feature lists.
2. **Focus Picker** — "What matters to you?" (Track spending / Save for goals / Build habits). This shapes the experience without asking invasive financial questions.
3. **Name** — Just a first name. No income, no bank details, no salary bracket.

**Design reasoning:** Most finance app onboardings ask 10+ questions before showing value. FinPulse gets users to the dashboard in under 30 seconds.

### Dashboard
- **Net Cash Flow Card** — A single, large animated number showing Income minus Expenses for the month, with a proportional green/red bar visualizing the IN vs OUT ratio at a glance.
- **Quick Actions** — 4 high-contrast shortcut buttons (Expense, Income, Goal, Debrief) for the most common user intents.
- **Debrief Widget** — A mini wellness ring score linking to the weekly reflection.
- **Recent Activity** — Last 5 transactions with category color-coding and bucket labels.

### Activity
- **Transaction Log** — Chronologically sorted, visually grouped by date.
- **Add Expense Modal** — The centerpiece of the data-entry experience (detailed in Section 5).

### Goals
- **Visual Goal Cards** — Each goal shows a progress ring, current savings, target amount, and a motivational "X% there" label.
- **Quick Add** — One-tap goal creation with preset templates.

### Deep Insights
- **Expense Architecture Donut** — Always visible at top. Shows spending breakdown by the 3 buckets with exact amounts and percentages.
- **Configurable Widget Trackers** — Users add, remove, and rank-order analytics modules:
  - *Health vs Fast Food* — Compares nutrition investments against impulse food delivery
  - *EMI Safety Gauge* — Flags when non-home EMIs exceed 20% of outflow
  - *E-Commerce Splurge* — Tracks spending across Amazon, Myntra, Flipkart
  - *Subscriptions Auditor* — Itemizes recurring software/media drains

### Profile
- Display name and **Work Style** selector (Salaried / Freelance / Business / Student)
- Data reset option
- No income field — intentionally excluded

---

## 4. Unique Product Feature: The Weekly Money Debrief

**What it is:** A dedicated weekly reflection flow that takes ~60 seconds.

**Why it's different:** Most apps generate automated spending reports. FinPulse asks the user to *feel* their spending, not just see it.

### The Flow:
1. **Quick Summary** — Shows only variable spending (rent and EMIs are excluded — you can't "reconsider" rent)
2. **Emotional Check-In** — An emoji slider from 😰 to 😌 asking "How did you feel about money this week?"
3. **Regret Flagging** — The app surfaces top discretionary expenses and asks: "Any of these you'd reconsider?"
4. **Wellness Score** — A 0–100 composite score blending:
   - Quantitative: spending ratios, savings rate, one-off exclusion
   - Qualitative: user's emotional self-assessment and regret flags

**Why exclude necessities from reflection?** Asking someone to reconsider their rent payment is useless friction. The Debrief only surfaces expenses the user *can actually change*, making the entire reflection feel empowering instead of guilt-inducing.

---

## 5. User Flow: Adding an Expense

This is the most frequent user action, so it must be fast yet intentional.

```
Dashboard "Expense" button
    │
    ▼
┌─ Add Expense Modal ──────────────────────┐
│                                          │
│  ✕ (Cancel)              ✓ (Confirm)    │  ← Symmetrical header
│                                          │
│  ┌──────────────────────────────────┐    │
│  │     ₹ 0                         │    │  ← Amount display
│  └──────────────────────────────────┘    │
│                                          │
│  ┌───┬───┬───┐                           │
│  │ 1 │ 2 │ 3 │                           │
│  ├───┼───┼───┤                           │  ← Custom UPI-style
│  │ 4 │ 5 │ 6 │                           │     numeric keypad
│  ├───┼───┼───┤                           │
│  │ 7 │ 8 │ 9 │                           │
│  ├───┼───┼───┤                           │
│  │ . │ 0 │ ⌫ │                           │
│  └───┴───┴───┘                           │
│                                          │
│  Category: [🏠 Rent] [🍕 Food] [🛒 ...]│  ← Bucket-grouped chips
│                                          │
│  Quick Note: [Swiggy] [Amazon] [Gym]     │  ← Dynamic, category-
│              [Netflix] [Uber] [...]      │     aware auto-fill
│                                          │
│  ☐ One-time / Annual expense             │  ← Trend exclusion
└──────────────────────────────────────────┘
```

### Key Interaction Decisions:

| Element | Why |
|---|---|
| **Custom numpad instead of keyboard** | Typing "450" on a phone keyboard is error-prone. A large numpad grid feels like making a UPI payment — serious and intentional. |
| **Symmetrical ✕ / ✓ header** | Inspired by iOS modal patterns. The confirm button is top-right in green, cancel is top-left. No "Save" button at the bottom that could be accidentally tapped. |
| **Quick-fill note chips** | Users rarely want to type "Swiggy order" on a QWERTY keyboard. Tapping a chip is 10× faster and eliminates typos. Chips change dynamically based on the selected category. |
| **One-off toggle** | Annual insurance or a one-time flight should not spike weekly trend warnings or contaminate the Debrief reflection. |

---

## 6. Visual Design Quality

### Design System Foundations

| Token | Value | Rationale |
|---|---|---|
| Background | `#000000` (AMOLED black) | Maximum contrast, battery-efficient on OLED screens |
| Surface 1 | `#1C1C1E` | Apple HIG-inspired elevation for cards |
| Surface 2 | `#2C2C2E` | Secondary elevation for nested elements |
| Accent | `#0A84FF` (System Blue) | Universally trusted, high-contrast on dark backgrounds |
| Income | `#30D158` | Positive/growth association |
| Expense | `#FF453A` | Alert, but not aggressive |
| Typography | Inter | Optimized for financial numerals; excellent tabular figures |
| Card Radius | 28px | Consistent, modern, premium feel across all cards |

### Micro-Interactions
- **AnimatedNumber:** All financial figures use a custom `requestAnimationFrame` easeOutQuart roll-up animation — numbers "count up" like an Apple Card balance.
- **Tactile Squish:** All interactive buttons scale down 3% on tap (`whileTap={{ scale: 0.95 }}`) to provide physical feedback.
- **Spring Transitions:** Page transitions use spring physics (`stiffness: 300, damping: 30`) for organic, non-robotic motion.
- **Staggered Reveals:** Dashboard elements cascade in with 60ms stagger delays, creating a sense of the page "building itself."

### Contextual Navigation Colors
The bottom tab bar uses per-page accent colors when active:
- Home → Blue, Activity → Green, Goals → Orange, Insights → Blue, Debrief → Purple

This provides instant spatial orientation — users always know where they are without reading labels.

---

## 7. UX Reasoning — Key Design Choices

### Why no income field anywhere?
Displaying "Monthly Income: ₹45,000" on a profile screen tells users their worth is defined by a number. For freelancers with variable income, it's also inaccurate. FinPulse tracks what flows *in* and what flows *out* — the net position tells the same story without the psychological baggage.

### Why 3 buckets instead of 15 categories?
Granular categories create analysis paralysis. Users can't act on "you spent 4.2% on subscriptions." But they *can* act on "22% of your money went to things you chose, not things you needed." The 3-bucket model collapses complexity into clear, actionable insight.

### Why a custom numpad instead of the native keyboard?
Finance is emotional. Typing "12000" on a tiny phone keyboard between autocorrect suggestions feels casual. A dedicated, large-format numpad — like the one used in every UPI payment app — makes the act of logging money feel *serious* and *intentional*. This small friction is good friction.

### Why keyword-scanning in Insights instead of manual tagging?
Users will never tag a Swiggy order as "fast food" vs "nutrition." But if they type "Swiggy" or "Whey Protein" in the note field, the app can automatically classify it. This zero-effort intelligence is what makes the Deep Insights engine feel magical rather than tedious.

### Why is the Debrief a separate tab, not a notification?
Notifications are dismissible and feel like the app nagging you. A dedicated tab respects user agency — they visit when they *want* to reflect, not when they're told to. This makes the ritual voluntary and sustainable.

---

## 8. Assumptions Made

- Users are comfortable with mobile-first interfaces
- Transaction data would come from UPI/banking APIs in production (currently mocked)
- The prototype uses `localStorage` for persistence; a production version would use a proper database
- All financial data shown is simulated for demonstration purposes
- The 3-bucket categorization covers ~95% of young professional spending patterns

---

*FinPulse was designed and prototyped as a fully functional React application to demonstrate interaction design, micro-animation quality, and product thinking at a level beyond static mockups.*
