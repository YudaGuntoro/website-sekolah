using Cendekia.Application.Abstractions;
using Cendekia.Domain.Auth;
using Cendekia.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace Cendekia.Persistence.Repositories;

public sealed class ReadinessProbe(CendekiaDbContext db) : IReadinessProbe
{
    public async Task<bool> IsReadyAsync(CancellationToken cancellationToken) {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(3));
        try {
            // Verify schema as well as connectivity without exposing private data.
            await db.Set<AuthSession>().Select(x => x.Id).Take(1).ToListAsync(timeout.Token);
            return true;
        }
        catch { return false; }
    }
}
