using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class HomepageImages
{
    public int Id { get; set; } = 1;
    [MaxLength(1000)] public string HeroUrl { get; set; } = "";
    [MaxLength(1000)] public string DirectionUrl { get; set; } = "";
    [MaxLength(1000)] public string ProgramUrl { get; set; } = "";
    public int Version { get; set; } = 1;
}

public class HomepageImagesRequest
{
    [MaxLength(1000)] public string HeroUrl { get; set; } = "";
    [MaxLength(1000)] public string DirectionUrl { get; set; } = "";
    [MaxLength(1000)] public string ProgramUrl { get; set; } = "";
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
