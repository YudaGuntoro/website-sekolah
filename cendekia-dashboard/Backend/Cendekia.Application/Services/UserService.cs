using Cendekia.Application.Abstractions;
using Cendekia.Domain.Auth;
namespace Cendekia.Application.Services;
public class UserService(IEntityRepository<AppUser> repository, IApplicationUnitOfWork unitOfWork, IPasswordHasher hasher, IEntityRepository<AuthSession> sessions) : ApplicationService
{
    public async Task<ServiceResult> GetUsers(int page = 1, int limit = 10, string? search = null, bool? isActive = null) {
        page = Math.Clamp(page, 1, 100000); limit = Math.Clamp(limit, 1, 100);
        var keyword = search?.Trim();
        System.Linq.Expressions.Expression<Func<AppUser,bool>> filter = x => (string.IsNullOrEmpty(keyword) || x.Username.Contains(keyword) || x.FullName.Contains(keyword) || (x.Email != null && x.Email.Contains(keyword)) || (x.Phone != null && x.Phone.Contains(keyword))) && (!isActive.HasValue || x.Status == (isActive.Value ? AppUserStatus.ACTIVE : AppUserStatus.INACTIVE));
        var total = await repository.CountAsync(filter);
        var rows = await repository.SelectAsync(x => x, filter, x => x.FullName, skip: (page - 1) * limit, take: limit, thenBy: x => x.Username);
        return new ServiceResult(ResultKind.Success, rows.Select(ToResponse).ToList(), "Users retrieved successfully", new { page, limit, total, totalPage = (int)Math.Ceiling(total / (double)limit) });
    }
    public async Task<ServiceResult> GetUser(int id) { var x = await repository.FirstAsync(x => x.Id == id); return x is null ? ApiNotFound("User was not found.") : ApiOk(ToResponse(x)); }
    public async Task<ServiceResult> CreateUser(UserCreateRequest request) {
        var validation = ValidateUser(request.FullName, request.Username, request.Role, request.Status);
        if (validation is not null) return ApiBadRequest(validation);
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length is < 12 or > 128) return ApiBadRequest("Password must contain 12-128 characters.");
        if (await repository.AnyAsync(x => x.Username == request.Username.Trim())) return ApiBadRequest("Username is already registered.");
        var salt = hasher.CreateSalt(); var now = DateTime.UtcNow;
        var user = new AppUser { Username = request.Username.Trim(), FullName = request.FullName.Trim(), Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(), Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(), Role = request.Role, Status = request.Status, PasswordSalt = salt, PasswordHash = hasher.Hash(request.Password, salt), CreatedAt = now, UpdatedAt = now };
        repository.Add(user);
        try { await unitOfWork.SaveChangesAsync(); } catch (DuplicateRecordException) { return ApiBadRequest("Username or email is already registered."); }
        return ApiCreated(ToResponse(user), "User created successfully.");
    }
    public async Task<ServiceResult> UpdateUser(int id, UserUpdateRequest request) {
        var user = await repository.FirstAsync(x => x.Id == id, tracking: true); if (user is null) return ApiNotFound("User was not found.");
        var validation = ValidateUser(request.FullName, request.Username, request.Role, request.Status); if (validation is not null) return ApiBadRequest(validation);
        var username = request.Username.Trim(); if (await repository.AnyAsync(x => x.Id != id && x.Username == username)) return ApiBadRequest("Username is already registered.");
        if (user.Username != username || user.Role != request.Role || user.Status != request.Status) {
            foreach (var session in await sessions.ListAsync(x => x.UserId == id)) sessions.Remove(session);
        }
        user.Username = username; user.FullName = request.FullName.Trim(); user.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(); user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(); user.Role = request.Role; user.Status = request.Status; user.UpdatedAt = DateTime.UtcNow;
        try { await unitOfWork.SaveChangesAsync(); } catch (DuplicateRecordException) { return ApiBadRequest("Username or email is already registered."); }
        return ApiOk(ToResponse(user), "User updated successfully.");
    }
    public async Task<ServiceResult> DeleteUser(int id) { var user = await repository.FirstAsync(x => x.Id == id, tracking: true); if (user is null) return ApiNotFound("User was not found."); repository.Remove(user); await unitOfWork.SaveChangesAsync(); return ApiOk(true, "User deleted successfully."); }
    private static string? ValidateUser(
        string fullName,
        string username,
        AppUserRole role,
        AppUserStatus status)
    {
        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(username))
        {
            return "Full name and username are required.";
        }

        if (!Enum.IsDefined(role))
        {
            return "Selected role is not available.";
        }

        if (!Enum.IsDefined(status))
        {
            return "Selected status is not available.";
        }

        return null;
    }

    private static UserResponse ToResponse(AppUser user) => new()
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
