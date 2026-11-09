using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class SpmbSettings
{
    public int Id { get; set; } = 1;
    [MaxLength(9)] public string AcademicYear { get; set; } = "2027/2028";
    public bool Enabled { get; set; }
    public int Version { get; set; } = 1;
}

public class SpmbWave
{
    public int Number { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool Enabled { get; set; }
}

public class AcademicYear
{
    [MaxLength(9)] public string Code { get; set; } = "";
}

public class SpmbWaveGroup
{
    [MaxLength(9)] public string AcademicYear { get; set; } = "";
    public int WaveNumber { get; set; }
    [MaxLength(300)] public string WhatsappGroupUrl { get; set; } = "";
}

// An immutable historical schedule. Revision is scoped to year and wave.
public class SpmbWavePeriod
{
    [MaxLength(9)] public string AcademicYear { get; set; } = "";
    public int WaveNumber { get; set; }
    public int Revision { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}

public class SpmbApplication
{
    public SpmbApplicantProfile? Profile { get; set; }
    public SpmbDocument? Document { get; set; }
    public SpmbPaymentProof? PaymentProof { get; set; }
    public int Id { get; set; }
    public Guid SubmissionKey { get; set; }
    [MaxLength(32)] public string RegistrationNumber { get; set; } = "";
    [MaxLength(9)] public string AcademicYear { get; set; } = "";
    public int WaveNumber { get; set; }
    public int WaveRevision { get; set; }
    public SpmbWavePeriod Period { get; set; } = null!;
    [MaxLength(150)] public string StudentName { get; set; } = "";
    [MaxLength(10)] public string? Nisn { get; set; }
    [MaxLength(100)] public string BirthPlace { get; set; } = "";
    public DateOnly BirthDate { get; set; }
    [MaxLength(20)] public string Gender { get; set; } = "";
    [MaxLength(150)] public string PreviousSchool { get; set; } = "";
    [MaxLength(4)] public string TargetGrade { get; set; } = "";
    [MaxLength(150)] public string GuardianName { get; set; } = "";
    [MaxLength(25)] public string GuardianPhone { get; set; } = "";
    [MaxLength(254)] public string? GuardianEmail { get; set; }
    [MaxLength(1000)] public string Address { get; set; } = "";
    [MaxLength(20)] public string Status { get; set; } = "Baru";
    public DateTime SubmittedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Version { get; set; } = 1;
}

public class SpmbWaveRequest
{
    [Range(1, 4)] public int Number { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    [MaxLength(300)] public string? WhatsappGroupUrl { get; set; }
}

public class SpmbSettingsRequest
{
    [Required, RegularExpression("^20[0-9]{2}/20[0-9]{2}$")] public string AcademicYear { get; set; } = "";
    public bool Enabled { get; set; }
    public int Version { get; set; }
    [Required, MinLength(4), MaxLength(4)] public List<SpmbWaveRequest> Waves { get; set; } = [];
}

public class SpmbSubmissionRequest
{
    [Required, MaxLength(100)] public string Nickname { get; set; } = "";
    [Required, RegularExpression("^Islam$")] public string Religion { get; set; } = "";
    [MaxLength(1000)] public string? MedicalHistory { get; set; } = "";
    [Range(typeof(decimal), "20", "300")] public decimal HeightCm { get; set; } = 0;
    [Range(typeof(decimal), "1", "500")] public decimal WeightKg { get; set; } = 0;
    [Required, RegularExpression("^(A|B|AB|O)$")] public string BloodGroup { get; set; } = "";
    [Required, RegularExpression("^\\+?[0-9][0-9 ()-]{7,24}$")] public string ParentPhone { get; set; } = "";
    [Required, MaxLength(150)] public string FatherName { get; set; } = "";
    [Required, MaxLength(150)] public string MotherName { get; set; } = "";
    [Required, MaxLength(150)] public string FatherOccupation { get; set; } = "";
    [Required, MaxLength(150)] public string MotherOccupation { get; set; } = "";
    [MaxLength(150)] public string? GuardianOccupation { get; set; } = "";
    [Required, MaxLength(1000)] public string ParentAddress { get; set; } = "";
    [Required, RegularExpression("^(Baik|Kurang Baik|Sangat Baik|Tidak Stabil)$")] public string EconomicCondition { get; set; } = "";
    [MaxLength(100)] public string? DailyLanguage { get; set; } = "";
    [Required, RegularExpression("^(Baru|Pindahan)$")] public string EntryType { get; set; } = "";

    [Required, MaxLength(150)] public string TransferAccountName { get; set; } = "";
    public Guid SubmissionKey { get; set; }
    public int ScheduleVersion { get; set; }
    [Required, MaxLength(150)] public string StudentName { get; set; } = "";
    [Required, RegularExpression("^[0-9]{10}$")] public string? Nisn { get; set; }
    [Required, MaxLength(100)] public string BirthPlace { get; set; } = "";
    public DateOnly BirthDate { get; set; }
    [Required, RegularExpression("^(Laki-laki|Perempuan)$")] public string Gender { get; set; } = "";
    [Required, MaxLength(150)] public string PreviousSchool { get; set; } = "";
    [Required, RegularExpression("^(VII|VIII|IX)$")] public string TargetGrade { get; set; } = "";
    [MaxLength(150)] public string? GuardianName { get; set; } = "";
    [Required, RegularExpression("^\\+?[0-9][0-9 ()-]{7,24}$")] public string GuardianPhone { get; set; } = "";
    [Required, EmailAddress, MaxLength(254)] public string? GuardianEmail { get; set; }
    [Required, MaxLength(1000)] public string Address { get; set; } = "";
    public bool Consent { get; set; }
}

public class SpmbStatusRequest
{
    [Required, RegularExpression("^(Baru|Diproses|Diterima|Ditolak)$")] public string Status { get; set; } = "Baru";
    public int Version { get; set; }
}

public class SpmbDocument
{
    public int ApplicationId { get; set; }
    public byte[] Content { get; set; } = [];
    public string Compression { get; set; } = "raw";
    public int OriginalLength { get; set; }
}
public record CompressedPdf(byte[] Content, string Compression, int OriginalLength);

public class SpmbApplicantProfile
{
    public int ApplicationId { get; set; }
    [Required, MaxLength(100)] public string Nickname { get; set; } = "";
    [Required, RegularExpression("^Islam$")] public string Religion { get; set; } = "";
    [MaxLength(1000)] public string MedicalHistory { get; set; } = "";
    [Range(typeof(decimal), "20", "300")] public decimal HeightCm { get; set; } = 0;
    [Range(typeof(decimal), "1", "500")] public decimal WeightKg { get; set; } = 0;
    [Required, RegularExpression("^(A|B|AB|O)$")] public string BloodGroup { get; set; } = "";
    [Required, RegularExpression("^\\+?[0-9][0-9 ()-]{7,24}$")] public string ParentPhone { get; set; } = "";
    [Required, MaxLength(150)] public string FatherName { get; set; } = "";
    [Required, MaxLength(150)] public string MotherName { get; set; } = "";
    [Required, MaxLength(150)] public string FatherOccupation { get; set; } = "";
    [Required, MaxLength(150)] public string MotherOccupation { get; set; } = "";
    [MaxLength(150)] public string GuardianOccupation { get; set; } = "";
    [Required, MaxLength(1000)] public string ParentAddress { get; set; } = "";
    [Required, RegularExpression("^(Baik|Kurang Baik|Sangat Baik|Tidak Stabil)$")] public string EconomicCondition { get; set; } = "";
    [MaxLength(100)] public string DailyLanguage { get; set; } = "";
}
