using System.ComponentModel.DataAnnotations;

namespace Cendekia.Domain.School;

public class SpmbInformation
{
    public int Id { get; set; } = 1;
    public SpmbInformationConfig Config { get; set; } = new();
    public List<SpmbInformationStepRecord> StepRecords { get; set; } = [];
    public List<SpmbDocumentRequirement> DocumentRecords { get; set; } = [];
    public int Version { get; set; } = 1;
}
public class SpmbInformationStepRecord
{
    public int Id { get; set; }
    public int InformationId { get; set; }
    public int Position { get; set; }
    [MaxLength(150)] public string Title { get; set; } = "";
    [MaxLength(3000)] public string Description { get; set; } = "";
    [MaxLength(20)] public string Icon { get; set; } = "register";
    public bool ShowPayment { get; set; }
}
public class SpmbDocumentRequirement
{
    public int Id { get; set; }
    public int InformationId { get; set; }
    [MaxLength(10)] public string ApplicantType { get; set; } = "new";
    public int Position { get; set; }
    [MaxLength(500)] public string Description { get; set; } = "";
}
public class SpmbInformationStep
{
    [Required, MaxLength(150)] public string Title { get; set; } = "";
    [MaxLength(3000)] public string Description { get; set; } = "";
    [Required, RegularExpression("^(register|folder|payment|test|check|book)$")] public string Icon { get; set; } = "register";
    public bool ShowPayment { get; set; }
}
public class SpmbInformationConfig
{
    [MaxLength(1000)] public string Introduction { get; set; } = "";
    [Required, MinLength(1), MaxLength(20)] public List<SpmbInformationStep> Steps { get; set; } = [];
    [Range(0, 1000000000)] public int FeeAmount { get; set; }
    [MaxLength(300)] public string PaymentDescription { get; set; } = "";
    [MaxLength(150)] public string BankName { get; set; } = "";
    [MaxLength(100)] public string AccountNumber { get; set; } = "";
    [MaxLength(150)] public string AccountHolder { get; set; } = "";
    [Required, MaxLength(40)] public List<string> NewStudentDocuments { get; set; } = [];
    [Required, MaxLength(40)] public List<string> TransferDocuments { get; set; } = [];
    [MaxLength(2000)] public string DocumentNotes { get; set; } = "";
    [MaxLength(1000)] public string BrochureUrl { get; set; } = "";
}
public class SpmbInformationRequest
{
    [Required] public SpmbInformationConfig Config { get; set; } = new();
    [Range(1, int.MaxValue)] public int Version { get; set; }
}
