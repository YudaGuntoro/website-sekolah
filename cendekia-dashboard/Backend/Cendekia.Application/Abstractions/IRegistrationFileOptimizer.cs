using Cendekia.Domain.School;

namespace Cendekia.Application.Abstractions;

public interface IRegistrationFileOptimizer
{
    // Null means an invalid image or dimensions beyond the bounded decoder limit.
    Task<PaymentProofFile?> OptimizeAsync(PaymentProofFile file, CancellationToken cancellationToken = default);
}
