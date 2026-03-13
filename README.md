# Mecat — Frontend

AI-powered investment marketplace connecting founders and investors. The frontend provides a seamless experience for founders to manage their business profiles and AI avatars, and for investors to discover opportunities and initiate deals.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **Auth:** Clerk
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Containerization:** Docker

---

## Team

| Name | Role |
|------|------|
| Gita | Project Manager |
| Rizain | Frontend Developer |
| Fayadh | Backend Developer |
| Bimo | AI Engineer |

---

## Folder Structure

```
frontend/
├── src/
│   ├── app/                              # Next.js App Router pages
│   │   ├── page.tsx                      # Landing page (/)
│   │   ├── layout.tsx                    # Root layout
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── auth/
│   │   │   ├── login/[[...sign-in]]/
│   │   │   │   └── page.tsx              # Clerk login page
│   │   │   ├── register/[[...sign-up]]/
│   │   │   │   └── page.tsx              # Clerk register page
│   │   │   └── redirect/
│   │   │       └── page.tsx              # Post-login redirect handler
│   │   ├── onboarding/
│   │   │   └── page.tsx                  # User onboarding (role selection)
│   │   ├── business/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # Business public profile
│   │   │       └── avatar/
│   │   │           ├── page.tsx          # AI avatar voice interaction
│   │   │           └── components/
│   │   │               ├── chat-panel.tsx       # Chat interface
│   │   │               ├── controls.tsx         # Voice call controls
│   │   │               ├── end-call-dialog.tsx  # End call dialog
│   │   │               └── wave.tsx             # Audio waveform
│   │   ├── dashboard/                    # Founder dashboard
│   │   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   │   ├── page.tsx                  # Main dashboard
│   │   │   ├── business/[id]/
│   │   │   │   └── page.tsx              # Business detail page
│   │   │   ├── mail/
│   │   │   │   ├── page.tsx              # Founder mail inbox
│   │   │   │   └── [id]/analyze/
│   │   │   │       └── page.tsx          # AI email analysis
│   │   │   ├── ai-configuration/
│   │   │   │   └── page.tsx              # AI assistant configuration
│   │   │   └── components/
│   │   │       ├── auth-guard.tsx        # Route protection (founder only)
│   │   │       ├── sidebar.tsx           # Dashboard navigation
│   │   │       ├── verification-form.tsx # Business verification form
│   │   │       ├── pending-dashboard.tsx # Pending verification view
│   │   │       ├── verified-dashboard.tsx # Verified business view
│   │   │       └── context/
│   │   │           └── business-context.tsx  # Business context provider
│   │   ├── home/                         # Investor section
│   │   │   ├── layout.tsx                # Home layout with sidebar
│   │   │   ├── page.tsx                  # Investor discover page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Investor deal dashboard
│   │   │   ├── mail/
│   │   │   │   └── page.tsx              # Investor mail inbox
│   │   │   ├── profile/
│   │   │   │   └── page.tsx              # Investor profile
│   │   │   └── components/
│   │   │       ├── home-sidebar.tsx      # Investor navigation
│   │   │       ├── investor-guard.tsx    # Route protection (investor only)
│   │   │       ├── masonry-card.tsx      # Business discovery card
│   │   │       └── masonry-grid.tsx      # Masonry grid layout
│   │   ├── profile/
│   │   │   └── profile-view.tsx          # User profile view
│   │   ├── uploads/[...path]/
│   │   │   └── route.ts                  # Dynamic file serving
│   │   └── components/
│   │       ├── navbar.tsx                # Top navigation bar
│   │       └── section-reveal.tsx        # Scroll reveal animation
│   ├── api/                              # Next.js API routes (proxy to backend)
│   │   ├── auth/
│   │   │   ├── clerk.ts                  # Clerk webhook handler
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── v1/
│   │       ├── business/route.ts
│   │       ├── investors/route.ts
│   │       ├── knowledge/route.ts
│   │       ├── profile/route.ts
│   │       └── voice/route.ts
│   ├── components/
│   │   ├── mail/
│   │   │   └── index.tsx                 # Shared mail display component
│   │   └── ui/                           # shadcn/ui components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── textarea.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   ├── use-audio-analyzer.ts         # Audio analysis for voice features
│   │   ├── use-mobile.tsx                # Mobile device detection
│   │   ├── use-my-business.ts            # Business context hook
│   │   └── use-voice-session.ts          # Voice session management
│   ├── lib/
│   │   ├── api.ts                        # API client (fetch wrapper)
│   │   ├── utils.ts                      # Utility functions
│   │   ├── onboarding/schemas.ts         # Zod schema for onboarding
│   │   └── verify/schemas.ts             # Zod schema for verification
│   ├── types/
│   │   ├── api.generated.ts              # Auto-generated types from OpenAPI
│   │   ├── business.ts                   # Business-related types
│   │   └── visual.ts                     # UI/visual types
│   └── proxy.ts                          # Backend proxy configuration
├── public/                               # Static assets
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── Dockerfile
└── package.json
```

---

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/auth/login` | Clerk sign-in | Public |
| `/auth/register` | Clerk sign-up | Public |
| `/auth/redirect` | Post-login role redirect | Authenticated |
| `/onboarding` | Role selection (Founder / Investor) | Authenticated |
| `/business/[slug]` | Business public profile | Public |
| `/business/[slug]/avatar` | AI avatar voice call interface | Authenticated (Investor) |
| `/dashboard` | Founder main dashboard | Founder |
| `/dashboard/business/[id]` | Founder business detail & management | Founder |
| `/dashboard/mail` | Founder email inbox | Founder |
| `/dashboard/mail/[id]/analyze` | AI-powered email analysis | Founder |
| `/dashboard/ai-configuration` | Configure AI assistant knowledge base | Founder |
| `/home` | Investor discover page (business cards) | Investor |
| `/home/dashboard` | Investor deal pipeline | Investor |
| `/home/mail` | Investor email inbox | Investor |
| `/home/profile` | Investor profile settings | Investor |
| `/profile` | User profile view | Authenticated |

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- Backend server running (see [backend README](../backend/README.md))

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/register"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/auth/redirect"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/auth/redirect"
```

### 3. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Available Scripts

```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run generate:types   # Generate API types from OpenAPI spec
```

---

## AI Disclosure

During the development process, we leveraged AI tools to accelerate our workflow. **Claude** and **Gemini** were used for brainstorming logic, designing schemas, and debugging complex issues. Meanwhile, **Cursor** was utilized as our primary AI-powered IDE to seamlessly implement these features and integrate the schemas directly into the code.
