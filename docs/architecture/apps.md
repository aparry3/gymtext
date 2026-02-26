# App Structure

## Web App (`apps/web`)
Consumer-facing application at gymtext.com.

### Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/start` | Onboarding flow |
| `/chat` | Chat interface |
| `/me/*` | User dashboard/profile |
| `/blog` | Blog listing and articles |
| `/anatomy` | Anatomy reference pages |
| `/brands` | Brand partnership pages |
| `/ihg` | IHG landing page |
| `/norrona` | Norrona landing page |
| `/opt-in` | Opt-in/consent pages |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### API Routes (~16 groups)
auth, blog, checkout, cron, health, inngest, messages, short-links, start, stripe, track, twilio, users, whatsapp, whatsapp-cloud

### Cron Jobs (from `vercel.json`)
| Schedule | Endpoint | Max Duration |
|----------|----------|-------------|
| Hourly (`0 * * * *`) | `POST /api/cron/daily-messages` | 300s |
| Weekly Sun (`0 * * * 0`) | `POST /api/cron/weekly-messages` | 60s |
| Every 5min (`*/5 * * * *`) | `POST /api/cron/check-stalled-queues` | 60s |
| Daily 3am (`0 3 * * *`) | `POST /api/cron/cleanup-agent-logs` | 60s |

## Admin App (`apps/admin`)
Admin portal at admin.gymtext.com. Protected by phone-based SMS authentication.

### Pages (under `/(protected)/` route group)
| Route | Purpose |
|-------|---------|
| `/login` | Authentication (unprotected) |
| `/agents` | Manage AI agent definitions |
| `/agent-logs` | Agent invocation history |
| `/exercises` | Exercise database management |
| `/messages` | Message queue monitoring |
| `/program-owners` | Program owner management |
| `/programs` | Fitness program management |
| `/users` | User management and impersonation |

### API Routes (~11 groups)
auth, agents, agent-logs, dashboard, exercises, enrollments, messages, program-owners, programs, users, cron/trigger

### Authentication
- Phone-based SMS verification with whitelist
- `ADMIN_PHONE_NUMBERS` env var (comma-separated E.164 phone numbers)
- `gt_admin=ok` cookie (httpOnly, secure in prod, 30-day expiry)
- Rate limiting: max 3 code requests per 15 minutes per phone
- Codes expire after 10 minutes
- Admin users don't need user accounts — just whitelisted phone numbers

### Environment Toggle
Admin UI includes an environment switcher (production/sandbox) stored in `gt_env` cookie. See [Environment Context](./environment-context.md).

## Programs Portal (`apps/programs`)
Partner portal for fitness program owners at localhost:3002. SMS-based authentication for registered program owners.

### Pages (under `/(protected)/` route group)
| Route | Purpose |
|-------|---------|
| `/login` | SMS verification login |
| `/` | Dashboard (program stats, enrollment counts) |
| `/programs` | List all owner's programs |
| `/programs/new` | Create new program |
| `/programs/[id]` | Program detail with tabs: Template, Questions, Settings |
| `/blog` | Blog posts list with status filters |
| `/blog/new` | Create new blog post (TipTap rich text editor) |
| `/blog/[id]` | Edit blog post with preview, SEO metadata, image upload |

### API Routes (~3 groups)

| Route Group | Purpose |
|------------|---------|
| `/api/auth/` | SMS verification (request-code, verify-code, logout) |
| `/api/programs/` | Program CRUD, versions, enrollment questions, template generation |
| `/api/blog/` | Blog CRUD, publish/unpublish, image upload, AI metadata generation |

### Authentication
- SMS-based login (no password, no whitelist — registered program owners only)
- `gt_programs_owner` cookie (30-day expiry)
- 6-digit verification codes via Twilio
- Owner context via `OwnerContext.tsx` React context

### Key Features
- **Program management**: Create/edit programs with scheduling mode, cadence, billing model
- **Version control**: Multiple versions per program with published/draft states
- **Enrollment questions**: 5 question types (text, select, multiselect, scale, boolean)
- **Blog system**: Rich text editor (TipTap), cover images, SEO metadata, AI-assisted metadata generation
- **Program visibility**: Public/private toggle, activation/deactivation

---

## Shared Package (`packages/shared`)

### Export Paths
```json
{
  ".": "@gymtext/shared",           // General utilities
  "./server": "@gymtext/shared/server",  // Server-side (services, agents, repos)
  "./shared": "@gymtext/shared/shared"   // Shared client/server utilities
}
```

### Directory Structure
```
packages/shared/src/
├── server/
│   ├── agents/          # Agent system (runner, tools, context, types)
│   ├── connections/     # External service factories
│   ├── context/         # EnvironmentContext system
│   ├── models/          # Database schema and types
│   ├── repositories/    # Data access layer (30+ repos)
│   ├── services/        # Business logic
│   │   ├── orchestration/  # Workflow coordination
│   │   ├── domain/         # Business domains (16 folders)
│   │   └── agents/         # Agent service wrappers
│   └── utils/           # Server utilities
├── shared/              # Client/server shared utils
│   └── utils/           # Date, timezone, phone, etc.
└── index.ts             # Main exports
```

### Import Patterns
```typescript
// Client-safe imports
import { formatForUI } from '@gymtext/shared';

// Server-only imports (database, services, agents)
import { createProductionContext, createServices } from '@gymtext/shared/server';
```
