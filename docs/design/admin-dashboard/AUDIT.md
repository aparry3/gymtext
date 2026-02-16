# GymText Admin Dashboard - UX Audit & Redesign Proposal

**Date:** February 15, 2026  
**Designer:** Kai 🎨  
**Status:** Draft for Review

---

## Executive Summary

The GymText admin dashboard is **functionally comprehensive but organizationally bloated**. It mixes developer tools (Agents, Registry, Promote) with business operations (Users, Programs, Messages) in a flat navigation structure. This audit identifies key pain points and proposes a cleaner, two-tier navigation system that separates **User Admin** from **Dev Admin** functions.

**Key Finding:** The dashboard serves two distinct audiences—business operators managing users/programs and developers managing AI agents/configs—but treats them as equals in a single navigation menu.

---

## Current State Analysis

### Navigation Structure (13 tabs)

**Captured screenshots:** `screenshots/current-state/01-home-dashboard.jpg` through `screenshots/current-state/13-promote.jpg`

1. **Home** - Dashboard overview
2. **Users** - User management
3. **Program Owners** - Owner/coach management
4. **Organizations** - Organization grouping
5. **Programs** - Program management
6. **Exercises** - Exercise library
7. **Messages** - SMS message monitoring
8. **Calendar** - Day images/theming
9. **Demos** - Demo programs showcase
10. **Registry** - Tools & context providers (dev)
11. **Agents** - AI agent configuration (dev)
12. **Agent Logs** - AI invocation logs (dev)
13. **Promote** - Env config diff/promotion (dev)

### Common Page Patterns

**Stats Cards** - Most pages lead with 4-5 metric cards (Total, Active, etc.)  
**Search + Filters** - Standard search bar + filters button  
**Action Buttons** - "Refresh", "Add [Resource]", sometimes cron triggers  
**Empty States** - Clean "No X found" or illustrative CTAs (Organizations)  
**Error States** - "Failed to load X" + Retry button (due to DB not connected)

### Environment Switching

Bottom-left toggle: **Production** / **Sandbox** — allows admins to switch environments without re-deploying. Smart feature, well-placed.

---

## Pain Points

### 1. **Cognitive Overload**
13 navigation items is too many. Users must scan the entire list to find what they need. No visual grouping or hierarchy.

### 2. **Mixed Audiences**
Business operators (managing users, programs, messages) are presented the same navigation as developers (configuring agents, viewing logs, promoting configs). These are fundamentally different use cases.

