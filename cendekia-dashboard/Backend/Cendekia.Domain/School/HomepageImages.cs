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
    [MaxLength(1000), DisplayFormat(ConvertEmptyStringToNull = false)] public string HeroUrl { get; set; } = "";
    [MaxLength(1000), DisplayFormat(ConvertEmptyStringToNull = false)] public string DirectionUrl { get; set; } = "";
    [MaxLength(1000), DisplayFormat(ConvertEmptyStringToNull = false)] public string ProgramUrl { get; set; } = "";
    [Range(1, int.MaxValue)] public int Version { get; set; }
}

public class HomepageImageFile
{
    public int HomepageImagesId { get; set; } = 1;
    [MaxLength(10)] public string Slot { get; set; } = "";
    [MaxLength(30)] public string ContentType { get; set; } = "";
    public int OriginalLength { get; set; }
    public byte[] Content { get; set; } = [];
}
