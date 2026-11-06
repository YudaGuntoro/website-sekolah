using Cendekia.Domain.Auth;
namespace Cendekia.Application.Abstractions;
public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserResponse?> ValidateSessionAsync(Guid sessionId, int userId, string? username, string? role);
    Task RevokeSessionAsync(Guid sessionId);
    Task EnsureProductionReadyAsync();
}
