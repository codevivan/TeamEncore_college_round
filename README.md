# AXON — Git-Native Visual Patching

> **Hotfix the Internet.** AXON bridges browser-based visual editing directly to production Git workflows, enabling engineering and design teams to stage, verify, and deploy live UI hotfixes without complex rebuild cycles.

---

## Overview

Modern web teams often spend hours or days running complete build and CI/CD pipelines just to fix urgent visual defects, padding misalignments, critical broken copy, or styling bugs in production.

**AXON** provides a secure, Git-native visual patching control plane. Using the AXON Chrome Extension, engineers and designers inspect and modify live DOM/CSS rules directly on target sites. AXON captures these modifications, tests them against perceptual visual regression baselines, verifies conflicts against incoming Git commits, and allows one-click edge deployment or Git PR generation.

---

## Key Features

- **Chrome Extension Visual Editor**: In-browser inspector and sidepanel to select DOM elements, apply atomic CSS hotfixes, and capture visual patches in real-time.
- **Git-Native Patch Control Plane**: Manages visual patches across branches, automatically generates Git commits, and integrates with existing developer workflows.
- **Perceptual Diff & Visual Verification**: Automated diff engine verifying candidate hotfixes against production baseline screenshots with tolerance thresholds.
- **Conflict Detection & Rollbacks**: Analyzes collision hazards between overlapping CSS rules and staged patches; supports instant zero-downtime rollbacks.
- **Real-Time Multiplayer Collaboration**: High-frequency cursor tracking, presence sync, and live session locking so teams don't step on each other's patches.
- **Comprehensive Audit Trail**: Tamper-evident activity logs capturing every patch creation, extension pairing, deployment, and rollback.
- **Integrations Hub**: Native integration support with **GitHub**, **Vercel**, **Netlify**, and **Supabase**.
- **Role-Based Authentication**: Built with Clerk SSO supporting GitHub/Google login, workspace permissions, and secure extension session pairing.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Web App** | React 19, TypeScript, Vite 7, TailwindCSS 4, Wouter, Radix UI, Framer Motion, Zustand |
| **Backend API** | Node.js, Express, tRPC 11, SuperJSON |
| **Database & ORM** | Drizzle ORM (MySQL) & Supabase PostgREST sync |
| **Browser Extension** | Chrome Extension Manifest V3 (Sidepanel, Content Script, Background Service Worker) |
| **Auth & Security** | Clerk Authentication (`@clerk/clerk-react`), CSRF nonces, scoped extension pairing codes |
| **Testing** | Vitest |
| **Package Manager** | pnpm 10 |

---

## Project Structure

```
axon/
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI & layout components (Radix + Tailwind)
│   │   ├── contexts/           # Theme and UI context providers
│   │   ├── lib/                # State management (patchworkStore) & tRPC client
│   │   ├── pages/              # Primary application route views
│   │   │   ├── integrations/   # Dedicated integration management views
│   │   │   ├── settings/       # Dedicated workspace & security settings views
│   │   │   └── ...             # Dashboard, Patches, Verification, Projects, etc.
│   │   ├── App.tsx             # Main client router & Clerk authentication wrapper
│   │   └── main.tsx            # Application entrypoint
│   └── public/                 # Static assets and icons
├── server/                     # Backend API & Server Services
│   ├── _core/                  # Core Express server, vite middleware, tRPC & config
│   ├── data/                   # Default local workspace state store
│   ├── db.ts                   # Drizzle ORM database connection
│   ├── patchworkApi.ts         # REST API for AXON dashboard and Chrome extension
│   ├── routers.ts              # tRPC root procedure routers
│   ├── store.ts                # In-memory and persisted workspace state manager
│   └── supabase.ts             # Supabase sync client for Git versions and audit events
├── extension/                  # Chrome Extension (Manifest V3)
│   ├── manifest.json           # Extension permissions and configurations
│   ├── background.js           # Service worker handling pairing & messaging
│   ├── content.js              # In-page DOM inspector and live patch applicator
│   └── sidepanel/              # Chrome extension visual editing sidepanel
├── drizzle/                    # Drizzle schema definitions and migrations
└── patches/                    # Package-level patch files (e.g., wouter router patch)
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **pnpm**: `v10.x` (or enable via `corepack enable`)

### 1. Installation

Clone the repository and install dependencies using `pnpm`:

```bash
git clone https://github.com/your-username/axon.git
cd axon
corepack enable
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key for authentication | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Alternative Clerk Key name (mirrored) | Optional |
| `PORT` | Local server port (default `3000`) | Optional |
| `DATABASE_URL` | MySQL connection string for Drizzle ORM | Optional (falls back to local JSON store) |
| `SUPABASE_URL` | Supabase project URL for Git version sync | Optional |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | Optional |

### 3. Running Locally

Start the unified development server (Express API + Vite HMR):

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Loading the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the upper right.
3. Click **Load unpacked**.
4. Select the `extension/` directory inside this repository.
5. In the AXON web app, navigate to **Settings > Chrome Extension** or `/extension/connect` to generate a 6-digit pairing code and link your browser.

---

## Build & Testing

### Type-Check
```bash
pnpm check
```

### Run Automated Tests
```bash
pnpm test
```

### Production Build
```bash
pnpm build
```

This compiles:
- The Vite frontend to `dist/`
- The standalone server bundle to `dist-server/index.js`
- The Vercel serverless function to `api/index.js`

### Run Production Server
```bash
pnpm start
```

---

## Docker Deployment

Build and run using the optimized Docker container:

```bash
docker build -t axon .
docker run -p 3000:3000 --env-file .env axon
```

---

## Security

- Private API keys, database connection strings, and webhook secrets are exclusively handled on the server.
- Session cookies are strictly isolated with `HttpOnly`, `SameSite=None`, and `Secure` attributes.
- Chrome Extension communication uses cryptographically randomized one-time pairing codes with 15-minute expiration windows.
- Tamper-evident audit logging registers all patch activations, edits, and rollbacks.

---

## License

This project is licensed under the [MIT License](LICENSE).
