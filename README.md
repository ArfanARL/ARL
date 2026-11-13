# Agentic Research Labs — Website Platform

Hybrid platform: Next.js/TypeScript frontend, ASP.NET Core authoritative business API, Python FastAPI private AI capability service, PostgreSQL and Redis.

## Service ownership
ASP.NET Core owns business records, contact enquiries and authorization decisions. FastAPI is an internal specialist service for AI/agent workflows. The browser must never call FastAPI directly. AI execution is intentionally disabled until model governance, privacy controls, audit and human-review requirements are implemented.

## Local development
Prerequisites: Docker Desktop with Compose, Node.js LTS, .NET 10 SDK (for local API development), and Python 3.12+ (for local AI-service development).

1. Copy `.env.example` to `.env` and replace both secrets with unique random values. Never commit `.env`.
2. Start all backend services: `docker compose up --build -d`.
3. Check API readiness: `http://localhost:8080/health`.
4. Run frontend: `cd frontend && npm install && npm run dev`.
5. Configure frontend API URL to `http://localhost:8080` for local development.

See `docs/phase-2-backend-delivery.md` for endpoints, operational caveats and production gates.


## v0.4 administration and CMS
The Core API now includes ASP.NET Core Identity + JWT authentication, Administrator/Editor roles, protected CMS endpoints and protected contact-enquiry management. Configure `JWT_SIGNING_KEY` and optional `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` in a local `.env` file. Bootstrap creation runs only in Development. Never commit real secrets.

See `docs/phase-3-admin-cms-delivery.md` for routes, role permissions and production hardening requirements.


## v0.5 Admin UI
Routes: `/admin/login`, `/admin`, `/admin/content`, `/admin/enquiries`. Configure `NEXT_PUBLIC_API_BASE_URL` and matching Core API CORS origin. See `docs/phase-4-admin-ui-delivery.md`. The current browser token storage is an integration-stage choice; replace with an HttpOnly BFF session before production.


## v0.6 public website improvements
- Responsive mobile navigation, scroll-spy active links, sticky header, reduced-motion support and keyboard focus styles.
- Working contact form (`components/ContactForm.tsx`) posting to `POST /api/v1/contact-enquiries` with field-level validation errors, rate-limit handling, honeypot spam trap and mailto fallback.
- Fonts served via `next/font` (no render-blocking CSS `@import`), readable CSS source, larger minimum text sizes and AA-contrast colours.
- SEO: metadata, Open Graph/Twitter cards, canonical URL, JSON-LD Organization data, `robots.txt`, `sitemap.xml`, favicon, 404 and error pages. Admin routes are `noindex`.
- Security headers (CSP, frame-ancestors, nosniff, referrer and permissions policies) set in `frontend/next.config.ts`. Set `NEXT_PUBLIC_SITE_URL` for the real production origin.

### v0.7 content rebuild
Multi-page site built from the Content & Sitemap, Technical Architecture, Provincial HMIS technical description, AI-Enabled HMIS manuscript, RAI-ECTF manuscript and leadership CV: `/`, `/about`, `/solutions`, `/projects` (+12 case studies at `/projects/[slug]`), `/research` (+2 manuscript summaries at `/research/[slug]`), `/leadership`, `/contact`.

All public content lives in `frontend/lib/content.ts` — edit projects, status labels, figures and biographies there. Status labels (operational / initiative / proof of concept / leadership experience) and their attribution notes follow section 11 of the Content & Sitemap document. Personal emails, phone numbers, credential IDs, client logos and facility names are deliberately not published.

Backend fixes made while getting the stack to build: added the missing `using Microsoft.AspNetCore.Identity.EntityFrameworkCore;` in `Program.cs` and the `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` package reference in the `.csproj` (required by `AddDbContextCheck`).

### v0.8 admin console and logo
- **Logo:** the "Orbit" mark and wordmark (`frontend/components/Logo.tsx`, `frontend/public/brand/*.svg`, favicon `app/icon.svg`).
- **Admin console** at `/admin`: dashboard; contact enquiries (search, status, internal notes, CSV export); managed Projects, Research and Leadership entries (draft/publish, ordering, schema-driven editor in `app/admin/schemas.ts`); generic Pages; users and roles; audit log; password change.
- **How managed content reaches the site:** the public pages read `GET /api/v1/content/{project|research|leader}` through `frontend/lib/data.ts` (revalidated every 60 s) and fall back to the built-in content in `lib/content.ts` when the API is down or has no published entries. Use "Import current site content" in each admin section once to seed the database.
- **Roles:** Administrators can do everything; Editors can edit content and handle enquiries but cannot delete content, manage users or read the audit log.
- Development schema changes for the new tables run from `AdminConsole.EnsureSchemaAsync`; production must use reviewed EF Core migrations.

Local production-mode test: `cd frontend && npm install && npm run build && npm run start` (http://localhost:3000).

## Project handoff
See `docs/PROJECT_HANDOFF.md` for the complete inventory, local setup, security release gates and verification status.
