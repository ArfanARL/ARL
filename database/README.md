# Database exports

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
