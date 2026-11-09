using Cendekia.Application.Abstractions;
using Cendekia.Domain.School;
using SkiaSharp;
using System.IO.Compression;

namespace Cendekia.Persistence.Services.Shared;

public sealed class RegistrationFileOptimizer : IRegistrationFileOptimizer, IDisposable
{
    public const int MaxEdge = 2400;
    private const long MaxDecodedPixels = 12_000_000;
    private const int TargetBytes = 350 * 1024;
    // Singleton gate: decoded bitmaps cannot accumulate across concurrent uploads.
    private readonly SemaphoreSlim gate = new(1, 1);

    public async Task<PaymentProofFile?> OptimizeAsync(PaymentProofFile file, CancellationToken cancellationToken = default)
    {
        // Do not rewrite PDFs: bank documents can contain signatures or searchable text.
        if (file.ContentType == "application/pdf") return file;
        if (file.ContentType is not ("image/jpeg" or "image/png")) return null;
        await gate.WaitAsync(cancellationToken);
        try { return OptimizeImage(file); }
        finally { gate.Release(); }
    }

    public async Task<CompressedPdf> CompressPdfAsync(byte[] content, CancellationToken cancellationToken = default)
    {
        if (content.Length is < 1 or > 1048576) throw new ArgumentOutOfRangeException(nameof(content));
        await gate.WaitAsync(cancellationToken);
        try
        {
            using var output = new MemoryStream();
            using (var compressor = new BrotliStream(output, CompressionLevel.Optimal, leaveOpen: true))
                await compressor.WriteAsync(content, cancellationToken);
            return output.Length < content.Length
                ? new CompressedPdf(output.ToArray(), "br", content.Length)
                : new CompressedPdf(content, "raw", content.Length);
        }
        finally { gate.Release(); }
    }

    private static PaymentProofFile? OptimizeImage(PaymentProofFile file)
    {
        using var data = SKData.CreateCopy(file.Content);
        using var codec = SKCodec.Create(data);
        if (codec is null) return null;
        var info = codec.Info;
        if (info.Width <= 0 || info.Height <= 0 || info.Width > 20000 || info.Height > 20000 || (long)info.Width * info.Height > 80_000_000) return null;
        var decodeScale = Math.Min(1f, (float)MaxEdge / Math.Max(info.Width, info.Height));
        var dimensions = codec.GetScaledDimensions(decodeScale);
        if (dimensions.Width <= 0 || dimensions.Height <= 0 || (long)dimensions.Width * dimensions.Height > MaxDecodedPixels) return null;
        using var source = new SKBitmap(new SKImageInfo(dimensions.Width, dimensions.Height, SKColorType.Rgba8888, SKAlphaType.Premul));
        if (codec.GetPixels(source.Info, source.GetPixels()) != SKCodecResult.Success) return null;
        var swap = codec.EncodedOrigin is SKEncodedOrigin.LeftTop or SKEncodedOrigin.RightTop or SKEncodedOrigin.RightBottom or SKEncodedOrigin.LeftBottom;
        var orientedWidth = swap ? source.Height : source.Width;
        var orientedHeight = swap ? source.Width : source.Height;
        var scale = Math.Min(1f, (float)MaxEdge / Math.Max(orientedWidth, orientedHeight));
        var width = Math.Max(1, (int)Math.Round(orientedWidth * scale));
        var height = Math.Max(1, (int)Math.Round(orientedHeight * scale));
        using var bitmap = new SKBitmap(new SKImageInfo(width, height, SKColorType.Rgba8888, SKAlphaType.Opaque));
        using (var canvas = new SKCanvas(bitmap))
        {
            canvas.Clear(SKColors.White);
            canvas.Scale((float)width / orientedWidth, (float)height / orientedHeight);
            Orient(canvas, codec.EncodedOrigin, source.Width, source.Height);
            using var image = SKImage.FromBitmap(source);
            canvas.DrawImage(image, new SKRect(0, 0, source.Width, source.Height), new SKSamplingOptions(SKFilterMode.Linear));
        }
        using var output = SKImage.FromBitmap(bitmap);
        var best = file;
        foreach (var quality in new[] { 82, 78 })
        {
            using var encoded = output.Encode(SKEncodedImageFormat.Jpeg, quality);
            if (encoded is not null && encoded.Size < best.Content.Length) best = new PaymentProofFile("image/jpeg", encoded.ToArray());
            if (best.Content.Length <= TargetBytes) break;
        }
        return best;
    }

    private static void Orient(SKCanvas canvas, SKEncodedOrigin origin, int width, int height)
    {
        switch (origin)
        {
            case SKEncodedOrigin.TopRight: canvas.Translate(width, 0); canvas.Scale(-1, 1); break;
            case SKEncodedOrigin.BottomRight: canvas.Translate(width, height); canvas.RotateDegrees(180); break;
            case SKEncodedOrigin.BottomLeft: canvas.Translate(0, height); canvas.Scale(1, -1); break;
            case SKEncodedOrigin.LeftTop: canvas.RotateDegrees(90); canvas.Scale(1, -1); break;
            case SKEncodedOrigin.RightTop: canvas.Translate(height, 0); canvas.RotateDegrees(90); break;
            case SKEncodedOrigin.RightBottom: canvas.Translate(height, width); canvas.RotateDegrees(90); canvas.Scale(-1, 1); break;
            case SKEncodedOrigin.LeftBottom: canvas.Translate(0, width); canvas.RotateDegrees(270); break;
        }
    }

    public void Dispose() => gate.Dispose();
}
