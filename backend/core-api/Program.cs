using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
var connectionString = builder.Configuration.GetConnectionString("Default") ?? Environment.GetEnvironmentVariable("DATABASE_URL");
if (string.IsNullOrWhiteSpace(connectionString)) throw new InvalidOperationException("Set ConnectionStrings:Default or DATABASE_URL.");
var jwtKey = builder.Configuration["Auth:JwtKey"] ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32) throw new InvalidOperationException("Set JWT_SIGNING_KEY to a random secret of at least 32 bytes.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddIdentityCore<AppUser>(options =>
{
    options.Password.RequiredLength = 14; options.Password.RequireDigit = true; options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true; options.Password.RequireNonAlphanumeric = true;
    options.Lockout.MaxFailedAccessAttempts = 5; options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole<Guid>>().AddEntityFrameworkStores<AppDbContext>().AddSignInManager();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = builder.Configuration["Auth:Issuer"] ?? "AgenticResearchLabs",
        ValidateAudience = true, ValidAudience = builder.Configuration["Auth:Audience"] ?? "AgenticResearchLabs.Admin",
        ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true, ClockSkew = TimeSpan.FromSeconds(30), RoleClaimType = ClaimTypes.Role
    };
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ContentEditors", p => p.RequireRole("Administrator", "Editor"));
    options.AddPolicy("Administrators", p => p.RequireRole("Administrator"));
});
builder.Services.AddHttpClient("ai-service", client => { client.BaseAddress = new Uri(builder.Configuration["AIService:BaseUrl"] ?? "http://ai-service:8001"); client.Timeout = TimeSpan.FromSeconds(20); });
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();
builder.Services.AddCors(options => options.AddPolicy("Website", policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("contact", limiter => { limiter.PermitLimit = 5; limiter.Window = TimeSpan.FromMinutes(10); limiter.QueueLimit = 0; limiter.AutoReplenishment = true; });
    options.AddFixedWindowLimiter("login", limiter => { limiter.PermitLimit = 5; limiter.Window = TimeSpan.FromMinutes(5); limiter.QueueLimit = 0; limiter.AutoReplenishment = true; });
});
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); await db.Database.EnsureCreatedAsync(); await AdminConsole.EnsureSchemaAsync(db);
    await SeedAdminAsync(scope.ServiceProvider, builder.Configuration);
}
app.UseExceptionHandler(handler => handler.Run(async context => { context.Response.StatusCode = 500; await context.Response.WriteAsJsonAsync(new { error = "An unexpected server error occurred." }); }));
app.UseHttpsRedirection(); app.UseCors("Website"); app.UseRateLimiter(); app.UseAuthentication(); app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapGet("/api/v1/platform", () => Results.Ok(new { name = "Agentic Research Labs Core API", status = "operational", version = "0.4.0" }));

app.MapPost("/api/v1/contact-enquiries", async (ContactEnquiryInput input, AppDbContext db) =>
{
    var errors = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(input.Name)) errors["name"] = ["Name is required."];
    if (string.IsNullOrWhiteSpace(input.Email) || !new EmailAddressAttribute().IsValid(input.Email)) errors["email"] = ["A valid email address is required."];
    if (string.IsNullOrWhiteSpace(input.Message)) errors["message"] = ["Message is required."];
    if (input.Name?.Length > 120) errors["name"] = ["Name must be 120 characters or fewer."];
    if (input.Email?.Length > 254) errors["email"] = ["Email must be 254 characters or fewer."];
    if (input.Organisation?.Length > 160) errors["organisation"] = ["Organisation must be 160 characters or fewer."];
    if (input.Message?.Length > 5000) errors["message"] = ["Message must be 5,000 characters or fewer."];
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var enquiry = new ContactEnquiry { Name = input.Name!.Trim(), Email = input.Email!.Trim().ToLowerInvariant(), Organisation = input.Organisation?.Trim(), Message = input.Message!.Trim(), CreatedAtUtc = DateTime.UtcNow, Status = "new" };
    db.ContactEnquiries.Add(enquiry); await db.SaveChangesAsync();
    return Results.Accepted($"/api/v1/contact-enquiries/{enquiry.Id}", new { id = enquiry.Id, received = true, message = "Thank you. Your enquiry has been received." });
}).RequireRateLimiting("contact");

