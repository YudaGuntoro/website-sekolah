namespace DentalCare.Persistence.Services.AuthService;

public class JwtSettings
{
    public string Issuer { get; set; } = "Cendekia";
    public string Audience { get; set; } = "Cendekia.Frontend";
    public string SigningKey { get; set; } = "Cendekia-Local-Development-Jwt-Signing-Key-2026-Change-Me";
    public int ExpiresHours { get; set; } = 8;
}
