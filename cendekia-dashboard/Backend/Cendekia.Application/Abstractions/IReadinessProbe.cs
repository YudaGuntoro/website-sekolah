namespace Cendekia.Application.Abstractions;

public interface IReadinessProbe
{
    Task<bool> IsReadyAsync(CancellationToken cancellationToken);
}