app.MapPost("/api/v1/admin/auth/login", async (LoginInput input, UserManager<AppUser> users, IConfiguration config, AppDbContext db, HttpContext http) =>
{
    if (string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.Password)) return Results.BadRequest(new { error = "Email and password are required." });
    var ip = http.Connection.RemoteIpAddress?.ToString();
    var user = await users.FindByEmailAsync(input.Email.Trim());
    if (user is null || !await users.CheckPasswordAsync(user, input.Password) || !user.IsEnabled)
    {
        if (user is not null) await users.AccessFailedAsync(user);
        AdminConsole.Audit(db, input.Email.Trim(), "auth.login-failed", "user", user?.Id.ToString(), null, ip); await db.SaveChangesAsync();
        return Results.Unauthorized();
    }
    await users.ResetAccessFailedCountAsync(user);
    AdminConsole.Audit(db, user.Email!, "auth.login", "user", user.Id.ToString(), null, ip); await db.SaveChangesAsync();
    var roles = await users.GetRolesAsync(user); var now = DateTime.UtcNow;
    var key = config["Auth:JwtKey"] ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")!;
    var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
    var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, user.Id.ToString()), new(ClaimTypes.Email, user.Email!), new(ClaimTypes.Name, user.DisplayName) };
    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
    var token = new JwtSecurityToken(config["Auth:Issuer"] ?? "AgenticResearchLabs", config["Auth:Audience"] ?? "AgenticResearchLabs.Admin", claims, now, now.AddMinutes(30), creds);
    return Results.Ok(new { accessToken = new JwtSecurityTokenHandler().WriteToken(token), tokenType = "Bearer", expiresAtUtc = token.ValidTo, user = new { user.DisplayName, user.Email, roles } });
}).RequireRateLimiting("login");

app.MapGet("/api/v1/admin/auth/me", (ClaimsPrincipal user) => Results.Ok(new { id = user.FindFirstValue(ClaimTypes.NameIdentifier), name = user.Identity?.Name, email = user.FindFirstValue(ClaimTypes.Email), roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value) })).RequireAuthorization();

// Public, published CMS pages only. Drafts remain private to authorised editors.
app.MapGet("/api/v1/content/pages", async (AppDbContext db) => Results.Ok(await db.ContentPages.AsNoTracking().Where(p => p.IsPublished).OrderBy(p => p.SortOrder).Select(p => new { p.Slug, p.Title, p.Summary, p.Body, p.UpdatedAtUtc }).ToListAsync()));
app.MapGet("/api/v1/admin/content/pages", async (AppDbContext db) => Results.Ok(await db.ContentPages.AsNoTracking().OrderBy(p => p.SortOrder).ToListAsync())).RequireAuthorization("ContentEditors");
app.MapPost("/api/v1/admin/content/pages", async (ContentPageInput input, AppDbContext db, ClaimsPrincipal user) =>
{
    if (string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.Slug)) return Results.BadRequest(new { error = "Title and slug are required." });
    var slug = Slugify(input.Slug); if (await db.ContentPages.AnyAsync(p => p.Slug == slug)) return Results.Conflict(new { error = "A page with this slug already exists." });
    var page = new ContentPage { Slug = slug, Title = input.Title.Trim(), Summary = input.Summary?.Trim(), Body = input.Body ?? "", IsPublished = input.IsPublished, SortOrder = input.SortOrder, UpdatedAtUtc = DateTime.UtcNow, UpdatedBy = user.FindFirstValue(ClaimTypes.Email) ?? "unknown" };
    db.ContentPages.Add(page); await db.SaveChangesAsync(); return Results.Created($"/api/v1/admin/content/pages/{page.Id}", page);
}).RequireAuthorization("ContentEditors");
app.MapPut("/api/v1/admin/content/pages/{id:guid}", async (Guid id, ContentPageInput input, AppDbContext db, ClaimsPrincipal user) =>
{
    var page = await db.ContentPages.FindAsync(id); if (page is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.Slug)) return Results.BadRequest(new { error = "Title and slug are required." });
    var slug = Slugify(input.Slug); if (await db.ContentPages.AnyAsync(p => p.Slug == slug && p.Id != id)) return Results.Conflict(new { error = "A page with this slug already exists." });
    page.Slug = slug; page.Title = input.Title.Trim(); page.Summary = input.Summary?.Trim(); page.Body = input.Body ?? ""; page.IsPublished = input.IsPublished; page.SortOrder = input.SortOrder; page.UpdatedAtUtc = DateTime.UtcNow; page.UpdatedBy = user.FindFirstValue(ClaimTypes.Email) ?? "unknown";
    await db.SaveChangesAsync(); return Results.Ok(page);
}).RequireAuthorization("ContentEditors");
app.MapDelete("/api/v1/admin/content/pages/{id:guid}", async (Guid id, AppDbContext db) => { var page = await db.ContentPages.FindAsync(id); if (page is null) return Results.NotFound(); db.ContentPages.Remove(page); await db.SaveChangesAsync(); return Results.NoContent(); }).RequireAuthorization("Administrators");

