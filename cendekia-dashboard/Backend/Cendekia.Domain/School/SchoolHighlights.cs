using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class SchoolHighlights
{
    public int Id { get; set; } = 1;
    [MaxLength(150)] public string Heading { get; set; } = "";
    [MaxLength(150)] public string Accent { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    public bool Enabled { get; set; } = true;
    public int Version { get; set; } = 1;
    public List<SchoolHighlightRecord> Cards { get; set; } = [];
}

public class SchoolHighlightRecord
{
    public int Id { get; set; }
    public int HighlightsId { get; set; }
    public int Position { get; set; }
    [MaxLength(100)] public string Title { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(500)] public string Text { get; set; } = "";
    [MaxLength(7)] public string Value { get; set; } = "0";
    [MaxLength(20)] public string Icon { get; set; } = "growth";
}

public class SchoolHighlightInput
{
    [Required, MaxLength(100)] public string Title { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(500)] public string Text { get; set; } = "";
    [Required, MaxLength(7), RegularExpression("^(0|[1-9][0-9]{0,5})\\+?$")] public string Value { get; set; } = "0";
    [Required, RegularExpression("^(classroom|educators|activities|laboratory|library|growth)$")] public string Icon { get; set; } = "growth";
}

public class SchoolHighlightsRequest
{
    [Required, MaxLength(150)] public string Heading { get; set; } = "";
    [MaxLength(150)] public string Accent { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    public bool Enabled { get; set; }
    [Required, MaxLength(12)] public List<SchoolHighlightInput> Cards { get; set; } = [];
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
