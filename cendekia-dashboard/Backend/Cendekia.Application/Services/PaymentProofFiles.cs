namespace Cendekia.Application.Services;

public record PaymentProofUpload(string FileName, byte[] Content);
public record PaymentProofDownload(string FileName, string ContentType, byte[] Content);
public static class PaymentProofFiles
{
    public static string? ContentType(PaymentProofUpload? upload)
    {
        if (upload is null || upload.Content.Length == 0 || upload.Content.Length > 1024 * 1024) return null;
        var bytes = upload.Content.AsSpan();
        var ext = Path.GetExtension(upload.FileName).ToLowerInvariant();
        if (ext == ".pdf" && bytes.Length >= 8 && bytes[..5].SequenceEqual("%PDF-"u8)) return "application/pdf";
        if (ext is ".jpg" or ".jpeg" && bytes.Length >= 4 && bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[2] == 0xff) return "image/jpeg";
        if (ext == ".png" && bytes.Length >= 8 && bytes[..8].SequenceEqual(new byte[] {137,80,78,71,13,10,26,10})) return "image/png";
        return null;
    }
    public static string Extension(string contentType) => contentType switch { "image/png" => ".png", "image/jpeg" => ".jpg", _ => ".pdf" };
}
