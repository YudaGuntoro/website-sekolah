using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cendekia.Domain.Auth;
using Cendekia.Application.Abstractions;
using Cendekia.Persistence.Services.Shared;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Cendekia.Persistence.Services.AuthService;

public class AuthService : IAuthService
{
    private readonly IApplicationUnitOfWork _unitOfWork;
    private readonly IEntityRepository<AppUser> _users;
    private readonly JwtSettings _jwtSettings;
    private readonly IEntityRepository<AuthSession> _sessions;

    public AuthService(IApplicationUnitOfWork unitOfWork, IEntityRepository<AppUser> users, IOptions<JwtSettings> jwtOptions, IEntityRepository<AuthSession> sessions)
    {
        _unitOfWork = unitOfWork;
        _users = users;
        _jwtSettings = jwtOptions.Value;
        _sessions = sessions;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        var username = request.Username.Trim();
        var user = await _users.FirstAsync(x => x.Username == username, tracking: true);
        if (user is null) {
            AuthPasswordHasher.HashPassword(request.Password, "Y2VuZGVraWEtZHVtbXktc2FsdA==");
            throw new UnauthorizedAccessException("Invalid username or password.");
        }
        if (!AuthPasswordHasher.VerifyPassword(request.Password, user.PasswordSalt, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        if (user.Status != AppUserStatus.ACTIVE)
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        if (AuthPasswordHasher.NeedsRehash(user.PasswordHash)) {
            user.PasswordSalt = AuthPasswordHasher.CreateSalt();
            user.PasswordHash = AuthPasswordHasher.HashPassword(request.Password, user.PasswordSalt);
        }
        var loginAt = DateTime.UtcNow;
        var expiresAt = loginAt.AddHours(_jwtSettings.ExpiresHours);
        user.LastLoginAt = loginAt;
        user.UpdatedAt = loginAt;
        var sessionId = Guid.NewGuid();
        _sessions.Add(new AuthSession { Id = sessionId, UserId = user.Id, CreatedAt = loginAt, ExpiresAt = expiresAt });
        await _unitOfWork.SaveChangesAsync();

        return new LoginResponse
        {
            AccessToken = CreateJwt(user, sessionId, loginAt, expiresAt),
            TokenType = "Bearer",
            ExpiresAt = expiresAt,
            User = ToResponse(user)
        };
    }

    public async Task<UserResponse?> ValidateSessionAsync(Guid sessionId, int userId, string? username, string? role)
    {
        var session = await _sessions.FirstAsync(x => x.Id == sessionId && x.UserId == userId && x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow);
        if (session is null) return null;
        var user = await _users.FirstAsync(x => x.Id == userId);
        return user is not null && user.Status == AppUserStatus.ACTIVE && user.Username == username && user.Role.ToString() == role ? ToResponse(user) : null;
    }

    public async Task RevokeSessionAsync(Guid sessionId)
    {
        var session = await _sessions.FirstAsync(x => x.Id == sessionId, tracking: true);
        if (session is null) return;
        session.RevokedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task EnsureProductionReadyAsync()
    {
        // Also verifies the session schema exists before accepting traffic.
        await _sessions.CountAsync(x => x.ExpiresAt > DateTime.UtcNow);
        var users = await _users.ListAsync(x => x.Status == AppUserStatus.ACTIVE);
        if (users.Any(x => AuthPasswordHasher.VerifyPassword("admin123", x.PasswordSalt, x.PasswordHash)))
            throw new InvalidOperationException("Replace the seeded demo password before running in Production.");
    }

    private string CreateJwt(AppUser user, Guid sessionId, DateTime issuedAt, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, sessionId.ToString()),
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(issuedAt).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("username", user.Username),
            new("full_name", user.FullName),
            new("role", user.Role.ToString())
        };

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, user.Email));
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            notBefore: issuedAt,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserResponse ToResponse(AppUser user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            Status = user.Status,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
