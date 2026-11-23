# Database exports

Two database targets are documented here:

- **Production (https://arls.dev):** MySQL 8 behind the PHP API in `backend/php-api`. Reference schema: `mysql-schema.sql`. Initial content: `backend/php-api/seed/entries.json` (imported automatically on first request). The first administrator is created once at `/api/setup` with a time-limited code; credentials live only in `~/arls-config/config.php` on the server, never in this repository.
- **Local development:** PostgreSQL 17 with the .NET Core API, described below.

## PostgreSQL (local development)

PostgreSQL 17, exported from the local development database.

| File | Contents |
|---|---|
| `schema.sql` | Full schema (ASP.NET Identity tables, `contact_enquiries`, `content_pages`, `content_entries`, `audit_events`). No data. |
| `content-seed.sql` | Website content only: `content_entries` (managed projects, research, leadership) and `content_pages`. |

**Deliberately not exported:** user accounts and password hashes (`AspNetUsers` etc.), contact enquiries (personal data) and the audit log.
Create the first administrator with `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` (see `.env.example`); it is seeded on first start in Development.

Restore into an empty database:

```bash
psql -U arl_app -d agentic_research_labs -f database/schema.sql
psql -U arl_app -d agentic_research_labs -f database/content-seed.sql
```

The Core API also creates these tables itself on first start in Development (`AdminConsole.EnsureSchemaAsync`). Production must use reviewed EF Core migrations.
