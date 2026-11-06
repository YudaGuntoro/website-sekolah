using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class SchoolIdentity
{
    public int Id { get; set; } = 1;
    [MaxLength(4000)] public string Vision { get; set; } = "";
    [MaxLength(500)] public string Motto { get; set; } = "";
    public List<SchoolMissionRecord> MissionRecords { get; set; } = [];
    public int Version { get; set; } = 1;
}

public class SchoolMissionRecord
{
    public int Id { get; set; }
    public int IdentityId { get; set; }
    public int Position { get; set; }
    [MaxLength(150)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Text { get; set; } = "";
}

public class SchoolMission
{
    [Required, MaxLength(150)] public string Title { get; set; } = "";
    [Required, MaxLength(2000)] public string Text { get; set; } = "";
}

public class SchoolIdentityRequest
{
    [MaxLength(4000)] public string Vision { get; set; } = "";
    [MaxLength(500)] public string Motto { get; set; } = "";
    [Required, MaxLength(20)] public List<SchoolMission> Missions { get; set; } = [];
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
