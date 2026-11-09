using Cendekia.Domain.School;

namespace Cendekia.Application.Abstractions;

public interface IRegistrationFileOptimizer
{
    Task<CompressedPdf> CompressPdfAsync(byte[] content, CancellationToken cancellationToken = default);
    // Null means an invalid image or dimensions beyond the bounded decoder limit.
    Task<PaymentProofFile?> OptimizeAsync(PaymentProofFile file, CancellationToken cancellationToken = default);
}
