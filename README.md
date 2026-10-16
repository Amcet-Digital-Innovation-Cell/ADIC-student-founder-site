# FounderHub

> **Where founders requisition talent, verified by university EDC cells.**  
> A full-stack platform connecting student builders, early-stage founders, and Entrepreneurship Development Cells (EDC / E-Cells) — powered by **Next.js 15**, **Express**, and **Supabase**.

---

## 🌟 Overview

FounderHub is a role-gated talent marketplace built around a **3-role ecosystem**:

| Role | Description |
| :--- | :--- |
| 🎓 **Student** | Browse EDC-verified job requisitions, apply directly via pre-filled email, and track application status |
| 🚀 **Founder** | Post talent requirements that are auto-routed to the EDC for verification before going live |
| 🏛️ **EDC Cell** | Approve or reject founder posts; verified posts are instantly published to the student board |

---

## 🏗️ Architecture

This is a **monorepo** with two independently deployable services:

```
Founder-hub-main/
├── frontend/          # Next.js 15 app (App Router)
└── backend/           # Express REST API (TypeScript + tsx)
```

Both services share a **Supabase** project as the source of truth for authentication, user profiles, requirements, startups, and applications.

```
Browser → Next.js Frontend → Express Backend → Supabase (Postgres + Auth)
                   ↑
           Supabase Auth SDK (client-side session management)
```

---

## 🎭 3-Role Ecosystem

### 🎓 Student Flow
- **Registration**: Name, email, password, department/college/year, LinkedIn, GitHub, portfolio, tech skills, bio, and availability.
- **Requirements Board** (`/requirements`): Browse only EDC-approved founder requisitions; click **"Apply — email founder directly"** to send a pre-filled pitch email with name, department, college, and profile links.
- **Application Tracking** (`/applications`): Live status tracking — `In Review`, `Interviewing`, `Selected`.
- **Profile Management**: Edit LinkedIn, GitHub, department, skills, and bio via the profile modal.

### 🚀 Founder Flow
- **Post Requisition** (`/requirements`): Open roles with required tech stack, location, stipend, and project scope.
- **Auto EDC Routing**: Every new post is created with `PENDING_APPROVAL` status and is **invisible to students** until the EDC approves it.
- **Candidate Inflow** (`/applications`): Review applicants with department credentials, GitHub repos, LinkedIn profiles, and pitch notes.

