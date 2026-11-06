using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class WebsiteSettings
{
    public int Id { get; set; } = 1;
    [MaxLength(25)] public string WhatsappNumber { get; set; } = "";
    [MaxLength(254)] public string Email { get; set; } = "";
    [MaxLength(1000)] public string Address { get; set; } = "";
    [MaxLength(500)] public string InstagramUrl { get; set; } = "";
    [MaxLength(500)] public string TiktokUrl { get; set; } = "";
    [MaxLength(500)] public string FacebookUrl { get; set; } = "";
    public int Version { get; set; } = 1;
}

public class WebsiteSettingsRequest
{
    [MaxLength(25)] public string WhatsappNumber { get; set; } = "";
    [MaxLength(254)] public string Email { get; set; } = "";
    [MaxLength(1000)] public string Address { get; set; } = "";
    [MaxLength(500)] public string InstagramUrl { get; set; } = "";
    [MaxLength(500)] public string TiktokUrl { get; set; } = "";
    [MaxLength(500)] public string FacebookUrl { get; set; } = "";
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
