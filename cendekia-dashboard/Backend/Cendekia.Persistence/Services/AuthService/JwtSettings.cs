namespace Cendekia.Persistence.Services.AuthService;

public class JwtSettings
{
    public string Issuer { get; set; } = "Cendekia";
    public string Audience { get; set; } = "Cendekia.Frontend";
    public string SigningKey { get; set; } = "";
    public int ExpiresHours { get; set; } = 1;
}
