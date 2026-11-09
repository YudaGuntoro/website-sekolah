using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class SchoolContent
{
    public Guid? ImageId { get; set; }
    public SchoolContentImage? Image { get; set; }
    public int Id { get; set; }
    [MaxLength(40)] public string Collection { get; set; } = "";
    [MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(220)] public string Slug { get; set; } = "";
    [MaxLength(200)] public string Category { get; set; } = "";
    [MaxLength(1000)] public string Summary { get; set; } = "";
    public string Body { get; set; } = "";
    [MaxLength(500)] public string ImageUrl { get; set; } = "";
    [MaxLength(1000)] public string PostUrl { get; set; } = "";
    [MaxLength(20)] public string Status { get; set; } = "Draft";
    public DateTime? PublishedAt { get; set; }
    public int SortOrder { get; set; }
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ContentRequest
{
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [Required, MaxLength(220), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public string Slug { get; set; } = "";
    [MaxLength(200)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Category { get; set; } = "";
    [MaxLength(1000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Summary { get; set; } = "";
    [MaxLength(100000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string Body { get; set; } = "";
    [MaxLength(500)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string ImageUrl { get; set; } = "";
    [MaxLength(1000)] [DisplayFormat(ConvertEmptyStringToNull = false)] public string PostUrl { get; set; } = "";
    [RegularExpression("^(Draft|Published)$")] public string Status { get; set; } = "Draft";
    public DateTime? PublishedAt { get; set; }
    [Range(0, 100000)] public int SortOrder { get; set; }
    public int Version { get; set; }
}

public class SchoolContentImage
{
    public Guid Id { get; set; }
    [MaxLength(30)] public string ContentType { get; set; } = "";
    public byte[] Content { get; set; } = [];
}
public record ContentImageFile(string ContentType, byte[] Content);
