<div align="center">
  <img src="public/logo/fitplan-logo.png" alt="FitPlan AI Logo" width="80" />
  <h1>FitPlan AI</h1>
  <p><strong>AI-Powered Fitness Meal Planner — Personalized Nutrition in Seconds</strong></p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-8-FF6044?style=flat-square" alt="Features" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs" alt="Next.js 14" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai" alt="GPT-4o" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" /></a>
  </p>
</div>

---

## Overview

**FitPlan AI** is a full-stack SaaS application that generates personalized daily and weekly meal plans using OpenAI GPT-4o. Users input their body metrics, fitness goals, dietary preferences, cooking ability, and daily budget — and receive complete meal plans with recipes, macro breakdowns, cooking instructions, and grocery lists with cost estimates.

Built with a premium dark health-tech UI (Neon Coral + Space Black), the app targets health-conscious users aged 25–40 worldwide and runs on a freemium Stripe subscription model.

<div align="center">
  <img src="images/dashboard-preview.png" alt="Dashboard Preview" width="800" />
</div>

---

## Features

- **AI Meal Generation** — GPT-4o generates meal plans from user metrics with validated JSON output, macro-accurate breakdowns, cooking instructions, and grocery lists
- **Daily & Weekly Plans** — Choose single-day or full 7-day meal plans with day-by-day navigation
- **TDEE & Macro Calculation** — Mifflin-St Jeor BMR × activity multiplier with goal-based calorie adjustments and automatic macro splits
- **Budget-Aware Planning** — Meals respect daily budget constraints (INR/USD) with 10% tolerance validation
- **Allergen Safety** — Strict allergen exclusion passed to AI with validation on generated output
- **Subscription Tiers** — FREE (3 generations), PRO (50/mo, $9), ULTIMATE (unlimited, $29) via Stripe
- **Meal Plan Management** — Browse, favorite, share (public links), soft-delete, and download plans as PDF
- **Multi-Step Onboarding** — 3-step guided setup collecting body metrics, activity level, and dietary preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) via [Prisma ORM](https://www.prisma.io/) |
| **Auth** | [Clerk](https://clerk.com/) |
| **Payments** | [Stripe](https://stripe.com/) (subscriptions + webhooks) |
| **AI** | [OpenAI](https://openai.com/) (GPT-4o) |
| **Data Fetching** | [SWR](https://swr.vercel.app/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Toasts** | [Sonner](https://sonner.emilkowal.dev/) |
| **PDF** | [@react-pdf/renderer](https://react-pdf.org/) |
| **Testing** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Marketing landing page
│   ├── layout.tsx                        # Root layout (Clerk, fonts, toaster)
│   ├── globals.css                       # Theme variables & utility classes
│   ├── (marketing)/                      # Public pages
│   │   ├── pricing/                      # Pricing comparison
│   │   ├── features/                     # Features page
│   │   └── science/                      # Science behind the AI
│   ├── (auth)/                           # Clerk auth pages
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   ├── (dashboard)/                      # Protected routes
│   │   ├── layout.tsx                    # Sidebar + mobile nav + onboarding guard
│   │   ├── dashboard/                    # Stats, quick actions, recent plans
│   │   ├── onboarding/                   # 3-step profile setup
│   │   ├── meal-plans/                   # List (paginated, filterable)
│   │   │   ├── new/                      # AI generation form
│   │   │   └── [id]/                     # Detail view (day selector, macros, grocery)
│   │   ├── progress/                     # Progress tracking
│   │   ├── insights/                     # Analytics
│   │   └── settings/                     # Profile editing + subscription
│   ├── shared/[token]/                   # Public shared meal plan
│   └── api/
│       ├── generate-meal/                # AI generation endpoint
│       ├── meal-plans/                   # CRUD + favorite + share + download
│       ├── dashboard/stats/              # Dashboard statistics
│       ├── user/profile/                 # Profile GET/POST/PUT
│       ├── stripe/                       # Checkout + webhook
│       └── webhooks/clerk/               # User sync webhook
├── components/
│   ├── ui/                               # shadcn/ui primitives
│   ├── forms/                            # OnboardingForm, GenerationForm
│   ├── cards/                            # StatsCards, MealPlanCard, MealCard, etc.
│   ├── marketing/                        # Hero, Features, Pricing, Header, Footer
│   ├── shared/                           # EmptyState, ErrorBoundary, Skeletons
│   ├── chat/                             # AI Nutritionist chat
│   ├── snap/                             # Snap-to-Meal feature
│   └── pdf/                              # PDF renderer + download button
├── hooks/                                # SWR hooks (profile, plans, stats, subscription)
├── lib/                                  # Prisma client, OpenAI, Stripe, auth, validations
├── types/                                # All TypeScript interfaces
├── constants/                            # Enums, labels, multipliers, limits
└── prisma/
    └── schema.prisma                     # Database schema
```

---

## Data Models

```
User ──┬── UserProfile (body metrics, preferences, TDEE)
       ├── Subscription (tier, Stripe IDs, usage tracking)
       └── MealPlan[] ── SharedLink? (public share token)
```

**Key enums:** Gender, ActivityLevel, FitnessGoal (`FAT_LOSS` / `MUSCLE_GAIN` / `MAINTENANCE` / `ATHLETIC_PERFORMANCE`), DietaryPreference (`VEGETARIAN` / `NON_VEG` / `VEGAN` / `EGGETARIAN`), CuisinePreference (`INDIAN` / `CONTINENTAL` / `MIXED`), CookingAbility, PlanType (`DAILY` / `WEEKLY`), SubscriptionTier (`FREE` / `PRO` / `ULTIMATE`)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm / npm / yarn
- PostgreSQL database ([Supabase](https://supabase.com/) recommended)
- [Clerk](https://clerk.com/) account
- [Stripe](https://stripe.com/) account
- [OpenAI](https://platform.openai.com/) API key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/fitplan-ai.git
cd fitplan-ai
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ULTIMATE_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Push schema changes to DB |
| `npx tsc --noEmit` | Type-check without emitting |

---

## Design System

The app uses a **Neon Coral + Space Black** dark theme:

| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#121313` | Main page background |
| `brand-dark` | `#0D0D0D` | Sidebar, header background |
| `brand-teal` | `#FF6044` | Primary CTA, active states, links (Neon Coral) |
| `brand-amber` | `#FFB347` | Calories, favorites, marketing CTAs (Warm Amber) |
| `brand-mint` | `#3DD68C` | Success states, health indicators |
| `brand-purple-light` | `#FFB347` | Secondary badge text accent |

**UI utilities:** `.glass-card` (glassmorphism), `.glass-card-coral` (coral-tinted), `.gradient-text` (Coral→Amber gradient)

**Animations:** `fade-in-up`, `pulse-glow`, `float`, `gradient-flow`, `mesh-drift` — all respect `prefers-reduced-motion`.

---

## API Design

All API routes return a consistent response shape:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

All inputs validated with Zod. All routes wrapped in try/catch. Authentication via Clerk's `getOrCreateUser()` helper.

---

## Subscription Tiers

| Tier | Price | Generations/Month | Features |
|---|---|---|---|
| **Free** | $0 | 3 | Basic meal plans |
| **Pro** | $9/mo | 50 | Daily & weekly plans, favorites, sharing |
| **Ultimate** | $29/mo | Unlimited | Everything + priority generation |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use **Vitest** + **React Testing Library** with JSDOM environment. Test setup in `src/test/setup.ts`.

---

## Deployment

The app is configured for **Vercel** deployment:

1. Connect your GitHub repo to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

**Webhooks to configure:**
- **Clerk** → `https://your-domain.com/api/webhooks/clerk` (user.created event)
- **Stripe** → `https://your-domain.com/api/stripe/webhook` (subscription events)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code standards:**
- TypeScript strict mode — no `any` types
- Functional components with hooks only
- Server Components by default, `'use client'` only when needed
- File naming: kebab-case. Component naming: PascalCase
- All forms validated with Zod schemas
- All database queries through Prisma

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    Built with ❤️ using Next.js, OpenAI, and Tailwind CSS
  </p>
</div>
