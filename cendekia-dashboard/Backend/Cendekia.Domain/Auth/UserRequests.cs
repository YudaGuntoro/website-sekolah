using System.Text.Json.Serialization;
namespace Cendekia.Domain.Auth;
public class UserCreateRequest
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("role")]
    public AppUserRole Role { get; set; } = AppUserRole.VIEWER;

    [JsonPropertyName("status")]
    public AppUserStatus Status { get; set; } = AppUserStatus.ACTIVE;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class UserUpdateRequest
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("role")]
    public AppUserRole Role { get; set; } = AppUserRole.VIEWER;

    [JsonPropertyName("status")]
    public AppUserStatus Status { get; set; } = AppUserStatus.ACTIVE;
}
