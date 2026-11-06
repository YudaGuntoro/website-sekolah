using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Cendekia.Domain.Auth;
using Cendekia.Application.Abstractions;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Cendekia.WebAPI.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService service, IAntiforgery antiforgery, IWebHostEnvironment environment) : ApiControllerBase
{
    // Bearer endpoint is retained for non-browser integrations. Dashboard uses /session.
    [AllowAnonymous, HttpPost("login"), EnableRateLimiting("login"), RequestSizeLimit(4096)]
    public async Task<IActionResult> Login(LoginRequest request) {
        try { return ApiOk(await service.LoginAsync(request), "Login successful"); }
        catch (UnauthorizedAccessException) { return ApiUnauthorized("Nama pengguna atau kata sandi tidak valid."); }
    }

    [AllowAnonymous, HttpGet("csrf")]
    public IActionResult Csrf() => ApiOk(new { token = antiforgery.GetAndStoreTokens(HttpContext).RequestToken });

    [AllowAnonymous, HttpPost("session"), EnableRateLimiting("login"), RequestSizeLimit(4096)]
    public async Task<IActionResult> CreateSession(LoginRequest request) {
        try {
            var result = await service.LoginAsync(request);
            var options = SecurityConfiguration.SessionCookieOptions(environment.IsDevelopment());
            options.Expires = new DateTimeOffset(result.ExpiresAt);
            Response.Cookies.Append(SecurityConfiguration.SessionCookie, result.AccessToken, options);
            return ApiOk(new { expires_at = result.ExpiresAt, user = result.User });
        }
        catch (UnauthorizedAccessException) { return ApiUnauthorized("Nama pengguna atau kata sandi tidak valid."); }
    }

    [Authorize, HttpGet("session")]
    public IActionResult Session() => ApiOk(new {
        user = (UserResponse)HttpContext.Items["SessionUser"]!,
        expires_at = DateTimeOffset.FromUnixTimeSeconds(long.Parse(User.FindFirstValue("exp")!))
    });

    [Authorize, HttpPost("logout")]
    public async Task<IActionResult> Logout() {
        if (Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Jti), out var sessionId)) await service.RevokeSessionAsync(sessionId);
        Response.Cookies.Delete(SecurityConfiguration.SessionCookie, SecurityConfiguration.SessionCookieOptions(environment.IsDevelopment()));
        return ApiOk(new { loggedOut = true });
    }
}
