# Phase 2 — Backend implementation increment 0.3

## Delivered
- ASP.NET Core Core API now persists contact enquiries in PostgreSQL through EF Core/Npgsql.
- Contact endpoint validates required fields and length limits, normalizes email, and applies a fixed-window rate limit (5 requests per 10 minutes per limiter partition).
- Core API has a database-aware `/health` endpoint and a controlled proxy for AI capability discovery.
- FastAPI internal endpoints require a shared service token checked with constant-time comparison.
- AI task execution intentionally remains disabled; no model provider is configured and no submitted content is forwarded to an LLM.
- Dockerfiles and Compose services added for Core API and AI service. AI service is internal-only (not published as a host port).

## API routes
- `GET /health` — Core API and database readiness.
- `GET /api/v1/platform` — platform metadata.
- `POST /api/v1/contact-enquiries` — validated enquiry persistence; returns 202 and an enquiry ID.
- `GET /api/v1/ai/capabilities` — Core API to private AI-service proxy.

## Local run
1. Copy `.env.example` to `.env`; generate unique long random values for both secrets.
2. `docker compose up --build -d`
3. Check `http://localhost:8080/health` and `http://localhost:8080/api/v1/platform`.
4. Submit a JSON body to `/api/v1/contact-enquiries`: `{"name":"Test User","email":"test@example.com","organisation":"Example","message":"Website enquiry"}`.

## Important production gates
- Replace development `EnsureCreated` with reviewed EF Core migrations and a controlled migration job.
- Set `ASPNETCORE_ENVIRONMENT=Production`; terminate TLS at a trusted reverse proxy/load balancer.
- Add an identity provider (OIDC), admin authorization policies, CSRF strategy where cookie auth is used, secret manager, email delivery, spam/bot controls, retention policy, backups and restore drills.
- Rate limiting is currently in-process and must be moved to a distributed store or edge gateway for multi-instance production.
- Add structured audit events, monitoring/alerting, vulnerability scanning, API contract tests and load tests.
- Configure frontend API base URL and wire the contact form in the next frontend integration increment.

## Verification status
Python syntax and dependency-level tests are checked in the delivery environment. .NET restore/build and Docker image builds require the .NET 10 SDK and Docker engine; these were not available in the authoring environment and must be run on the deployment workstation/CI.
