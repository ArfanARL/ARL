# Phase 3 — Administration, CMS and enquiry management (v0.4)

## Delivered in source
- ASP.NET Core Identity user store with GUID keys and role support.
- JWT bearer authentication with issuer, audience, signing-key and lifetime validation.
- Administrator and Editor roles; ContentEditors and Administrators authorization policies.
- Login endpoint with lockout policy and a 5-attempt / 5-minute rate limit.
- Optional development bootstrap administrator via environment variables. No default credentials are embedded.
- CMS page CRUD endpoints; public endpoint exposes published pages only. Editors can create/update; Administrators can delete.
- Enquiry list with pagination and status filter; status transitions limited to new, in_review, responded and closed.
- Docker Compose environment wiring for JWT signing and initial admin bootstrap.

## API routes
- POST `/api/v1/admin/auth/login` — returns a 30-minute JWT.
- GET `/api/v1/admin/auth/me` — authenticated identity and roles.
- GET `/api/v1/content/pages` — published pages only.
- GET/POST `/api/v1/admin/content/pages` — Editor or Administrator.
- PUT/DELETE `/api/v1/admin/content/pages/{id}` — update for Editor/Admin; delete Administrator only.
- GET `/api/v1/admin/contact-enquiries?status=new&page=1&pageSize=25` — Editor/Admin.
- PATCH `/api/v1/admin/contact-enquiries/{id}/status` — Editor/Admin.

## Important deployment notes
- The current local development startup uses EF Core `EnsureCreated` for a fresh database. Replace this with reviewed EF Core migrations before production and do not use `EnsureCreated` against an existing production database.
- Bootstrap admin seeding currently runs only in Development. Set a unique password and JWT signing key in local `.env`; never commit `.env`. Remove bootstrap credentials after first setup and implement a controlled administrator provisioning procedure before production.
- JWT is returned as a bearer token. A production admin frontend should store it in a secure, HttpOnly, SameSite cookie via a server-side session/BFF; do not persist it in localStorage.
- Add MFA, password reset, email verification, audit events, CSRF protections for cookie sessions, account lifecycle controls and security monitoring before production.
- Do not expose the AI service publicly. Keep it on the private container network.
- No production build or integration test is claimed until executed with .NET SDK, PostgreSQL and Docker available.
