# Project Instructions for AI Agent

## Project: FitPlan AI
An AI-powered fitness meal and workout planner SaaS application targeting global users.
Monetization: Freemium with Stripe subscriptions ($9/mo Pro, $29/mo Ultimate).

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode — no `any` types)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL) with Prisma ORM
- **Auth:** Clerk
- **Payments:** Stripe (subscriptions + webhooks)
- **AI:** OpenAI API (GPT-4o)
- **Deployment:** Vercel
- **Testing:** Vitest + React Testing Library

## Development Methodology: Spec-Driven Development
This project follows a strict spec-driven workflow. All features go through:
1. Requirements (EARS format) → `.claude/specs/{feature}/requirements.md`
2. Design (architecture + data models) → `.claude/specs/{feature}/design.md`
3. Tasks (implementation checklist) → `.claude/specs/{feature}/tasks.md`
4. Implementation (code per task) → mark tasks [x] in tasks.md
5. Testing (test docs + test code)

**IMPORTANT:** Always read the spec files in `.claude/specs/` before implementing anything.
If specs exist for a feature, follow them EXACTLY. Do not add features not in requirements.
Do not skip requirements. Do not deviate from the design architecture.

## Code Standards
1. TypeScript strict mode — NEVER use `any` type
2. All components are functional with hooks
3. Server Components by default, `'use client'` only when needed
4. All API routes return: `{ success: boolean, data?: T, error?: string }`
5. All API routes wrapped in try/catch with proper error responses
6. All forms validated with Zod schemas
7. All database queries through Prisma
8. File naming: kebab-case. Component naming: PascalCase
9. Import order: React → Next → External libs → Internal → Types
10. Comments only for complex business logic

## UI Standards
1. Mobile-first responsive design
2. Use shadcn/ui components (already installed)
3. Tailwind only — no custom CSS files
4. Loading states for ALL async operations (use Skeleton components)
5. Error states with retry options
6. Empty states with helpful messages
7. Toast notifications via sonner
8. Smooth transitions with framer-motion
9. All interactive elements have hover/focus/active states
10. Accessibility: labels, ARIA, keyboard navigation

## Project Structure
src/
├── app/
│ ├── (marketing)/ # Landing page, pricing
│ │ └── page.tsx
│ ├── (auth)/ # Sign in, sign up
│ │ ├── sign-in/
│ │ └── sign-up/
│ ├── (dashboard)/ # Protected routes
│ │ ├── layout.tsx # Dashboard layout with sidebar
│ │ ├── dashboard/
│ │ ├── meal-plans/
│ │ ├── workouts/
│ │ └── settings/
│ ├── api/
│ │ ├── generate-meal/
│ │ ├── generate-workout/
│ │ ├── stripe/
│ │ │ ├── create-checkout/
│ │ │ └── webhook/
│ │ └── user/
│ ├── layout.tsx
│ └── globals.css
├── components/
│ ├── ui/ # shadcn/ui components
│ ├── forms/ # Form components
│ ├── cards/ # Card components
│ ├── layout/ # Header, Sidebar, Footer
│ └── shared/ # Reusable components
├── lib/
│ ├── openai.ts # OpenAI client
│ ├── stripe.ts # Stripe client
│ ├── supabase.ts # Supabase client
│ ├── utils.ts # Utility functions
│ └── validations.ts # Zod schemas
├── prisma/
│ └── schema.prisma
├── hooks/ # Custom React hooks
├── types/ # TypeScript types
│ └── index.ts
└── constants/ # App constants
└── index.ts

## When Implementing a Task
1. Read ALL spec files first (requirements.md, design.md, tasks.md)
2. Implement ONLY the specified task
3. Follow the design document's architecture EXACTLY
4. Handle ALL edge cases from requirements
5. Add loading + error states
6. Make it responsive (mobile-first)
7. After completing, mark task as [x] in tasks.md
8. Run `npx tsc --noEmit` to verify no type errors
9. Do NOT implement tasks that aren't assigned

## Error Handling Pattern
```typescript
// API Route pattern
export async function POST(req: Request) {
  try {
    // Validate input with Zod
    const body = await req.json()
    const validated = schema.parse(body)
    
    // Business logic
    const result = await doSomething(validated)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}