### 🏛️ EDC Cell Flow
- **Verification Desk** (`/edc`): Posts categorized as ⏳ Pending, ✅ Approved & Live, or ❌ Rejected.
- **1-Click Approval**: Stamping a requisition with the EDC seal immediately publishes it to the student board.
- **EDC Role Security**: The `edc` role is **never self-assignable** — it is granted exclusively to user IDs listed in the backend's `EDC_USER_IDS` environment variable, enforced server-side on every request.

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
| Tech | Purpose |
| :--- | :--- |
| [Next.js 15](https://nextjs.org/) (App Router) | Framework — server & client components |
| [TypeScript](https://www.typescriptlang.org/) | Strict type safety |
| [Tailwind CSS v3](https://tailwindcss.com/) | Styling with custom editorial design tokens |
| [Lucide React](https://lucide.dev/) | Icon library |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) | Auth client SDK |
| React Context (`lib/AuthContext.tsx`) | Session state with `localStorage` persistence |

### Backend (`/backend`)
| Tech | Purpose |
| :--- | :--- |
| [Express 4](https://expressjs.com/) | REST API server |
| [TypeScript + tsx](https://github.com/privatenumber/tsx) | Type-safe server with hot-reload dev |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) | Supabase Admin SDK (service role) |
| Supabase Postgres | Requirements, startups, applications, and profiles |

---

## 📁 Project Structure

```
Founder-hub-main/
│
├── frontend/                        # Next.js 15 application
│   ├── app/
│   │   ├── layout.tsx               # Root layout — AuthProvider, AuthGate, Navbar, Footer
│   │   ├── page.tsx                 # Home / landing portal with 3-role entry cards
│   │   ├── globals.css              # Editorial color theme, utilities & animations
│   │   ├── login/page.tsx           # Role-tailored sign-in & registration portal
│   │   ├── register/page.tsx        # Direct registration endpoint
│   │   ├── requirements/page.tsx    # Student board & founder post form
│   │   ├── edc/page.tsx             # EDC verification & approval desk
│   │   ├── applications/page.tsx    # Student tracking & founder candidate inflow
│   │   ├── dashboard/page.tsx       # Role-specific analytics dashboard
│   │   ├── startups/page.tsx        # Startup directory
│   │   └── startups/[id]/page.tsx   # Individual startup profile & open roles
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthGate.tsx         # Route protection wrapper
│   │   │   └── AuthGateway.tsx      # Onboarding gateway & registration component
│   │   ├── ui/                      # Primitive UI components (badge, button, card, input, textarea)
│   │   ├── Navbar.tsx               # Dynamic navbar with role badges & profile menu
│   │   ├── Footer.tsx               # Global footer
│   │   ├── RequirementCard.tsx      # Requirement card with EDC Verified badge & apply modal
│   │   ├── ApplicationForm.tsx      # Founder requisition form with EDC routing
│   │   ├── StartupCard.tsx          # Startup company card
│   │   └── UserProfileModal.tsx     # View & update LinkedIn / GitHub / dept credentials
│   ├── lib/
│   │   ├── AuthContext.tsx          # Supabase session management, 3-role state & demo store
│   │   ├── api.ts                   # Backend API calls with Supabase auth headers
│   │   ├── supabase.ts              # Supabase client initialisation
│   │   └── utils.ts                 # clsx / tailwind-merge helper
│   ├── types/index.ts               # Shared TypeScript interfaces (AuthUser, Requirement, etc.)
│   ├── .env.example                 # Environment variable template
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                         # Express REST API
│   ├── src/
│   │   ├── index.ts                 # All API routes, auth middleware & role enforcement
│   │   ├── config/env.ts            # Validated environment variables (EDC_USER_IDS, etc.)
│   │   ├── lib/supabase.ts          # Supabase Admin client (service role)
│   │   └── data/seed.ts             # In-memory seed data (requirements, startups, applications)
│   ├── supabase/migrations/         # SQL migrations for Postgres schema
│   ├── .env                         # Environment variables (do NOT commit)
│   ├── package.json
│   └── tsconfig.json
│
├── app/                             # Root-level Next.js pages (shared / legacy routes)
├── components/                      # Root-level shared components
├── lib/                             # Root-level shared lib
├── types/                           # Root-level shared types
├── .gitignore
├── package.json                     # Root workspace package
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- A [Supabase](https://supabase.com/) project (free tier works)

---

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Founder-hub-main
```

---

### 2. Configure the Backend

```bash
cd backend
```

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000

# Comma-separated Supabase user UUIDs granted the EDC admin role
EDC_USER_IDS=uuid-1,uuid-2,uuid-3
```

Install and start:

```bash
npm install
npm run dev
# API runs at http://localhost:4000/api
```

---

### 3. Configure the Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Must match PORT in backend/.env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Install and start:

```bash
npm install
npm run dev
# App runs at http://localhost:3000
```

---

### 4. Run the Database Migrations

Apply the Supabase SQL migrations in order from `backend/supabase/migrations/`:

```
202609280001_core_tables.sql
202609290001_application_resume_storage.sql
202610050001_profiles.sql
202610070002_core_tables.sql
```

Run them via the **Supabase Dashboard → SQL Editor** or the Supabase CLI:

```bash
supabase db push
```

---

### 5. Build for Production

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build
node dist/index.js
```

---

## ⚡ Demo Accounts (1-Click Access)

For testing all 3 roles without registration, use the 1-Click Demo buttons on the Home page or Sign-In screen:

| Role | Demo User | Details |
| :--- | :--- | :--- |
| 🎓 **Student** | **Priya Sharma** | CSE · 3rd Year · IIT Madras · GitHub & LinkedIn linked |
| 🚀 **Founder** | **Arun Kumar** | Founder of *Ash & Bolt* · Manufacturing SaaS · Bengaluru / Remote |
| 🏛️ **EDC Cell** | **Dr. K. Ramesh** | Faculty In-Charge & Incubation Head · IIT Madras E-Cell |

> **Note:** The EDC demo account is view-only locally. Real EDC approval actions require a Supabase account whose UUID is listed in `EDC_USER_IDS`.

---

## 🔐 Authentication & Security

- Authentication is handled by **Supabase Auth** (email + password).
- The frontend uses the Supabase JS SDK to manage sessions and stores a hydrated user object in `localStorage` for instant load (with a background refresh on every mount).
- The backend validates every protected request using the **Bearer token** from the Supabase session, calling `supabase.auth.getUser()` server-side.
- The **EDC role** is enforced exclusively on the backend via the `EDC_USER_IDS` allowlist — it cannot be self-assigned through client-side metadata or the registration form.

---

## 🗄️ Backend API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
| :----- | :------- | :--- | :---------- |
| `GET` | `/api/requirements` | Optional | List all EDC-approved requirements |
| `POST` | `/api/requirements` | Required (Founder) | Submit a new requirement (`PENDING_APPROVAL`) |
| `PATCH` | `/api/requirements/:id/approve` | Required (EDC) | Approve & publish a requirement |
| `PATCH` | `/api/requirements/:id/reject` | Required (EDC) | Reject a requirement |
| `GET` | `/api/startups` | Optional | List all startups |
| `GET` | `/api/startups/:id` | Optional | Get a single startup |
| `GET` | `/api/applications` | Required | Get applications (scoped to user role) |
| `POST` | `/api/applications` | Required (Student) | Submit a new application |
| `PATCH` | `/api/applications/:id` | Required (Founder/EDC) | Update application status |
| `GET` | `/api/profile/me` | Required | Get the authenticated user's profile |
| `PUT` | `/api/profile/me` | Required | Update the authenticated user's profile |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

This project is private. All rights reserved.
