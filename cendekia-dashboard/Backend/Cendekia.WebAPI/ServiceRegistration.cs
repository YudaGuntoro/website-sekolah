using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Cendekia.Application.Abstractions;
using Cendekia.Domain.Auth;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Diagnostics;
using System.Text;
using System.Text.Json.Serialization;
using Cendekia.Persistence.Context;
using Cendekia.Persistence.IoC;
using Cendekia.Persistence.Services.AuthService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

namespace Cendekia.WebAPI;

public static class ServiceRegistration
{
    public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddApiSecurity(configuration, environment, jwtSettings);

        services.AddControllers()
            .ConfigureApplicationPartManager(manager => manager.FeatureProviders.Add(new CmsControllerFeatureProvider()))
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Cendekia CMS API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header. Example: Bearer {token}",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = !environment.IsDevelopment();
                options.SaveToken = false;
                options.IncludeErrorDetails = false;
                options.Events = new JwtBearerEvents {
                    OnMessageReceived = context => {
                        if (!context.Request.Headers.ContainsKey("Authorization") && context.Request.Cookies.TryGetValue(SecurityConfiguration.SessionCookie, out var token)) context.Token = token;
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = async context => {
                        var principal = context.Principal!;
                        if (!int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || !Guid.TryParse(principal.FindFirstValue(JwtRegisteredClaimNames.Jti), out var sessionId)) { context.Fail("Invalid session."); return; }
                        var auth = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
                        var user = await auth.ValidateSessionAsync(sessionId, userId, principal.Identity?.Name, principal.FindFirstValue(ClaimTypes.Role));
                        if (user is null) context.Fail("Invalid session.");
                        else context.HttpContext.Items["SessionUser"] = user;
                    }
                };
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role
                };
            });

        services.AddAuthorization(options =>
        {
            var authenticatedPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .Build();

            options.DefaultPolicy = authenticatedPolicy;
            options.FallbackPolicy = authenticatedPolicy;
        });

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=127.0.0.1;Port=3306;User ID=root;Password=;Database=cendekia_cms;SslMode=None;AllowPublicKeyRetrieval=True;";
        services.AddDbContext<CendekiaDbContext>(options =>
        {
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 34)));
        });

        services.AddIoCService();
    }

    public static void UseCendekiaApiPipeline(this WebApplication app)
    {
        app.UseExceptionHandler(handler => handler.Run(async context => {
            var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
            app.Logger.LogError(exception, "Unhandled API error. Trace {TraceId}", context.TraceIdentifier);
            context.Response.StatusCode = exception is BadHttpRequestException bad ? bad.StatusCode : 500;
            await context.Response.WriteAsJsonAsync(new { success = false, statusCode = context.Response.StatusCode, message = "Permintaan tidak dapat diproses. Silakan coba kembali.", traceId = context.TraceIdentifier });
        }));
        app.UseSerilogRequestLogging();
        app.UseForwardedHeaders();
        if (!app.Environment.IsDevelopment()) app.UseHsts();
        app.Use(async (context, next) => {
            context.Response.Headers.XContentTypeOptions = "nosniff";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            context.Response.Headers["X-Frame-Options"] = "DENY";
            context.Response.Headers.CacheControl = "no-store";
            await next();
        });

        var swaggerEnabled = app.Environment.IsDevelopment() || app.Configuration.GetValue("Swagger:Enabled", false);
        if (swaggerEnabled)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cendekia CMS API v1"));
        }

        // Internal health probes use HTTP; user traffic must use HTTPS in Production.
        if (!app.Environment.IsDevelopment()) app.UseWhen(context => !context.Request.Path.StartsWithSegments("/health"), branch => branch.UseHttpsRedirection());
        app.UseRouting();
        app.UseCors();
        app.UseRateLimiter();
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate, proxy-revalidate";
                context.Response.Headers.Pragma = "no-cache";
                context.Response.Headers.Expires = "0";
            }
            await next();
        });
        app.UseAuthentication();
        app.Use(async (context, next) => {
            var unsafeMethod = !HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method) && !HttpMethods.IsOptions(context.Request.Method);
            var sessionLogin = context.Request.Path.Equals("/api/auth/session") && HttpMethods.IsPost(context.Request.Method);
            if (unsafeMethod && (sessionLogin || (context.Request.Cookies.ContainsKey(SecurityConfiguration.SessionCookie) && !context.Request.Headers.ContainsKey("Authorization")))) {
                try { await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
                catch (AntiforgeryValidationException) {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsJsonAsync(new { success = false, statusCode = 403, message = "Sesi formulir tidak valid. Muat ulang halaman." });
                    return;
                }
            }
            await next();
        });
        app.UseAuthorization();
        app.MapControllers();
        app.MapGet("/health/live", () => Results.Json(new { status = "live" })).AllowAnonymous();
        app.MapGet("/health/ready", async (IReadinessProbe probe, CancellationToken cancellationToken) =>
            await probe.IsReadyAsync(cancellationToken) ? Results.Json(new { status = "ready" }) : Results.Json(new { status = "unavailable" }, statusCode: 503)).AllowAnonymous();
    }
}
