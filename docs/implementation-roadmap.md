# Implementation Roadmap

## Phase 0 — Foundation (current scaffold)
- Approve hybrid service boundaries.
- Create source repository structure, local infrastructure and initial health endpoints.
- Establish visual direction and homepage prototype.

## Phase 1 — Corporate website MVP
- Finalize brand assets, typography, responsive layouts and accessibility.
- Implement Home, About, Capabilities, Projects, Research, Leadership and Contact pages.
- Move content into typed content models/CMS or protected admin module.
- Add contact enquiry persistence, email notification, anti-spam and retention controls.
- Add SEO metadata, sitemap, robots policy, analytics consent controls and error pages.

## Phase 2 — Core platform and administration
- Integrate OIDC/OAuth 2.0 identity provider and MFA.
- Implement roles: Super Admin, Content Editor, Reviewer and Read-only Auditor.
- Add audit events, content workflow, preview and approval.
- Add PostgreSQL migrations, backups and restore test.

## Phase 3 — AI service integration (optional, gated)
- Define approved AI use cases and data classes.
- Add service-to-service authentication, queues, timeouts and retry policy.
- Add model gateway, prompt/version registry, retrieval and evaluation harness.
- Require human review for published or consequential outputs.

## Phase 4 — Production readiness
- CI checks, dependency and container scanning, secret scanning, SBOM.
- Staging environment, smoke tests, accessibility and performance checks.
- WAF/CDN, TLS, monitoring, alerting, backups and incident runbooks.
- Production approval and rollback plan.

## MVP acceptance criteria
- All public pages work on mobile, tablet and desktop.
- Keyboard navigation, semantic structure, contrast and form errors are accessible.
- Contact form validates input, protects against abuse and persists enquiries securely.
- Admin routes are not publicly accessible.
- AI service is not internet-exposed and rejects requests without a service token.
- No credentials or sensitive data are committed to source control.
- Build, tests, dependency checks and deployment smoke tests pass.