app.MapGet("/api/v1/admin/contact-enquiries", async (AppDbContext db, string? status, string? q, int page = 1, int pageSize = 25) =>
{
    page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
    var query = db.ContactEnquiries.AsNoTracking().AsQueryable(); if (!string.IsNullOrWhiteSpace(status)) query = query.Where(e => e.Status == status);
    if (!string.IsNullOrWhiteSpace(q)) { var p = $"%{q.Trim()}%"; query = query.Where(e => EF.Functions.ILike(e.Name, p) || EF.Functions.ILike(e.Email, p) || (e.Organisation != null && EF.Functions.ILike(e.Organisation, p)) || EF.Functions.ILike(e.Message, p)); }
    var total = await query.CountAsync(); var items = await query.OrderByDescending(e => e.CreatedAtUtc).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    return Results.Ok(new { page, pageSize, total, items });
}).RequireAuthorization("ContentEditors");
app.MapPatch("/api/v1/admin/contact-enquiries/{id:guid}/status", async (Guid id, UpdateEnquiryStatusInput input, AppDbContext db) =>
{
    var valid = new[] { "new", "in_review", "responded", "closed" }; if (!valid.Contains(input.Status)) return Results.BadRequest(new { error = "Invalid status." });
    var item = await db.ContactEnquiries.FindAsync(id); if (item is null) return Results.NotFound(); item.Status = input.Status; await db.SaveChangesAsync(); return Results.Ok(new { item.Id, item.Status });
}).RequireAuthorization("ContentEditors");

app.MapGet("/api/v1/ai/capabilities", async (IHttpClientFactory clients, IConfiguration config, CancellationToken ct) =>
{
    var token = config["AIService:Token"]; if (string.IsNullOrWhiteSpace(token)) return Results.Problem("AI integration is not configured.", statusCode: 503);
    var client = clients.CreateClient("ai-service"); client.DefaultRequestHeaders.Add("X-Service-Token", token);
    try { var response = await client.GetAsync("/internal/v1/capabilities", ct); var payload = await response.Content.ReadAsStringAsync(ct); return Results.Content(payload, "application/json", statusCode: (int)response.StatusCode); }
    catch (HttpRequestException) { return Results.Problem("AI service is temporarily unavailable.", statusCode: 503); }
}).WithName("GetAiCapabilities");
app.MapAdminConsole();
app.Run();

static string Slugify(string value) => string.Join('-', value.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries)).Replace("/", "-");
static async Task SeedAdminAsync(IServiceProvider services, IConfiguration config)
{
    var email = config["BootstrapAdmin:Email"] ?? Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_EMAIL");
    var password = config["BootstrapAdmin:Password"] ?? Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_PASSWORD");
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;
    var roles = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>(); var users = services.GetRequiredService<UserManager<AppUser>>();
    foreach (var role in new[] { "Administrator", "Editor" }) if (!await roles.RoleExistsAsync(role)) await roles.CreateAsync(new IdentityRole<Guid>(role));
    var user = await users.FindByEmailAsync(email); if (user is null) { user = new AppUser { UserName = email, Email = email, DisplayName = "Initial Administrator", EmailConfirmed = true, IsEnabled = true }; var result = await users.CreateAsync(user, password); if (!result.Succeeded) throw new InvalidOperationException("Bootstrap administrator could not be created. Check password policy and logs."); await users.AddToRoleAsync(user, "Administrator"); }
}

