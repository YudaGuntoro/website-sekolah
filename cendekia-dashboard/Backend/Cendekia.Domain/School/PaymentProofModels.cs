using System.ComponentModel.DataAnnotations;
namespace Cendekia.Domain.School;

public class SpmbPaymentProof
{
    public int ApplicationId { get; set; }
    [MaxLength(150)] public string AccountHolderName { get; set; } = "";
    [MaxLength(30)] public string ContentType { get; set; } = "";
    public byte[] Content { get; set; } = [];
}
public class LmpPaymentProof
{
    public int ApplicationId { get; set; }
    [MaxLength(150)] public string AccountHolderName { get; set; } = "";
    [MaxLength(30)] public string ContentType { get; set; } = "";
    public byte[] Content { get; set; } = [];
}
public record PaymentProofInfo(string AccountHolderName);
public record PaymentProofFile(string ContentType, byte[] Content);