### 3. **Unclear Naming**
- **"Registry"** — What does this mean? (Turns out it's dev tools/context)
- **"Promote"** — Promote what? (Environment config promotion)
- **"Agents"** vs **"Agent Logs"** — Related but separated

### 4. **Flat Hierarchy**
No indication which tabs are primary workflows vs. advanced/dev features. Everything feels equally important (and therefore nothing is).

### 5. **Redundant Stats**
Most pages show nearly identical stat card layouts. Could these be consolidated or made more contextual?

### 6. **Missing Quick Actions**
No global search or quick-jump functionality. Finding a specific user/program requires navigating to the right tab first.

---

## User Segmentation

### **User Admin (Business Operators)**
**Who:** Kyle (CEO), Kevin (CPO), customer success team  
**Goals:** Monitor user activity, manage programs, review messages, handle demo requests

**Core Tasks:**
- Check daily signups and active users
- Review failed messages
- Add/edit program owners and organizations
- Manage programs and exercises
- Configure day-specific images/themes
- Review and share demo programs

### **Dev Admin (Engineers/Technical)**
**Who:** Aaron (CTO), engineering team  
**Goals:** Configure AI agents, debug agent invocations, manage environment configs, test tools

**Core Tasks:**
- Configure agent prompts and parameters
- Review agent invocation logs and performance
- Manage tool registry and context providers
- Compare and promote environment configs

---

## Proposed Redesign

### **Two-Tier Navigation: User Admin + Dev Admin**

**Primary Navigation (User Admin)**  
Clean, focused list for daily business operations:

1. **Dashboard** — Overview of activity
2. **Users** — User management
3. **Programs** — Programs, Owners, Organizations (grouped)
4. **Exercises** — Exercise library
5. **Messages** — Message monitoring
6. **Calendar** — Day images/themes
7. **Demos** — Demo showcase

**Secondary Navigation (Dev Admin)**  
Collapsible section or separate area for technical tools:

8. **Agents** — AI agent configuration
9. **Agent Logs** — Invocation monitoring
10. **Registry** — Tools & context (rename to "Dev Tools"?)
11. **Promote** — Environment management

### **Visual Grouping Options**

**Option A: Collapsible Section**
```
┌─ User Admin ──────────┐
│ Dashboard             │
│ Users                 │
│ Programs ▸            │ ← Expandable sub-menu
│   - Programs          │
│   - Program Owners    │
│   - Organizations     │
│ Exercises             │
│ Messages              │
│ Calendar              │
│ Demos                 │
├───────────────────────┤
│ ▼ Dev Admin           │ ← Collapsible
│   Agents              │
│   Agent Logs          │
│   Dev Tools           │
│   Promote             │
└───────────────────────┘
```

**Option B: Tab Switcher**
Top-level toggle between "User Admin" and "Dev Admin" modes, each with its own navigation.

**Option C: Separate Dashboards**
Split into two apps: `/admin` (user admin) and `/admin/dev` (dev admin). Most drastic but clearest separation.

---

## Specific Page Improvements

### **Dashboard (Home)**

**Current Issues:**
- "Failed to load dashboard data" error (due to DB)
- Charts (User Signups, Message Delivery) empty and not actionable
- Four stat cards link to different pages — good, keep this

**Proposed:**
- **Quick Actions Row:** Add buttons for common tasks (Add User, Add Program, View Failed Messages)
- **Recent Activity Feed:** Show recent signups, program enrollments, message failures in a unified timeline
- **Remove or Consolidate Empty Charts:** If no data, replace with CTAs or hide until data exists

### **Programs Section**

**Current:** Three separate tabs (Programs, Program Owners, Organizations)  
**Proposed:** Single "Programs" section with sub-navigation or tabs within the page

```
Programs
├─ All Programs (current Programs tab)
├─ Owners & Coaches (current Program Owners tab)
└─ Organizations (current Organizations tab)
```

This reduces top-level nav clutter and groups related entities logically.

### **Messages**

**Current:** Good stat breakdown (Total, Inbound, Outbound, Pending, Failed)  
**Proposed:** Add **quick filters** in the header (e.g., "Show only failed" button)

### **Calendar**

**Current:** Titled "Day Images Calendar" — clear purpose but niche  
**Question:** Is this frequently used? Consider moving to a settings/config area if it's a one-time setup task.

### **Demos**

**Current:** Nice card layout with tags and "View Demo" buttons  
**Proposed:** Keep as-is. This is well-designed. Consider adding a "Copy Demo URL" button for sharing.

### **Agents**

**Current:** Long sidebar list of agent domains with "not seeded" labels  
**Proposed:**
- Add search/filter for agents
- Group by status (Seeded, Not Seeded, Active, Inactive)
- Show usage stats (invocation count, last used) to surface which agents are actually being used

### **Agent Logs**

**Current:** Table view with Time, Agent, Model, Input, Duration, Score, Response  
**Proposed:**
- Add **date range picker**
- Add **agent filter dropdown** (already exists, good)
- Make **Response column expandable** (modal or drawer) so you can read full responses without table overflow
- Add **export logs** button for debugging

### **Registry → Dev Tools**

**Current:** "Registry" is vague. Shows Tools and Context tabs  
**Proposed:** Rename to **"Dev Tools"** or **"Tool Registry"** for clarity

### **Promote → Environment Config**

**Current:** "Promote to Production" — purpose unclear from nav label  
**Proposed:** Rename to **"Env Config"** or **"Deploy"** to be more explicit

---

## Design Principles

1. **Clarity over Cleverness** — Rename vague tabs (Registry → Dev Tools, Promote → Deploy)
2. **Group Related Entities** — Programs/Owners/Organizations should be sub-sections, not top-level tabs
3. **Separate Audiences** — User Admin vs Dev Admin should be visually distinct
4. **Progressive Disclosure** — Hide advanced/dev features by default; make them accessible but not in-your-face
5. **Consistent Patterns** — Keep stat cards, search bars, and action buttons consistent across pages
6. **Fast Access** — Add global search or quick-jump (Cmd+K) for power users

---

## Recommended Navigation Redesign

### **Proposed Structure**

**Main Navigation (Always Visible)**
- 🏠 Dashboard
- 👥 Users
- 📋 Programs ▸ (expandable: Programs, Owners, Organizations)
- 🏋️ Exercises
- 💬 Messages
- 📅 Calendar
- 🎯 Demos

**Dev Tools (Collapsible Section)**
- ⚙️ Dev Admin ▾
  - 🤖 Agents
  - 📊 Agent Logs
  - 🛠️ Tool Registry
  - 🚀 Deploy (Promote)

**Footer**
- 🟢 Production / ⚪ Sandbox (env toggle)
- 🚪 Sign Out

**Reduces top-level nav from 13 items → 7 primary + 4 dev (collapsed)**

---

## Implementation Notes for Engineering

### **Phase 1: Quick Wins (Low Effort, High Impact)**
1. **Rename Tabs**
   - Registry → Tool Registry
   - Promote → Deploy
   - No code changes, just label updates

2. **Collapse Dev Admin Section**
   - Add a collapsible `<details>` or React state for Dev Admin section
   - Save collapsed state to localStorage

3. **Group Programs Navigation**
   - Move Program Owners and Organizations under Programs in sidebar
   - Add nested nav component (already using Radix Collapsible)

### **Phase 2: Navigation Redesign (Medium Effort)**
1. **Implement Nested Navigation**
   - Update sidebar component to support sub-items
   - Add expand/collapse icons and logic

2. **Add Quick Actions to Dashboard**
   - Button row linking to common tasks
   - Use existing Button component from shadcn/ui

3. **Improve Empty States**
   - Use Organizations page as template (nice icon + CTA)
   - Add illustrations or better messaging

### **Phase 3: Advanced Features (Higher Effort)**
1. **Global Search (Cmd+K)**
   - Fuzzy search across users, programs, exercises
   - shadcn/ui Command component

2. **Agent Logs Improvements**
   - Date range picker (react-day-picker)
   - Expandable response drawer (Radix Dialog)
   - CSV export functionality

3. **Dashboard Activity Feed**
   - Recent signups, enrollments, message events
   - Real-time or polling updates

---

## Mockups & Wireframes

**To Do (Next Steps):**
- [ ] Create high-fidelity mockups of redesigned sidebar (collapsed/expanded states)
- [ ] Sketch new Dashboard layout with quick actions and activity feed
- [ ] Design Programs sub-navigation pattern
- [ ] Annotate screenshots with proposed changes

**Tooling:** Will use Figma or annotated screenshots for handoff.

---

## Open Questions

1. **Calendar Usage:** Is the "Day Images Calendar" frequently used? If not, could it move to a Settings area?

2. **Organizations:** Do Program Owners typically belong to Organizations? Should Organizations be a filter/grouping on Program Owners page rather than its own tab?

3. **Cron Triggers:** Users page has "Daily Cron" and "Weekly Cron" buttons. Are these dev features or user-facing tools? Should they move to Dev Admin?

4. **Environment Switcher:** Should we hide Sandbox mode from non-dev users to reduce accidental changes?

5. **Mobile Access:** Is the admin panel used on mobile? If yes, navigation needs to be mobile-friendly (hamburger menu, etc.)

---

## Next Steps

1. **Review with Aaron/Team** — Get feedback on proposed navigation structure
2. **Create Mockups** — Visual designs of redesigned sidebar and key pages
3. **Prioritize Changes** — Which improvements give the most impact for the least effort?
4. **Handoff to Engineering** — Annotated specs, component notes, implementation phases

---

## Appendix: Screenshot Inventory

All screenshots saved in `screenshots/current-state/`:

1. `01-home-dashboard.jpg` — Dashboard overview
2. `02-users.jpg` — User management
3. `03-program-owners.jpg` — Owner management
4. `04-organizations.jpg` — Organization grouping
5. `05-programs.jpg` — Program management
6. `06-exercises.jpg` — Exercise library
7. `07-messages.jpg` — Message monitoring
8. `08-calendar.jpg` — Day images calendar
9. `09-demos.jpg` — Demo showcase
10. `10-registry.jpg` — Tool registry (dev)
11. `11-agents.jpg` — AI agent config (dev)
12. `12-agent-logs.jpg` — Agent invocation logs (dev)
13. `13-promote.jpg` — Environment promotion (dev)

---

**End of Audit**
