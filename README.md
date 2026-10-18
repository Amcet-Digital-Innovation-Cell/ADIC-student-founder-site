# Founder Requirement Web Application

> **Where founders requisition talent, verified by university EDC cells.**  
> Direct, transparent connection between student builders, early-stage founders, and Entrepreneurship Development Cells (EDC / E-Cells).

---

## 🌟 Core Architecture & 3-Role Ecosystem

### 🎓 1. Student Flow
- **Sign In & Comprehensive Registration**:
  - Collects **Personal Details** (Name, Email, Password, Phone).
  - Collects **Academic Information** (Department / Branch e.g. CSE, AI & DS, IT, ECE, Mechanical, MBA; College / University Name; Year of Study; Roll / Student ID).
  - Collects **Verified Links** (🔗 **LinkedIn Profile URL**, 🐙 **GitHub Profile URL**, 🌐 **Portfolio / Resume Website Link**).
  - Collects **Tech Stack / Skills** (interactive skill chips) and **Bio / Pitch**.
- **Live Requirements Board**:
  - Browse only **EDC-approved** founder requisitions.
  - Clicking **"Apply — email founder directly"** automatically packages the student's name, department, college, and clickable LinkedIn/GitHub links into the founder's pitch email.
- **Application Tracking**:
  - Live tracking of application status (`In Review`, `Interviewing`, `Selected`).
- **Profile Management**:
  - Edit and update LinkedIn, GitHub, Department, and Skills anytime via the profile modal.

---

### 🚀 2. Founder Flow
- **Post Talent Requisition**:
  - Post open roles with required tech stack, location, stipend, and project scope.
- **Automatic EDC Verification Routing**:
  - Every new requirement is submitted with status **`PENDING_APPROVAL`** and immediately routed to the **EDC Incubation Cell**.
  - Posts remain hidden from the public student board until verified by the EDC Cell.
- **Candidate Inflow Tracking**:
  - Review student applicants complete with their department credentials, GitHub repositories, LinkedIn profiles, and pitch notes.

---

### 🏛️ 3. EDC Cell (Incubation Hub) Flow
- **Requisition Verification & Approval Desk (`/edc`)**:
  - View all founder requirement posts categorized by:
    - **⏳ Pending EDC Review**: Requisitions awaiting approval.
    - **✅ Approved & Live**: Requisitions verified and active on the student board.
    - **❌ Rejected**: Requisitions flagged or hidden.
- **1-Click Approval Action**:
  - Clicking **"✅ Approve & Publish"** stamps the requirement with the EDC Chapter's seal, timestamps it, and **immediately publishes it live to the student side requirements page (`/requirements`)**.
  - Direct rejection action with reason feedback.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with curated retro-editorial design tokens (ink, paper, mustard, sage, rust)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Session**: React Context (`lib/AuthContext.tsx`) with automatic `localStorage` persistence and quick 1-click demo access

---

## 📁 Project Structure

```
founder-requirement-web/
├── app/
│   ├── page.tsx                  # Home / Landing portal with 3-role cards
│   ├── layout.tsx                # Root layout with AuthProvider, AuthGate, Navbar, Footer
│   ├── globals.css               # Editorial color theme, utilities & animations
│   ├── login/page.tsx            # Role-tailored Sign In & Registration portal
│   ├── register/page.tsx         # Direct register endpoint
│   ├── requirements/page.tsx     # Student Requirements Board & Founder Post Form
│   ├── edc/page.tsx              # EDC Hub: Founder Requisition Verification & Approval Desk
│   ├── applications/page.tsx     # Student Application Tracking & Founder Candidate Inflow
│   ├── dashboard/page.tsx        # Personalized role analytics dashboard
│   ├── startups/page.tsx         # Startup directory listings
│   └── startups/[id]/page.tsx    # Individual startup overview and open roles
├── components/
│   ├── auth/
│   │   ├── AuthGate.tsx          # Auth wrapper
│   │   └── AuthGateway.tsx       # Onboarding gateway & registration component
│   ├── ui/
│   │   ├── badge.tsx             # Badge UI primitive
│   │   ├── button.tsx            # Button component with primary/outline/ghost variants
│   │   ├── card.tsx              # Card UI primitive
│   │   ├── input.tsx             # Form Input primitive
│   │   └── textarea.tsx          # Form Textarea primitive
│   ├── Navbar.tsx                # Dynamic navbar with Home icon, role badges & profile menu
│   ├── Footer.tsx                # Global footer
│   ├── RequirementCard.tsx       # Requirement card with EDC Verified badge & auto-fill apply modal
│   ├── ApplicationForm.tsx       # Founder requisition submission form with EDC routing
│   ├── StartupCard.tsx           # Startup company card
│   └── UserProfileModal.tsx      # Modal for viewing & updating LinkedIn/GitHub/Dept credentials
├── lib/
│   ├── AuthContext.tsx           # Session management, 3-role state, and demo user store
│   ├── api.ts                    # Backend API calls, EDC approval store & seed fallbacks
│   └── utils.ts                  # ClassName concatenation utilities (clsx/tailwind-merge)
├── types/
│   └── index.ts                  # Shared TypeScript interfaces (Requirement, StudentProfile, AuthUser, etc.)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## ⚡ Instant 1-Click Demo Accounts

For testing all 3 roles without manual data entry, use the 1-Click Demo buttons on the Home page or Sign-In screen:

| Role | Demo User | Details |
| :--- | :--- | :--- |
| **🎓 Student** | **Priya Sharma** | Computer Science & Engineering · 3rd Year · IIT Madras · Linked GitHub & LinkedIn |
| **🚀 Founder** | **Arun Kumar** | Founder of *Ash & Bolt* · B2B SaaS · Remote / Bengaluru |
| **🏛️ EDC Cell** | **Dr. K. Ramesh** | Faculty In-Charge & Incubation Lead · *IIT Madras E-Cell* |

---

## 🔌 Connecting an External Backend (Optional)

By default, `lib/api.ts` uses client-side state with local persistence so the app works standalone. To connect a Node.js / Express REST backend:

1. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
2. `lib/api.ts` will send requests to your backend endpoints and automatically fallback if offline.
