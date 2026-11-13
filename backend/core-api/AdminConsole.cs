using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Admin console API: structured content entries (projects, research, leadership), enquiry
/// management, user administration, audit log and dashboard summary.
/// </summary>
public static class AdminConsole
{
    private static readonly string[] EntryTypes = ["project", "research", "leader"];
    private static readonly string[] AssignableRoles = ["Administrator", "Editor"];
    private static readonly string[] EnquiryStatuses = ["new", "in_review", "responded", "closed"];
    private const int MaxDataChars = 200_000;

    public static async Task EnsureSchemaAsync(AppDbContext db)
    {
        // Development bootstrap only. Production must use reviewed EF Core migrations.
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS content_entries (
              "Id" uuid PRIMARY KEY, "Type" varchar(40) NOT NULL, "Slug" varchar(140) NOT NULL, "Title" varchar(300) NOT NULL,
              "Data" text NOT NULL, "IsPublished" boolean NOT NULL, "SortOrder" integer NOT NULL,
              "UpdatedAtUtc" timestamptz NOT NULL, "UpdatedBy" varchar(254) NOT NULL);
            CREATE UNIQUE INDEX IF NOT EXISTS ix_content_entries_type_slug ON content_entries ("Type", "Slug");
            CREATE TABLE IF NOT EXISTS audit_events (
              "Id" uuid PRIMARY KEY, "AtUtc" timestamptz NOT NULL, "Actor" varchar(254) NOT NULL, "Action" varchar(80) NOT NULL,
              "Entity" varchar(80) NOT NULL, "EntityId" varchar(80) NULL, "Detail" varchar(1000) NULL, "Ip" varchar(64) NULL);
            CREATE INDEX IF NOT EXISTS ix_audit_events_atutc ON audit_events ("AtUtc");
            ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS "Notes" varchar(4000) NULL;
            """);
    }

    public static void Audit(AppDbContext db, string actor, string action, string entity, string? entityId = null, string? detail = null, string? ip = null) =>
        db.AuditEvents.Add(new AuditEvent
        {
            AtUtc = DateTime.UtcNow, Actor = actor.Length > 254 ? actor[..254] : actor, Action = action, Entity = entity,
            EntityId = entityId, Detail = detail is { Length: > 1000 } ? detail[..1000] : detail, Ip = ip,
        });

    private static string Actor(ClaimsPrincipal u) => u.FindFirstValue(ClaimTypes.Email) ?? "unknown";

    private static string ToSlug(string value)
    {
        var sb = new StringBuilder();
        foreach (var ch in value.Trim().ToLowerInvariant())
        {
            if (ch is >= 'a' and <= 'z' or >= '0' and <= '9') sb.Append(ch);
            else if (sb.Length > 0 && sb[^1] != '-') sb.Append('-');
        }
        return sb.ToString().Trim('-');
    }

    private static Dictionary<string, string[]>? ValidateEntry(EntryInput input, out string slug)
    {
        var errors = new Dictionary<string, string[]>();
        slug = ToSlug(input.Slug ?? input.Title ?? "");
        if (string.IsNullOrWhiteSpace(input.Type) || !EntryTypes.Contains(input.Type)) errors["type"] = [$"Type must be one of: {string.Join(", ", EntryTypes)}."];
        if (string.IsNullOrWhiteSpace(input.Title)) errors["title"] = ["Title is required."];
        else if (input.Title.Length > 300) errors["title"] = ["Title must be 300 characters or fewer."];
        if (slug.Length == 0) errors["slug"] = ["A URL slug is required."];
        else if (slug.Length > 140) errors["slug"] = ["Slug must be 140 characters or fewer."];
        if (input.Data.ValueKind != JsonValueKind.Object) errors["data"] = ["Data must be a JSON object."];
        else if (input.Data.GetRawText().Length > MaxDataChars) errors["data"] = ["Content is too large."];
        return errors.Count > 0 ? errors : null;
    }

    private static object ToDto(ContentEntry e) => new
    {
        e.Id, e.Type, e.Slug, e.Title, data = JsonSerializer.Deserialize<JsonElement>(e.Data), e.IsPublished, e.SortOrder, e.UpdatedAtUtc, e.UpdatedBy,
    };

    private static string Csv(string? value)
    {
        value ??= "";
        if (value.Length > 0 && "=+-@\t\r".Contains(value[0])) value = "'" + value; // spreadsheet formula-injection guard
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }

    public static void MapAdminConsole(this WebApplication app)
    {
        // ---------------------------------------------------------------- public content
        app.MapGet("/api/v1/content/{type}", async (string type, AppDbContext db) =>
        {
            if (!EntryTypes.Contains(type)) return Results.NotFound();
            var rows = await db.ContentEntries.AsNoTracking().Where(e => e.Type == type && e.IsPublished).OrderBy(e => e.SortOrder).ThenBy(e => e.Title).ToListAsync();
            return Results.Ok(rows.Select(e => new { e.Slug, e.Title, data = JsonSerializer.Deserialize<JsonElement>(e.Data), e.UpdatedAtUtc }));
        });

        // ---------------------------------------------------------------- admin: dashboard
        app.MapGet("/api/v1/admin/dashboard", async (AppDbContext db, UserManager<AppUser> users, ClaimsPrincipal user) =>
        {
            var since = DateTime.UtcNow.AddDays(-7);
            var byStatus = await db.ContactEnquiries.GroupBy(e => e.Status).Select(g => new { status = g.Key, count = g.Count() }).ToListAsync();
            var total = byStatus.Sum(x => x.count);
            var last7 = await db.ContactEnquiries.CountAsync(e => e.CreatedAtUtc >= since);
            var recent = await db.ContactEnquiries.AsNoTracking().OrderByDescending(e => e.CreatedAtUtc).Take(5)
                .Select(e => new { e.Id, e.Name, e.Organisation, e.Status, e.CreatedAtUtc, preview = e.Message.Length > 140 ? e.Message.Substring(0, 140) + "…" : e.Message }).ToListAsync();
            var content = await db.ContentEntries.GroupBy(e => e.Type).Select(g => new { type = g.Key, total = g.Count(), published = g.Count(x => x.IsPublished) }).ToListAsync();
            var isAdmin = user.IsInRole("Administrator");
            var activity = isAdmin ? await db.AuditEvents.AsNoTracking().OrderByDescending(a => a.AtUtc).Take(8).ToListAsync() : [];
            var userCount = isAdmin ? await users.Users.CountAsync() : (int?)null;
            return Results.Ok(new { enquiries = new { total, last7Days = last7, byStatus, recent }, content, pages = await db.ContentPages.CountAsync(), users = userCount, activity });
        }).RequireAuthorization("ContentEditors");

        // ---------------------------------------------------------------- admin: content entries
        app.MapGet("/api/v1/admin/content/entries", async (AppDbContext db, string? type) =>
        {
            var q = db.ContentEntries.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(type)) q = q.Where(e => e.Type == type);
            var rows = await q.OrderBy(e => e.Type).ThenBy(e => e.SortOrder).ThenBy(e => e.Title).ToListAsync();
            return Results.Ok(rows.Select(ToDto));
        }).RequireAuthorization("ContentEditors");

        app.MapGet("/api/v1/admin/content/entries/{id:guid}", async (Guid id, AppDbContext db) =>
            await db.ContentEntries.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id) is { } e ? Results.Ok(ToDto(e)) : Results.NotFound())
            .RequireAuthorization("ContentEditors");

        app.MapPost("/api/v1/admin/content/entries", async (EntryInput input, AppDbContext db, ClaimsPrincipal user) =>
        {
            if (ValidateEntry(input, out var slug) is { } errors) return Results.ValidationProblem(errors);
            if (await db.ContentEntries.AnyAsync(e => e.Type == input.Type && e.Slug == slug)) return Results.Conflict(new { error = "An entry with this slug already exists." });
            var entry = new ContentEntry
            {
                Type = input.Type!, Slug = slug, Title = input.Title!.Trim(), Data = input.Data.GetRawText(), IsPublished = input.IsPublished,
                SortOrder = input.SortOrder, UpdatedAtUtc = DateTime.UtcNow, UpdatedBy = Actor(user),
            };
            db.ContentEntries.Add(entry);
            Audit(db, Actor(user), "content.create", input.Type!, entry.Id.ToString(), $"{input.Type}/{slug}");
            await db.SaveChangesAsync();
            return Results.Created($"/api/v1/admin/content/entries/{entry.Id}", ToDto(entry));
        }).RequireAuthorization("ContentEditors");

        app.MapPut("/api/v1/admin/content/entries/{id:guid}", async (Guid id, EntryInput input, AppDbContext db, ClaimsPrincipal user) =>
        {
            var entry = await db.ContentEntries.FindAsync(id);
            if (entry is null) return Results.NotFound();
            input = input with { Type = entry.Type }; // type is immutable
            if (ValidateEntry(input, out var slug) is { } errors) return Results.ValidationProblem(errors);
            if (await db.ContentEntries.AnyAsync(e => e.Type == entry.Type && e.Slug == slug && e.Id != id)) return Results.Conflict(new { error = "An entry with this slug already exists." });
            var wasPublished = entry.IsPublished;
            entry.Slug = slug; entry.Title = input.Title!.Trim(); entry.Data = input.Data.GetRawText(); entry.IsPublished = input.IsPublished;
            entry.SortOrder = input.SortOrder; entry.UpdatedAtUtc = DateTime.UtcNow; entry.UpdatedBy = Actor(user);
            var action = wasPublished != input.IsPublished ? (input.IsPublished ? "content.publish" : "content.unpublish") : "content.update";
            Audit(db, Actor(user), action, entry.Type, entry.Id.ToString(), $"{entry.Type}/{slug}");
            await db.SaveChangesAsync();
            return Results.Ok(ToDto(entry));
        }).RequireAuthorization("ContentEditors");

        app.MapDelete("/api/v1/admin/content/entries/{id:guid}", async (Guid id, AppDbContext db, ClaimsPrincipal user) =>
        {
            var entry = await db.ContentEntries.FindAsync(id);
            if (entry is null) return Results.NotFound();
            db.ContentEntries.Remove(entry);
            Audit(db, Actor(user), "content.delete", entry.Type, entry.Id.ToString(), $"{entry.Type}/{entry.Slug}");
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization("Administrators");

        app.MapPost("/api/v1/admin/content/import", async (ImportInput input, AppDbContext db, ClaimsPrincipal user) =>
        {
            int created = 0, skipped = 0;
            foreach (var item in input.Entries ?? [])
            {
                if (ValidateEntry(item, out var slug) is not null) { skipped++; continue; }
                if (await db.ContentEntries.AnyAsync(e => e.Type == item.Type && e.Slug == slug)) { skipped++; continue; }
                db.ContentEntries.Add(new ContentEntry
                {
                    Type = item.Type!, Slug = slug, Title = item.Title!.Trim(), Data = item.Data.GetRawText(), IsPublished = item.IsPublished,
                    SortOrder = item.SortOrder, UpdatedAtUtc = DateTime.UtcNow, UpdatedBy = Actor(user),
                });
                created++;
                await db.SaveChangesAsync();
            }
            Audit(db, Actor(user), "content.import", "content", null, $"created {created}, skipped {skipped}");
            await db.SaveChangesAsync();
            return Results.Ok(new { created, skipped });
        }).RequireAuthorization("Administrators");

        // ---------------------------------------------------------------- admin: enquiries
        app.MapGet("/api/v1/admin/contact-enquiries/{id:guid}", async (Guid id, AppDbContext db) =>
            await db.ContactEnquiries.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id) is { } e ? Results.Ok(e) : Results.NotFound())
            .RequireAuthorization("ContentEditors");

        app.MapPatch("/api/v1/admin/contact-enquiries/{id:guid}", async (Guid id, UpdateEnquiryInput input, AppDbContext db, ClaimsPrincipal user) =>
        {
            var item = await db.ContactEnquiries.FindAsync(id);
            if (item is null) return Results.NotFound();
            if (input.Status is not null)
            {
                if (!EnquiryStatuses.Contains(input.Status)) return Results.BadRequest(new { error = "Invalid status." });
                if (item.Status != input.Status) Audit(db, Actor(user), "enquiry.status", "enquiry", id.ToString(), $"{item.Status} → {input.Status}");
                item.Status = input.Status;
            }
            if (input.Notes is not null)
            {
                if (input.Notes.Length > 4000) return Results.BadRequest(new { error = "Notes must be 4,000 characters or fewer." });
                item.Notes = string.IsNullOrWhiteSpace(input.Notes) ? null : input.Notes.Trim();
                Audit(db, Actor(user), "enquiry.notes", "enquiry", id.ToString());
            }
            await db.SaveChangesAsync();
            return Results.Ok(item);
        }).RequireAuthorization("ContentEditors");

        app.MapDelete("/api/v1/admin/contact-enquiries/{id:guid}", async (Guid id, AppDbContext db, ClaimsPrincipal user) =>
        {
            var item = await db.ContactEnquiries.FindAsync(id);
            if (item is null) return Results.NotFound();
            db.ContactEnquiries.Remove(item);
            Audit(db, Actor(user), "enquiry.delete", "enquiry", id.ToString());
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization("Administrators");

        app.MapGet("/api/v1/admin/contact-enquiries/export.csv", async (AppDbContext db, ClaimsPrincipal user, string? status) =>
        {
            var q = db.ContactEnquiries.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(e => e.Status == status);
            var rows = await q.OrderByDescending(e => e.CreatedAtUtc).ToListAsync();
            var sb = new StringBuilder("﻿Received (UTC),Name,Email,Organisation,Status,Message,Notes\r\n");
            foreach (var e in rows)
                sb.Append(string.Join(',', Csv(e.CreatedAtUtc.ToString("u")), Csv(e.Name), Csv(e.Email), Csv(e.Organisation), Csv(e.Status), Csv(e.Message), Csv(e.Notes))).Append("\r\n");
            Audit(db, Actor(user), "enquiry.export", "enquiry", null, $"{rows.Count} rows");
            await db.SaveChangesAsync();
            return Results.File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv; charset=utf-8", "enquiries.csv");
        }).RequireAuthorization("ContentEditors");

        // ---------------------------------------------------------------- admin: users
        app.MapGet("/api/v1/admin/users", async (UserManager<AppUser> um) =>
        {
            var list = await um.Users.AsNoTracking().OrderBy(u => u.Email).ToListAsync();
            var result = new List<object>();
            foreach (var u in list)
                result.Add(new { u.Id, u.Email, u.DisplayName, u.IsEnabled, role = (await um.GetRolesAsync(u)).FirstOrDefault() ?? "", lockedOut = u.LockoutEnd > DateTimeOffset.UtcNow });
            return Results.Ok(result);
        }).RequireAuthorization("Administrators");

        app.MapPost("/api/v1/admin/users", async (UserInput input, UserManager<AppUser> um, RoleManager<IdentityRole<Guid>> roles, AppDbContext db, ClaimsPrincipal actor) =>
        {
            var errors = new Dictionary<string, string[]>();
            if (string.IsNullOrWhiteSpace(input.Email) || !new EmailAddressAttribute().IsValid(input.Email)) errors["email"] = ["A valid email address is required."];
            if (string.IsNullOrWhiteSpace(input.DisplayName)) errors["displayName"] = ["Display name is required."];
            if (input.Role is null || !AssignableRoles.Contains(input.Role)) errors["role"] = ["Role must be Administrator or Editor."];
            if (string.IsNullOrWhiteSpace(input.Password)) errors["password"] = ["A temporary password is required."];
            if (errors.Count > 0) return Results.ValidationProblem(errors);
            foreach (var r in AssignableRoles) if (!await roles.RoleExistsAsync(r)) await roles.CreateAsync(new IdentityRole<Guid>(r));
            var email = input.Email!.Trim();
            if (await um.FindByEmailAsync(email) is not null) return Results.Conflict(new { error = "A user with this email already exists." });
            var user = new AppUser { UserName = email, Email = email, DisplayName = input.DisplayName!.Trim(), EmailConfirmed = true, IsEnabled = true };
            var created = await um.CreateAsync(user, input.Password!);
            if (!created.Succeeded) return Results.ValidationProblem(new Dictionary<string, string[]> { ["password"] = created.Errors.Select(e => e.Description).ToArray() });
            await um.AddToRoleAsync(user, input.Role!);
            Audit(db, Actor(actor), "user.create", "user", user.Id.ToString(), $"{email} as {input.Role}");
            await db.SaveChangesAsync();
            return Results.Created($"/api/v1/admin/users/{user.Id}", new { user.Id, user.Email, user.DisplayName, user.IsEnabled, role = input.Role });
        }).RequireAuthorization("Administrators");

        app.MapPut("/api/v1/admin/users/{id:guid}", async (Guid id, UserUpdateInput input, UserManager<AppUser> um, AppDbContext db, ClaimsPrincipal actor) =>
        {
            var user = await um.FindByIdAsync(id.ToString());
            if (user is null) return Results.NotFound();
            var isSelf = actor.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString();
            var currentRole = (await um.GetRolesAsync(user)).FirstOrDefault();
            var newRole = input.Role ?? currentRole;
            var newEnabled = input.IsEnabled ?? user.IsEnabled;
            if (newRole is null || !AssignableRoles.Contains(newRole)) return Results.BadRequest(new { error = "Role must be Administrator or Editor." });
            if (isSelf && (!newEnabled || newRole != "Administrator")) return Results.BadRequest(new { error = "You cannot disable or demote your own account." });
            if (!string.IsNullOrWhiteSpace(input.DisplayName)) user.DisplayName = input.DisplayName.Trim();
            user.IsEnabled = newEnabled;
            var update = await um.UpdateAsync(user);
            if (!update.Succeeded) return Results.BadRequest(new { error = string.Join(" ", update.Errors.Select(e => e.Description)) });
            if (currentRole != newRole)
            {
                if (currentRole is not null) await um.RemoveFromRoleAsync(user, currentRole);
                await um.AddToRoleAsync(user, newRole);
            }
            if (!string.IsNullOrWhiteSpace(input.NewPassword))
            {
                if (await um.HasPasswordAsync(user)) await um.RemovePasswordAsync(user);
                var pw = await um.AddPasswordAsync(user, input.NewPassword);
                if (!pw.Succeeded) return Results.BadRequest(new { error = string.Join(" ", pw.Errors.Select(e => e.Description)) });
            }
            Audit(db, Actor(actor), "user.update", "user", id.ToString(), $"{user.Email}: role {newRole}, enabled {newEnabled}{(string.IsNullOrWhiteSpace(input.NewPassword) ? "" : ", password reset")}");
            await db.SaveChangesAsync();
            return Results.Ok(new { user.Id, user.Email, user.DisplayName, user.IsEnabled, role = newRole });
        }).RequireAuthorization("Administrators");

        app.MapPost("/api/v1/admin/auth/change-password", async (ChangePasswordInput input, UserManager<AppUser> um, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var user = await um.FindByIdAsync(principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? "");
            if (user is null) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(input.CurrentPassword) || string.IsNullOrWhiteSpace(input.NewPassword)) return Results.BadRequest(new { error = "Current and new password are required." });
            var result = await um.ChangePasswordAsync(user, input.CurrentPassword, input.NewPassword);
            if (!result.Succeeded) return Results.BadRequest(new { error = string.Join(" ", result.Errors.Select(e => e.Description)) });
            Audit(db, Actor(principal), "auth.password-change", "user", user.Id.ToString());
            await db.SaveChangesAsync();
            return Results.Ok(new { changed = true });
        }).RequireAuthorization();

        // ---------------------------------------------------------------- admin: audit log
        app.MapGet("/api/v1/admin/audit", async (AppDbContext db, string? q, int page = 1, int pageSize = 50) =>
        {
            page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 200);
            var query = db.AuditEvents.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(q))
            {
                var pattern = $"%{q.Trim()}%";
                query = query.Where(a => EF.Functions.ILike(a.Actor, pattern) || EF.Functions.ILike(a.Action, pattern) || EF.Functions.ILike(a.Entity, pattern) || (a.Detail != null && EF.Functions.ILike(a.Detail, pattern)));
            }
            var total = await query.CountAsync();
            var items = await query.OrderByDescending(a => a.AtUtc).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Results.Ok(new { page, pageSize, total, items });
        }).RequireAuthorization("Administrators");
    }
}

public sealed record EntryInput(string? Type, string? Slug, string? Title, JsonElement Data, bool IsPublished, int SortOrder);
public sealed record ImportInput(List<EntryInput>? Entries);
public sealed record UpdateEnquiryInput(string? Status, string? Notes);
public sealed record UserInput(string? Email, string? DisplayName, string? Role, string? Password);
public sealed record UserUpdateInput(string? DisplayName, string? Role, bool? IsEnabled, string? NewPassword);
public sealed record ChangePasswordInput(string? CurrentPassword, string? NewPassword);

public sealed class ContentEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Type { get; set; }
    public required string Slug { get; set; }
    public required string Title { get; set; }
    public required string Data { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public required string UpdatedBy { get; set; }
}

public sealed class AuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime AtUtc { get; set; }
    public required string Actor { get; set; }
    public required string Action { get; set; }
    public required string Entity { get; set; }
    public string? EntityId { get; set; }
    public string? Detail { get; set; }
    public string? Ip { get; set; }
}
