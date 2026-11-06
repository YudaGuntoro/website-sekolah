using System.Net;
using System.Text;
using System.Threading.RateLimiting;
using Cendekia.Persistence.Services.AuthService;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using MySqlConnector;

namespace Cendekia.WebAPI;

public static class SecurityConfiguration
{
    public const string SessionCookie = "cendekia_session";

    public static CookieOptions SessionCookieOptions(bool development) => new() {
        HttpOnly = true, Secure = !development, SameSite = SameSiteMode.Strict, Path = "/api", IsEssential = true
    };

    public static void AddApiSecurity(this IServiceCollection services, IConfiguration config, IHostEnvironment environment, JwtSettings jwt)
    {
        var development = environment.IsDevelopment();
        if (Encoding.UTF8.GetByteCount(jwt.SigningKey) < 32 || string.IsNullOrWhiteSpace(jwt.Issuer) || string.IsNullOrWhiteSpace(jwt.Audience) || jwt.ExpiresHours is < 1 or > 8)
            throw new InvalidOperationException("JWT requires a signing key of at least 32 bytes, issuer, audience and a lifetime of 1-8 hours.");
        if (!development) {
            if (jwt.SigningKey.Distinct().Count() < 16 || jwt.SigningKey.Contains("Development", StringComparison.OrdinalIgnoreCase) || jwt.SigningKey.Contains("Change-Me", StringComparison.OrdinalIgnoreCase) || jwt.SigningKey.Contains("REPLACE", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("A private production JWT signing key is required.");
            var hosts = config["AllowedHosts"]?.Split(';', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? [];
            if (hosts.Length == 0 || hosts.Any(x => x.Contains('*')))
                throw new InvalidOperationException("Production requires an explicit AllowedHosts list.");
            var connection = new MySqlConnectionStringBuilder(config.GetConnectionString("DefaultConnection") ?? "");
            if (connection.Database != "cendekia_cms" || string.IsNullOrWhiteSpace(connection.Password) || string.IsNullOrWhiteSpace(connection.UserID) || connection.UserID.Equals("root", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Production requires a dedicated database account and password for cendekia_cms.");
            if (string.IsNullOrWhiteSpace(config["Security:DataProtectionKeyPath"]))
                throw new InvalidOperationException("Production requires a persistent Security:DataProtectionKeyPath for CSRF keys.");
        }

        var origins = config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (origins.Any(x => x == "*" || !Uri.TryCreate(x, UriKind.Absolute, out var uri) || uri.AbsolutePath != "/" || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment) || !string.IsNullOrEmpty(uri.UserInfo) || (uri.Scheme != "https" && !(development && uri.Scheme == "http"))))
            throw new InvalidOperationException("CORS origins must be explicit HTTPS origins (HTTP is allowed only in Development).");
        services.AddCors(options => options.AddDefaultPolicy(policy => {
            policy.AllowAnyHeader().AllowAnyMethod();
            if (origins.Length > 0) policy.WithOrigins(origins);
            // Empty configuration permits no cross-origin browser access.
        }));
        services.Configure<ForwardedHeadersOptions>(options => {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 1;
            // Retain ASP.NET's loopback defaults; never trust arbitrary networks.
            foreach (var value in config.GetSection("ReverseProxy:KnownProxies").Get<string[]>() ?? []) {
                if (!IPAddress.TryParse(value, out var address)) throw new InvalidOperationException("KnownProxies must contain IP addresses.");
                options.KnownProxies.Add(address);
            }
        });
        var protection = services.AddDataProtection().SetApplicationName("Cendekia.Cms");
        if (config["Security:DataProtectionKeyPath"] is { Length: > 0 } path) protection.PersistKeysToFileSystem(new DirectoryInfo(path));
        services.AddAntiforgery(options => {
            options.HeaderName = "X-CSRF-TOKEN";
            options.Cookie.Name = "cendekia_csrf";
            options.Cookie.Path = "/api";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = development ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        });
        services.AddHttpsRedirection(options => options.HttpsPort = 443);
        services.AddRateLimiter(options => {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) => {
                context.HttpContext.Response.Headers.RetryAfter = "60";
                await context.HttpContext.Response.WriteAsJsonAsync(new { success = false, statusCode = 429, message = "Terlalu banyak permintaan. Coba kembali nanti." }, cancellationToken);
            };
            options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions {
                    PermitLimit = config.GetValue("RateLimits:LoginPerMinute", development ? 200 : 10), Window = TimeSpan.FromMinutes(1), QueueLimit = 0
                }));
            options.AddPolicy("registration", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions {
                    PermitLimit = config.GetValue("RateLimits:RegistrationsPerMinute", development ? 200 : 10), Window = TimeSpan.FromMinutes(1), QueueLimit = 0
                }));
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(_ => RateLimitPartition.GetConcurrencyLimiter("api", _ => new ConcurrencyLimiterOptions { PermitLimit = 100, QueueLimit = 0 }));
        });
    }
}
