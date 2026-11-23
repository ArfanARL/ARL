# ARL PHP API (shared-hosting backend)

A PHP 8 + MySQL port of the .NET Core API, built for the cPanel hosting behind https://arls.dev.
It keeps the same `/api/v1/...` routes and JSON shapes so the existing Next.js admin console and contact form work unchanged.

- `index.php` + `.htaccess`: front controller (all `/api/*` requests)
- `app/lib.php`, `app/routes.php`: helpers, JWT (HS256), rate limits, all endpoints
- `seed/entries.json`: initial projects, leaders and research (generated from `frontend/lib/content.ts`)
- Configuration is NOT in this repo: `~/arls-config/config.php` on the server (database, signing key, mail, one-time setup code).
- Tables are created automatically on first request. The first administrator is created once at `/api/setup` with a time-limited setup code.
- Test locally with Docker: PHP 8.3 + Apache (`pdo_mysql`, `mod_rewrite`) and MySQL 8, config via `ARLS_CONFIG`.
