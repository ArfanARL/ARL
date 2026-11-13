# Architecture Decisions — Agentic Research Labs Website

## ADR-001: Hybrid backend
**Status:** Accepted

- ASP.NET Core is the system of record for business content, contact enquiries, administration, authorization and audit events.
- Python FastAPI hosts specialised AI capabilities: document analysis, retrieval, agent workflows and model/provider adapters.
- The browser communicates with the Next.js application and core API only. It does not call the internal AI service directly.
- Core API authenticates and authorizes a request before forwarding a minimal, classified payload to the AI service.

## ADR-002: Modular monolith for core business capabilities
**Status:** Accepted for initial release

Keep the core API modular and deployable as one service initially. Split services only when operational scale, team ownership or independent release needs justify it.

## ADR-003: PostgreSQL and Redis
**Status:** Accepted as baseline

PostgreSQL is the authoritative relational store. Redis is optional infrastructure for cache, throttling and background coordination; it is not a source of truth.

## ADR-004: Public website separated from administration
**Status:** Accepted

Public pages are anonymous and read-only. Administrative routes require OIDC/OAuth 2.0 login, MFA and role-based authorization. Do not expose admin APIs or AI service routes to anonymous traffic.

## Security and privacy guardrails

- Secrets are injected through environment/secret management; never commit credentials.
- Enforce TLS in deployed environments, secure headers, request size limits, validation, rate limits and anti-spam controls.
- Apply least privilege to service identities and database accounts.
- Log security-relevant events without logging passwords, tokens or unnecessary personal data.
- AI workflows require data classification, prompt-injection controls, output validation, traceability and human approval for consequential actions.
- Do not submit patient, defence, government-confidential or other sensitive data to external AI providers without explicit authorization and an approved data-processing arrangement.

## Open implementation decisions

- Select identity provider and tenant model.
- Confirm hosting region/provider, domain and DNS ownership.
- Confirm email delivery provider and enquiry retention period.
- Confirm public content editing workflow and approver roles.
- Confirm whether AI features belong in the initial public website release (default: no; keep internal and disabled).
