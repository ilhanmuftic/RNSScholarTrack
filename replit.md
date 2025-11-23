# Ruku na srce - Volunteer Scholarship Tracking System

## Overview

Ruku na srce is a volunteer scholarship tracking system designed for a humanitarian organization. The application enables scholars to log volunteer activities and track their monthly hour requirements, while administrators can review submissions, manage scholars, and generate compliance reports. The system emphasizes clean data visualization, efficient workflows, and trust-building through professional design following Material Design principles adapted for nonprofit contexts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: 
- Radix UI primitives for accessible, headless components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Typography: Inter (UI elements) and Montserrat (headers/metrics) from Google Fonts

**State Management**:
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation for form handling
- Wouter for client-side routing (lightweight alternative to React Router)

**Design System**:
- Custom spacing primitives (2, 4, 6, 8, 12 units)
- Responsive grid layouts with Tailwind breakpoints
- Light/dark theme support with CSS variables
- Material Design principles adapted for humanitarian context

**Key Routes**:
- `/` - Landing page (unauthenticated) or role-based dashboard
- Admin routes: `/scholars`, `/activities`, `/reports`, `/settings`
- Scholar routes: `/submit-activity`, `/my-activities`

### Backend Architecture

**Server Framework**: Express.js with TypeScript (ESM modules)

**Authentication**: 
- Replit Auth using OpenID Connect (OIDC)
- Passport.js strategy for session management
- PostgreSQL-backed session storage (connect-pg-simple)
- Role-based access control (admin vs scholar roles)

**Database Access Layer**:
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL driver
- Schema-first approach with Zod validation integration
- Storage abstraction pattern for data access operations

**API Structure**:
- RESTful endpoints under `/api` prefix
- Authentication middleware (`isAuthenticated`, `isAdmin`)
- Separate routes for admin and scholar operations
- JSON request/response format

**Development vs Production**:
- Development: Vite dev server with HMR
- Production: Static file serving from dist directory
- Conditional Replit-specific plugins for development environment

### Data Model

**Core Entities**:

1. **Users** - Base authentication/profile data
   - Stores: email, name, profile image, role (admin/scholar)
   - Extended by scholars table for program-specific data

2. **Scholars** - Program participation details
   - Links to user via userId foreign key
   - Tracks: scholar ID, level, required hours/month, active status
   - One-to-one relationship with users

3. **Activities** - Volunteer work submissions
   - Links to scholar and category
   - Stores: title, description, hours, date, location, evidence URL
   - Status workflow: pending → approved/rejected
   - Tracks reviewer and review comments

4. **Activity Categories** - Classification system
   - Examples: Tutoring, Community Service, Environmental Work
   - Includes name, description, and icon identifier

5. **Sessions** - Authentication session storage
   - Required for Replit Auth
   - Managed automatically by express-session

**Key Relationships**:
- User → Scholar (one-to-one via userId)
- Scholar → Activities (one-to-many)
- ActivityCategory → Activities (one-to-many)
- Activities reference reviewer (User) for approved/rejected status

### Authentication & Authorization

**Authentication Flow**:
1. Unauthenticated users redirected to `/api/login`
2. Replit OIDC authentication via Passport.js
3. User profile synced/created in database
4. Session stored in PostgreSQL with 7-day TTL
5. Secure HTTP-only cookies with session ID

**Authorization Strategy**:
- Middleware guards: `isAuthenticated` and `isAdmin`
- Role-based UI rendering (admin sidebar vs scholar header)
- API endpoints protected by role checks
- 401 responses trigger re-authentication flow

**Session Management**:
- PostgreSQL session store for persistence
- Automatic session refresh on API calls
- Client-side token expiry handling with redirects

### Key Features & Workflows

**Scholar Workflow**:
1. View dashboard with monthly progress toward required hours
2. Submit new activities with category, hours, description, evidence
3. Track activity status (pending/approved/rejected)
4. View historical activity log

**Admin Workflow**:
1. Dashboard showing total scholars, active scholars, pending approvals
2. Review pending activities with approve/reject actions
3. View all scholars with stats and compliance status
4. Generate monthly reports showing hour compliance by scholar
5. Manage scholar profiles and required hours

**Data Aggregation**:
- Real-time statistics calculated via Drizzle ORM queries
- Monthly hour totals computed from approved activities
- Compliance tracking (current month hours vs required)
- Activity counts by status for each scholar

## External Dependencies

**Database**: 
- PostgreSQL (via Neon serverless)
- Connection via DATABASE_URL environment variable
- Schema migrations managed by Drizzle Kit

**Authentication Service**:
- Replit Auth (OIDC provider)
- Requires: ISSUER_URL, REPL_ID, SESSION_SECRET environment variables

**Third-party Libraries**:
- UI Components: Radix UI ecosystem (~20 primitive components)
- Form Handling: React Hook Form + @hookform/resolvers
- Validation: Zod (shared between client/server)
- Date Utilities: date-fns
- Icons: Lucide React
- Styling: Tailwind CSS with PostCSS

**Build & Development Tools**:
- Vite for frontend bundling and dev server
- esbuild for backend production build
- TypeScript compiler for type checking
- Drizzle Kit for database migrations

**Replit-Specific Integrations** (development only):
- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer
- @replit/vite-plugin-dev-banner