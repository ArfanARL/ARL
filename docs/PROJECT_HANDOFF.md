# Agentic Research Labs Website — Project Handoff

## Project identity
- Company: Agentic Research Labs (Pvt) Ltd
- Brand line: Intelligent Systems. Practical Impact.
- Location shown on website: Lahore, Pakistan
- Leadership shown on website:
  - Mr. Abid Ghaffar — Chief Executive Officer
  - Muhammad Arfan — Director, Operations & Research

## Architecture
- Frontend: Next.js / React / TypeScript
- Core business backend: ASP.NET Core Web API
- AI capability backend: Python FastAPI (internal service)
- Database: PostgreSQL
- Cache/coordination: Redis (configured in the project infrastructure)
- Local orchestration: Docker Compose

ASP.NET Core is authoritative for business data and authorization. The browser must not call the FastAPI service directly.

## Included capabilities
- Public corporate homepage with company positioning, capabilities, solutions, approach, leadership and contact call-to-action.
- ASP.NET Core contact-enquiry endpoint and persistence model.
- ASP.NET Core Identity login and Administrator / Editor role policies.
- CMS API for published pages and protected content management.
- Protected contact-enquiry listing, filtering and status workflow.
- FastAPI internal capability endpoint, with AI execution intentionally disabled pending governance controls.
- Initial browser admin interface:
  - `/admin/login`
  - `/admin`
  - `/admin/content`
  - `/admin/enquiries`

## Local setup
Prerequisites:
- Docker Desktop with Docker Compose
- Node.js LTS
- .NET SDK matching the Core API target framework
- Python 3.12+ only if running the AI service outside Docker

Steps:
1. Extract this archive.
2. Copy `.env.example` to `.env`.
3. Generate unique random values for all secrets. Do not reuse example values.
4. Set database credentials, JWT signing key, AI service token, bootstrap administrator credentials and allowed frontend origin.
5. Start infrastructure and backend using `docker compose up --build -d`.
6. Start the frontend from `frontend/` using `npm install` and `npm run dev`.
7. Set `NEXT_PUBLIC_API_BASE_URL` to the Core API origin and configure matching ASP.NET Core CORS allowed origins.
8. Check `/health`, then verify contact submission, admin login, CMS operations and enquiry status updates.

## Security and production release gates
This archive is a development baseline, not a production-certified deployment. Complete and independently test these items before exposing administration to the internet:
- Replace browser `sessionStorage` bearer-token handling with a Backend-for-Frontend session using Secure, HttpOnly, SameSite cookies and CSRF protections.
- Add MFA for privileged accounts.
- Add persistent audit-event records for sign-in, content changes and enquiry status changes.
- Implement password recovery and account lifecycle processes.
- Use reviewed, versioned EF Core migrations; do not rely on `EnsureCreated` for production.
- Configure TLS, secure headers, strict Content Security Policy, WAF/CDN, secret management and backups.
- Configure SMTP/provider-based notification delivery and verify domain authentication (SPF, DKIM, DMARC).
- Add automated unit, API integration, browser end-to-end, accessibility and performance tests.
- Run dependency, container and source-code security scans.
- Configure staging and production deployment approvals, monitoring and alerting.
- Review privacy notice, retention schedule, consent language and applicable Pakistan/international data protection requirements.

## Verification statement
The source archive has been assembled and its ZIP integrity checked. This environment has not demonstrated a successful .NET build, Docker image build, complete Next.js production build, live database integration or browser end-to-end test. Do not represent these as passed until executed in the target development environment.

## Configuration caution
Never commit `.env`, signing keys, service tokens, database passwords or bootstrap administrator credentials. The bootstrap administrator must be provisioned securely and the initial password changed according to the organisation's account policy.
