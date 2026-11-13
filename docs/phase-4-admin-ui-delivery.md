# Phase 4 — Admin UI and API integration

## Delivered in v0.5
- Administrator sign-in page calls `POST /api/v1/admin/auth/login`.
- The returned short-lived bearer token is held in browser `sessionStorage` for the current tab session.
- Protected admin shell checks for a token and redirects unauthenticated visitors to `/admin/login`.
- Overview page reads the enquiry count from the Core API.
- Content management page lists, creates, edits, publishes and deletes CMS pages using the existing protected API.
- Enquiry page lists, filters and updates enquiry status through the existing protected API.
- Responsive admin layout and mobile navigation treatment.
- `NEXT_PUBLIC_API_BASE_URL` is documented in `.env.example`.

## Routes
- `/admin/login`
- `/admin`
- `/admin/content`
- `/admin/enquiries`

## Important security notes
This is an initial admin UI integration, not a production security sign-off. The bearer token is held in sessionStorage and is therefore accessible to JavaScript executing in the origin. Before production, prefer a backend-for-frontend session using Secure, HttpOnly, SameSite cookies, CSRF protection and strict CSP. Enforce authorization on the API (already required by the protected endpoints); hiding UI controls is not a security boundary. MFA, audit event persistence, password recovery and production database migrations remain release gates.

## Configuration
Set `NEXT_PUBLIC_API_BASE_URL` to the Core API origin. Ensure ASP.NET Core CORS `AllowedOrigins` contains the exact frontend origin. Provision the bootstrap Administrator securely in Development, then verify the login endpoint and role assignment. Never expose bootstrap credentials in client-side variables.

## Verification status
Source files and archive structure were checked. Runtime build, browser E2E, API integration and security tests remain pending because this environment does not have the .NET SDK / Docker engine and dependency installation was not completed.