public sealed record ContactEnquiryInput(string? Name, string? Email, string? Organisation, string? Message);
public sealed record LoginInput(string? Email, string? Password);
public sealed record ContentPageInput(string? Slug, string? Title, string? Summary, string? Body, bool IsPublished, int SortOrder);
public sealed record UpdateEnquiryStatusInput(string Status);
public sealed class AppUser : IdentityUser<Guid> { public string DisplayName { get; set; } = ""; public bool IsEnabled { get; set; } = true; }
public sealed class ContactEnquiry { public Guid Id { get; set; } = Guid.NewGuid(); public required string Name { get; set; } public required string Email { get; set; } public string? Organisation { get; set; } public required string Message { get; set; } public DateTime CreatedAtUtc { get; set; } public required string Status { get; set; } public string? Notes { get; set; } }
public sealed class ContentPage { public Guid Id { get; set; } = Guid.NewGuid(); public required string Slug { get; set; } public required string Title { get; set; } public string? Summary { get; set; } public required string Body { get; set; } public bool IsPublished { get; set; } public int SortOrder { get; set; } public DateTime UpdatedAtUtc { get; set; } public required string UpdatedBy { get; set; } }
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<ContactEnquiry> ContactEnquiries => Set<ContactEnquiry>(); public DbSet<ContentPage> ContentPages => Set<ContentPage>();
    public DbSet<ContentEntry> ContentEntries => Set<ContentEntry>(); public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        var enquiry = modelBuilder.Entity<ContactEnquiry>(); enquiry.ToTable("contact_enquiries"); enquiry.HasKey(x => x.Id); enquiry.Property(x => x.Name).HasMaxLength(120).IsRequired(); enquiry.Property(x => x.Email).HasMaxLength(254).IsRequired(); enquiry.Property(x => x.Organisation).HasMaxLength(160); enquiry.Property(x => x.Message).HasMaxLength(5000).IsRequired(); enquiry.Property(x => x.Status).HasMaxLength(30).IsRequired(); enquiry.HasIndex(x => x.CreatedAtUtc); enquiry.HasIndex(x => x.Status);
        enquiry.Property(x => x.Notes).HasMaxLength(4000);
        var entry = modelBuilder.Entity<ContentEntry>(); entry.ToTable("content_entries"); entry.HasKey(x => x.Id); entry.HasIndex(x => new { x.Type, x.Slug }).IsUnique(); entry.Property(x => x.Type).HasMaxLength(40).IsRequired(); entry.Property(x => x.Slug).HasMaxLength(140).IsRequired(); entry.Property(x => x.Title).HasMaxLength(300).IsRequired(); entry.Property(x => x.Data).IsRequired(); entry.Property(x => x.UpdatedBy).HasMaxLength(254).IsRequired();
        var audit = modelBuilder.Entity<AuditEvent>(); audit.ToTable("audit_events"); audit.HasKey(x => x.Id); audit.HasIndex(x => x.AtUtc); audit.Property(x => x.Actor).HasMaxLength(254).IsRequired(); audit.Property(x => x.Action).HasMaxLength(80).IsRequired(); audit.Property(x => x.Entity).HasMaxLength(80).IsRequired(); audit.Property(x => x.EntityId).HasMaxLength(80); audit.Property(x => x.Detail).HasMaxLength(1000); audit.Property(x => x.Ip).HasMaxLength(64);
        var page = modelBuilder.Entity<ContentPage>(); page.ToTable("content_pages"); page.HasKey(x => x.Id); page.HasIndex(x => x.Slug).IsUnique(); page.Property(x => x.Slug).HasMaxLength(140).IsRequired(); page.Property(x => x.Title).HasMaxLength(200).IsRequired(); page.Property(x => x.Summary).HasMaxLength(500); page.Property(x => x.Body).HasMaxLength(50000).IsRequired(); page.Property(x => x.UpdatedBy).HasMaxLength(254).IsRequired();
    }
}
